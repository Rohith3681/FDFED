import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import Tour from './models/Tour.js';
import Booking from './models/Booking.js';
import redisClient from './config/redisClient.js';
import multer from 'multer';

const storage = multer.memoryStorage(); // or use diskStorage
const upload = multer({ storage });


const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const isAuthenticated = (req, res, next) => {
    const userName = req.cookies.userName;
    const userRole = req.cookies.userRole;
    console.log(userName)
    if (userName && userRole) {
        next(); // Proceed to the next middleware or route handler
    } else {
        res.status(401).json({ message: 'Unauthorized access: Missing or invalid cookies' });
    }
};

const isAdmin = (req, res, next) => {
    const userName = req.cookies.userName;
    const userRole = req.cookies.userRole;

    if (userName && userRole == 5150) {
        next(); // Proceed to the next middleware or route handler
    } else {
        res.status(401).json({ message: 'Unauthorized access: Missing or invalid cookies' });
    }
};

app.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({ id: '2120' });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/create', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { review } = req.body;
        const tour = await Tour.findById(id);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        tour.reviews.push(review);
        await tour.save();
        res.status(200).json({ message: 'Review added successfully', tour });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add review' });
    }
});

app.get('/tours', async (req, res) => {
    const startTime = Date.now();
    try {
        // Try to get tours from cache first
        const cachedTours = await redisClient.get('tours');
        
        if (cachedTours) {
            const endTime = Date.now();
            // console.log(`✅ Cache HIT for /tours - Time taken: ${endTime - startTime}ms`);
            return res.json(JSON.parse(cachedTours));
        }

        // If not in cache, get from database
        const tours = await Tour.find();
        const toursWithImagePath = tours.map(tour => ({
            ...tour._doc,
            photo: `${tour.image}`
        }));

        // Store in cache for 1 hour (3600 seconds)
        await redisClient.setEx('tours', 3600, JSON.stringify(toursWithImagePath));
        
        const endTime = Date.now();
        // console.log(`❌ Cache MISS for /tours - Time taken: ${endTime - startTime}ms`);
        res.json(toursWithImagePath);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/addToCart', isAuthenticated, async (req, res) => {
    try {
        const { tourId } = req.body;
        const name = req.cookies.userName;
        const role = req.cookies.userRole;

        if (role != 2120) {
            return res.status(400).json({ message: 'Invalid user or not authorized' });
        }

        const tour = await Tour.findById(tourId);
        const user = await User.findOne({ name });

        if (!tour) return res.status(404).json({ message: 'Tour not found' });

        const existingTour = user.cart.find(item => item.tour.toString() === tourId);
        if (existingTour) existingTour.quantity += 1;
        else user.cart.push({ tour: tourId, quantity: 1 });

        await user.save();

        res.status(200).json({ message: 'Tour added to cart successfully', cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/book', isAuthenticated, async (req, res) => {
    try {
        const username = req.cookies.userName;  
        const { tourId, name, phone, startDate, endDate, adults, children = 0 } = req.body;  

        if (!username || !tourId || !name || !phone || !startDate || !endDate || !adults) {
            return res.status(400).json({ message: 'You have already booked this tour' });
        }

        // Find the user first to check existing bookings
        const user = await User.findOne({ name: username }).populate('booking');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has already booked this tour
        const existingBooking = user.booking.find(booking => 
            booking.tour && booking.tour.toString() === tourId
        );
        
        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked this tour' });
        }

        const tour = await Tour.findById(tourId).populate('creator');
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        // Check if tour is fully booked
        if (tour.count === 0 || tour.bookedBy.length >= tour.maxBookings) {
            return res.status(400).json({ message: 'Tour is fully booked' });
        }

        const totalCost = (tour.price * adults) + (tour.price * children);
        const adminShare = totalCost * 0.1;
        const employeeShare = totalCost * 0.9;  

        const newBooking = new Booking({
            name,
            phone,
            startDate,
            endDate,
            adults,
            children,
            tour: tourId,
            cost: totalCost,
            user: user._id // Add reference to user
        });

        const savedBooking = await newBooking.save();

        // Update user's bookings
        await User.findByIdAndUpdate(
            user._id,
            { 
                $push: { booking: savedBooking._id },
                $pull: { cart: { tour: tourId } } // Remove from cart if present
            },
            { new: true }
        );

        // Update tour details
        await Tour.findByIdAndUpdate(
            tourId,
            { 
                $push: { bookedBy: user._id },
                $inc: { 
                    revenue: totalCost,
                    count: -1 // Decrease available spots
                } 
            },
            { new: true }
        );

        const admins = await Admin.find();
        if (!admins.length) {
            return res.status(404).json({ message: 'No admins found' });
        }

        await Admin.updateMany({}, { $inc: { revenue: adminShare } });

        if (tour.creator) {
            await User.findByIdAndUpdate(
                tour.creator._id, 
                { $inc: { revenue: employeeShare } }
            );
        }

        res.status(201).json({ 
            message: 'Booking successful', 
            booking: savedBooking,
            remainingSpots: tour.count - 1
        });

    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete("/cancel/:id", async (req, res) => {
    console.log(req.params);  
    try {
        const { id } = req.params;
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        await Booking.findByIdAndDelete(id);

        await User.updateMany(
            { bookings: id }, 
            { $pull: { bookings: id } }
        );

        res.status(200).json({ message: "Booking canceled successfully and removed from user records" });
    } catch (error) {
        res.status(500).json({ message: "Error canceling booking", error });
    }
});

app.delete('/cart/remove/:tourId', isAuthenticated, async (req, res) => {
    try {
        const { tourId } = req.params;
        const name = req.cookies.userName;

        const user = await User.findOne({ name });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.cart = user.cart.filter(item => item.tour && item.tour.toString() !== tourId);
        await user.save();

        res.status(200).json({ message: 'Tour removed from cart successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/tours/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tour = await Tour.findById(id);
        if (!tour) return res.status(404).json({ message: 'Tour not found' });

        await User.findByIdAndUpdate(tour.creator, { $pull: { tour: id } });
        await User.updateMany({ _id: { $in: tour.bookedBy } }, { $pull: { booking: id } });
        await Booking.deleteMany({ tour: id });
        await Tour.findByIdAndDelete(id);

        await redisClient.del(`tour:${id}`);
        await redisClient.del('tours');

        res.status(200).json({ message: 'Tour deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tour', error: error.message });
    }
});

export default app;
