import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './mongo.js'
import User from "./models/User.js";
import ROLES from './roles.js'
import session from "express-session";
import mongoDBSession from "connect-mongodb-session";
import Tour from "./models/Tour.js";
import Booking from "./models/Booking.js"
import Admin from "./models/Admin.js";
import multer from 'multer';
import { getUserAndEmployeeCounts, getLoggedInNames } from './controllers/auth-controller.js';
import userRoutes from './Routes/userRoutes.js';

const MongoDBStore = mongoDBSession(session);

const store = new MongoDBStore({
    uri: "mongodb://localhost:27017/tours",
    collection: "sessions",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../Frontend/uploads/'); // Specify your uploads directory
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname.replace(/\\/g, '/')}`; // Ensure forward slashes in filename
        cb(null, fileName);
    }
});

const upload = multer({ storage });

app.use(cors({
    origin: 'http://localhost:5173', // Your frontend origin
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: 'I am Iron Man',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, employeeId } = req.body;

        // Email validation using regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send("Invalid email format");
        }

        // Password validation - minimum 8 characters, at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@])[A-Za-z\d@]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).send("Password must be at least 8 characters long and include at least one letter and one number");
        }

        let id;
        if (role === 'user') {
            id = '2120';
        } else if (role === 'employee') {
            if (employeeId !== '8180') {
                return res.status(400).send("Invalid ID for employee role");
            }
            id = '8180';
        } else {
            return res.status(400).send("Invalid role");
        }

        const user = new User({
            name,
            email, // Save the email in the database
            password,
            id,
            role,
            ...(role === 'employee' ? { booking: [] } : {}),
            ...(role === 'user' ? { ticket: [] } : {})
        });

        await user.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

app.post("/login", async(req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set isLoggedIn to true when the user successfully logs in
        user.isLoggedIn = true;

        // Save the updated user document
        await user.save();

        // Set session details for logged-in users
        req.session.isAuth = true;
        req.session.user = {
            name: user.name,
            role: user.id === ROLES['employee'] ? 'employee' : 'user',
            id: user.id // Store the user id as well
        };

        res.status(200).json({
            message: "Login successful",
            role: user.id
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

app.post('/adminSignup', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
      const existingAdmin = await Admin.findOne({ name });

      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists.' });
      }

      // Store password as plain text (Not recommended for production environments)
      const newAdmin = new Admin({
        name,
        password, // No hashing here, storing as it is
      });

      await newAdmin.save();
      res.status(201).json({ message: 'Admin created successfully.' });
    } catch (err) {
      console.error('Error signing up admin:', err);
      res.status(500).json({ message: 'Internal server error.' });
    }
});

// Logout endpoint
app.post('/logout', async(req, res) => {
    if (!req.session.user) {
        return res.status(400).json({ message: 'No user is logged in' });
    }

    const user = await User.findOne({ name: req.session.user.name });
    if (user) {
        user.isLoggedIn = false; // Mark user as logged out
        await user.save();
    }

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.clearCookie('connect.sid');
        res.status(200).send('Logged out successfully');
    });
});

app.get('/tour-info', async (req, res) => {
    try {
        // Count the total number of tours
        const AdminRevenue = await Admin.find()
        const totalTours = await Tour.countDocuments();

        // Fetch all users and calculate the total number of bookings
        const users = await User.find().populate('booking');
        const totalBookings = users.reduce((acc, user) => acc + user.booking.length, 0);

        // Return the counts
        return res.json({
            totalTours,
            totalBookings
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/adminRevenue', async (req, res) => {
    try {
      const admin = await Admin.findOne({ id: '5150' }); // Fetch the admin with id "5150"
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      return res.json({ revenue: admin.revenue }); // Return the revenue
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  

app.get('/users', async (req, res) => {
    try {
      const users = await User.find({ id: '2120' }); // Fetch users with id = 2120
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

app.get('/tours', async (req, res) => {
    try {
        const tours = await Tour.find();

        // Map through the tours to modify the photo field
        const toursWithImagePath = tours.map(tour => ({
            ...tour._doc, // Spread the original tour document
            photo: `${tour.image}` // Update the photo path
        }));

        res.json(toursWithImagePath);
    } catch (error) {
        console.error('Error fetching tours:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/user/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ name: username })
            .populate({
                path: 'booking',
                populate: {
                    path: 'tour', // Assuming each booking has a reference to the tour
                    model: 'Tour'
                }
            });

        if (user) {
            const today = new Date();

            const completedBookings = user.booking.filter(
                (booking) => new Date(booking.endDate) < today
            );
            const ongoingBookings = user.booking.filter(
                (booking) => new Date(booking.startDate) <= today && new Date(booking.endDate) >= today
            );
            const upcomingBookings = user.booking.filter(
                (booking) => new Date(booking.startDate) > today
            );

            res.json({
                user: user.name,
                completedBookings,
                ongoingBookings,
                upcomingBookings,
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/create', upload.single('image'), async (req, res) => {
    const {
        title,
        city,
        address,
        distance,
        price,
        desc,
        username,
    } = req.body;

    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const imagePath = `uploads/${req.file.filename}`;
        const newTour = new Tour({
            title,
            city,
            address,
            distance,
            price,
            desc,
            creator: user._id,
            image: imagePath,
            count: 0,
            bookedBy: []  // Initially, no one has booked the tour
        });

        await newTour.save();

        if (user.role === 'employee') {
            user.booking.push(newTour._id);
            await user.save();
        }

        res.status(201).json({ message: 'Tour created successfully', tour: newTour });
    } catch (error) {
        console.error('Error creating tour:', error);
        res.status(500).json({ message: 'Error creating tour' });
    }
});

app.post('/book', async (req, res) => {
    try {
        const { username, tourId, name, phone, startDate, endDate, adults, children } = req.body;

        if (!username || !tourId || !name || !phone || !startDate || !endDate || !adults) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        const totalCost = (tour.price * adults) + (tour.price * children);
        const adminShare = totalCost * 0.1;
        const employeeShare = totalCost;

        const newBooking = new Booking({
            name,
            phone,
            startDate,
            endDate,
            adults,
            children,
            tour: tourId,
            cost: totalCost,
        });

        const savedBooking = await newBooking.save();

        const user = await User.findOneAndUpdate(
            { name: username },
            { $push: { booking: savedBooking._id } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedTour = await Tour.findById(tourId).populate('creator');
        if (!updatedTour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        // Push the user's _id into the bookedBy array of the tour
        await Tour.findByIdAndUpdate(
            tourId,
            { $push: { bookedBy: user._id } }
        );

        const admin = await Admin.findOne();
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await Admin.findByIdAndUpdate(
            admin._id,
            { $inc: { revenue: adminShare } }
        );
    
        if (updatedTour.creator) {
            await User.findByIdAndUpdate(
                updatedTour.creator,
                { $inc: { revenue: employeeShare } }
            );
        }

        const user12 = await User.findById(updatedTour.creator);
        console.log(user12.revenue)

        res.status(201).json({ message: 'Booking successful', booking: savedBooking });
    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/dashboard/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ name: username, role: 'employee' });
        if (!user) {
            return res.status(404).json({ message: 'User not found or not an employee' });
        }

        const tours = await Tour.find({ creator: user._id })
            .populate('bookedBy', 'name') // Populate bookedBy with user names
            .exec();

        console.log(tours); // Log the fetched tours for debugging

        // Create an array to hold booked user names for each tour
        const toursWithBookedUserNames = tours.map(tour => ({
            ...tour.toObject(), // Convert tour to a plain object
            bookedByNames: tour.bookedBy.map(user => user.name) // Extract user names from bookedBy
        }));

        res.status(200).json({
            username: user.name,
            revenue: user.revenue,
            tours: toursWithBookedUserNames, // Return tours with booked user names
        });
    } catch (error) {
        console.error('Error fetching tours:', error);
        res.status(500).json({ message: 'Error fetching tours' });
    }
});


app.post('/adminLogin', async (req, res) => {
    const { name, password } = req.body;
  
    if (!name || !password) {
      return res.status(400).json({ message: 'Please provide both name and password' });
    }
  
    try {
      // Check if the admin already exists
      const existingAdmin = await Admin.findOne({ name: name, password: password });
  
      if (existingAdmin) {
        return res.status(200).json({
          message: 'Admin already registered',
          id: existingAdmin.id
        });
      }
      
      // Create a new admin with the auto-assigned ID '5150'
      const newAdmin = new Admin({
        name,
        password,
        id: '5150' // Assign the static ID '5150'
      });
  
      await newAdmin.save(); // Save the admin details in MongoDB
  
      return res.status(201).json({
        message: 'Admin registered successfully',
        id: newAdmin.id
      });
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred while processing your request' });
    }
  });

  // Route to fetch bookings from the last 3 months
app.get('/admin/recent-bookings', async(req, res) => {
    try {
        // Get the date three months ago from today
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Find all bookings created in the last 3 months
        const recentBookings = await Booking.find({
                createdAt: { $gte: threeMonthsAgo }
            })
            .populate('tour', 'title') // Populate the tour field with the tour's title
            .exec();

        console.log(recentBookings); // Log the fetched bookings for debugging

        res.status(200).json({
            recentBookings, // Send the list of recent bookings
        });
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({ message: 'Error fetching recent bookings' });
    }
});

app.put( '/updateTours/:id',async(req, res) => {
    try {
        const { id } = req.params;
        const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.status(200).json({ message: 'Tour updated successfully', updatedTour });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update tour' });
    }
});

app.delete('/deleteTours/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const deletedTour = await Tour.findByIdAndDelete(id);
        if (!deletedTour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.status(200).json({ message: 'Tour deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete tour' });
    }
});

app.post('/tours/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const { review } = req.body;

        const tour = await Tour.findById(id);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        // Add the review to the reviews array
        tour.reviews.push(review);
        await tour.save();

        res.status(200).json({ message: 'Review added successfully', tour });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Failed to add review' });
    }
});

app.get('/tours/:id', async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json(tour); // Send the entire tour object, including reviews
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tour' });
    }
});

app.get('/tours/search/:location', async (req, res) => {
    const { location } = req.params; // Use req.params to get the location
  
    try {
      const tours = await Tour.find({ city: { $regex: location, $options: 'i' } });
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: 'Error searching for tours' });
    }
  });
  

app.get('/api/user-employee-counts', getUserAndEmployeeCounts);

app.get('/api/loggedin-names', getLoggedInNames);

app.use('/api', userRoutes);

app.listen(8000, () => {
    console.log("Server started on port 8000");
});
