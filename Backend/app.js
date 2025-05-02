import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import Tour from './models/Tour.js';
import Booking from './models/Booking.js';
import redisClient from './config/redisClient.js';

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
