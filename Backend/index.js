import express from "express";
import cors from 'cors';
import './mongo.js'
import User from "./models/User.js";
import ROLES from './roles.js'
import session from "express-session";
import mongoDBSession from "connect-mongodb-session";
import Tour from "./models/Tour.js";
import Booking from "./models/Booking.js"
import multer from 'multer';

const MongoDBStore = mongoDBSession(session);

const store = new MongoDBStore({
    uri: "mongodb://localhost:27017/tours",
    collection: "sessions",
});

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify your uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
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
        const { name, password, role, employeeId } = req.body;
        console.log(role);
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
            role,
            ...(role === 'employee' ? { booking: [] } : {}),
            ...(role === 'user' ? { ticket: [] } : {})
            // booking and ticket fields will be initialized with defaults (empty arrays)
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

app.post('/book', async (req, res) => {
    try {
        const { username, tourId, name, phone, startDate, endDate, adults, children } = req.body;
        // Validate required fields
        if (!username || !tourId || !name || !phone || !startDate || !endDate || !adults) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }
        console.log(endDate)
        // Create a new booking
        const newBooking = new Booking({
            name,
            phone,
            startDate,
            endDate,
            adults,
            children,
            tour: tourId, // Tour reference
        });
        
        // Save the booking to the database
        const savedBooking = await newBooking.save();
        console.log(username)
        // Update the user's bookings array by pushing the saved booking's ID
        const user = await User.findOne({ name: username });
        console.log(user)
        if (user) {
            user.booking.push(savedBooking._id); // Push the booking ID to 'booking' array
            await user.save(); // Save the updated user document
        }

        console.log("hello")
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send response with the saved booking
        res.status(201).json({ message: 'Booking successful', booking: savedBooking });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/tours', async (req, res) => {
    try {
        const tours = await Tour.find();

        // Map through the tours to modify the photo field
        const toursWithImagePath = tours.map(tour => ({
            ...tour._doc, // Spread the original tour document
            photo: `..\Backend\${tour.image}` // Update the photo path
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
        // Find the user and populate the bookings array with the Tour documents
        const user = await User.findOne({ name: username });
        if(user.id == '2120') user.populate('ticket')

        if(user.id === '8180') user.populate('booking')

        if (user) {
            res.json(user); // Send the user details, including populated bookings (tours)
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
        maxGroupSize,
        desc,
        username,
    } = req.body;

    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newTour = new Tour({
            title,
            city,
            address,
            distance,
            price,
            maxGroupSize,
            desc,
            creator: user._id,
            image: req.file.path, // Save the image path
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
        const { userId, tourId, name, phone, startDate, endDate, adults, children } = req.body;

        // Validate required fields
        if (!userId || !tourId || !name || !phone || !startDate || !endDate || !adults) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        // Create a new booking
        const newBooking = new Booking({
            name,
            phone,
            startDate,
            endDate,
            adults,
            children,
            tour: mongoose.Types.ObjectId(tourId),
        });

        // Save the booking to the database
        await Booking.save();

        // Update the user's bookings array
        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { bookings: savedBooking._id } },
            { new: true } // Return the updated user document
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(201).json({ message: 'Booking successful', booking: savedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(8000, () => {
    console.log("Server started on port 8000");
});
