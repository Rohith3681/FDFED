import express from "express";
import cors from 'cors';
import './mongo.js'
import User from "./models/User.js";
import ROLES from './roles.js'
import session from "express-session";
import mongoDBSession from "connect-mongodb-session";
import Tour from "./models/Tour.js";

const MongoDBStore = mongoDBSession(session);

const store = new MongoDBStore({
    uri: "mongodb://localhost:27017/tours",
    collection: "sessions",
});

const app = express();
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
        const { name, password, role, employeeId } = req.body;

        // Initialize variables for user/employee-specific fields
        let userSpecificField = [];
        let employeeSpecificField = [];
        let id;

        // Assign ID based on role
        if (role === 'user') {
            id = '2120'; // Automatically assign 2120 for users
        } else if (role === 'employee') {
            // Validate the employeeId
            if (employeeId !== '8180') {
                return res.status(400).send("Invalid ID for employee role");
            }
            id = '8180'; // Assign 8180 if the employeeId is valid
        } else {
            return res.status(400).send("Invalid role");
        }

        // Create the new user object with appropriate fields
        const user = new User({
            name,
            password,
            id,  // '2120' for user, '8180' for employee
            userSpecificField,
            employeeSpecificField
        });

        await user.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});



app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.isAuth = true;
        req.session.user = {
            name: user.name,
            role: user.id === ROLES['employee'] ? 'employee' : 'user'
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

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.clearCookie('connect.sid');
        res.status(200).send('Logged out successfully');
    });
});

app.post('/create', async (req, res) => {
    try {
        const { title, city, address, distance, price, maxGroupSize, desc, reviews, username } = req.body;
        // Find the user by username
        const user = await User.findOne({ name: username });
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const creatorId = user._id;

        // Create a new tour with the found user's ID
        const newTour = new Tour({
            title,
            city,
            address,
            distance,
            price,
            maxGroupSize,
            desc,
            reviews,
            creator: creatorId
        });

        // Save the new tour
        await newTour.save();

        // Add the new tour's ID to the user's bookings
        user.bookings.push(newTour._id);
        await user.save();

        // Respond with success
        res.status(201).json({ message: 'Tour created successfully', newTour });
    } catch (error) {
        console.error('Error in /create route:', error);
        res.status(500).json({ message: 'Failed to create tour', error });
    }
});



app.get('/user/profile/:username', async (req, res) => {
    try {
        const { username } = req.params; // Get username from route parameters
        const user = await User.findOne({ name: username }); // Use `name` field to find user

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(8000, () => {
    console.log("Server started on port 8000");
});
