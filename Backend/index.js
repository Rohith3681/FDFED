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
import MongoStore from 'connect-mongo'
import cookieParser from "cookie-parser";
import { request } from "http";


// const MongoDBStore = mongoDBSession(session);

// const store = new MongoDBStore({
//     uri: "mongodb://localhost:27017/tours",
//     collection: "sessions",
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());

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

const isAuthenticated = (req, res, next) => {
    const userName = req.cookies.userName;
    const userRole = req.cookies.userRole;

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

app.get("/refresh", isAuthenticated, async (req, res) => {
    try {
        const name = req.cookies.userName;
        const rol = req.cookies.userRole;

        const user = await User.findOne({ name });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User found:", user.name);

        user.isLoggedIn = true;
        await user.save();

        let cartDetails = [];
        if (user.role === "user" && Array.isArray(user.cart)) {
            const tourIds = user.cart.map((item) => item._id);
            const tours = await Tour.find({ _id: { $in: tourIds } }, "title price image");
            cartDetails = user.cart.map((item) => {
                const tour = tours.find((tour) => tour._id.toString() === item._id.toString());
                return {
                    _id: item._id,
                    title: tour?.title || "",
                    price: tour?.price || 0,
                    image: `${tour?.image}` || "",
                };
            });
        }

        console.log("Cart Details:", cartDetails);

        const responseData = {
            role: rol,
            username: name,
            cart: cartDetails,
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in /refresh endpoint:", error);
        res.status(500).send("Server error");
    }
});

app.post('/addToCart', isAuthenticated, async (req, res) => {
    try {
      const { tourId } = req.body;  // Expecting the tour ID in the request body
      const name = req.cookies.userName;
      const role = req.cookies.userRole;
      // Check if the user exists and is a valid user
      if (role != 2120) {
        return res.status(400).json({ message: 'Invalid user or not authorized' });
      }
  
      // Check if the tour exists in the database
      const tour = await Tour.findById(tourId);
      const user = await User.findOne({ name: name });
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
  
      // Add the tour to the user's cart (check if it already exists in the cart)
      const existingTour = user.cart.find(item => item.tour.toString() === tourId);
      if (existingTour) {
        // If tour already in cart, update quantity
        existingTour.quantity += 1;
      } else {
        // Otherwise, add new tour to the cart
        user.cart.push({ tour: tourId, quantity: 1 });
      }
  
      await user.save();
  
      res.status(200).json({ message: 'Tour added to cart successfully', cart: user.cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.delete('/cart/remove/:tourId', isAuthenticated, async (req, res) => {
    try {
        const { tourId } = req.params;
        const name = req.cookies.userName;
        const role = req.cookies.userRole;

        const user = await User.findOne({ name: name });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out the tour from the cart, ensuring that item.tour exists
        user.cart = user.cart.filter((item) => item.tour && item.tour.toString() !== tourId);

        await user.save();

        res.status(200).json({ message: 'Tour removed from cart successfully.' });
    } catch (error) {
        console.error('Error removing tour from cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/users', isAuthenticated, async (req, res) => {
    try{
        const users = await User.find({ id: '2120' });
        res.json(users);
    }catch (error){
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

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


app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        user.isLoggedIn = true;
        await user.save();
        const rol = user.role == "user" ? 2120 : 8180;
        // Set cookies for name and role
        res.cookie('userName', user.name, {
            httpOnly: false, // Prevent JavaScript access to the cookie
            secure: false, // Set to true if using HTTPS
            sameSite: 'lax', // Restrict the cookie to same-site requests
            path: '/'
        });

        res.cookie('userRole', rol, {
            httpOnly: false, // Prevent JavaScript access to the cookie
            secure: false, // Set to true if using HTTPS
            sameSite: 'lax', // Restrict the cookie to same-site requests
            path: '/'
        });

        
        console.log('Cookies set:', { userName: user.name, userRole: user.role });
        
        let cartDetails = [];
        if (user.role === "user" && Array.isArray(user.cart)) {
            const tourIds = user.cart.map((item) => item._id);
            const tours = await Tour.find({ _id: { $in: tourIds } }, "title price image");
            cartDetails = user.cart.map((item) => {
                const tour = tours.find((tour) => tour._id.toString() === item._id.toString());
                return {
                    _id: item._id,
                    title: tour?.title || "",
                    price: tour?.price || 0,
                    image: `${tour?.image}` || "",
                };
            });
        }

        const responseData = {
            message: "Login successful",
            role: user.id,
            cart: cartDetails,
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
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
app.post('/logout', isAuthenticated, async (req, res) => {
    const { cart } = req.body; // Get the cart data from the request body
    const userName = req.cookies.userName;
    const userRole = req.cookies.userRole;
    console.log(userName)
    try {
        // Retrieve the user name from the cookies
        const userName = req.cookies.userName; // Get `userName` from cookies
        if (!userName) {
            return res.status(400).json({ message: 'No user is logged in' });
        }

        // Find the user in the database
        const user = await User.findOne({ name: userName });
        if (user) {
            user.isLoggedIn = false; // Mark the user as logged out

            // Update the user's cart if provided in the request body
            if (cart && Array.isArray(cart) && user.role === 'user') {
                user.cart = cart.map((item) => ({
                    _id: item._id, // Store only the tour ID
                }));
            }

            await user.save();
        }

        // Clear cookies by name
        res.clearCookie('userName', {
            httpOnly: true, // Ensure settings match those used when setting the cookie
            sameSite: 'lax', // Match the `sameSite` setting when the cookie was set
            path: '/'
        });

        res.clearCookie('userRole', {
            httpOnly: true,
            sameSite: 'lax',
            path: '/'
        });

        // Send a successful response
        res.status(200).json({ message: 'Logged out successfully', resetCart: true });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.post('/adminLogout', async (req, res) => {
    const userName = req.cookies.userName;

    try {
        // Check if the admin is logged in by verifying the cookie
        if (!userName) {
            return res.status(400).json({ message: 'No admin is logged in' });
        }

        // Clear the cookies
        res.clearCookie('userName', {
            httpOnly: true,  // Ensure settings match those used when setting the cookie
            sameSite: 'lax', // Match the sameSite setting when the cookie was set
            path: '/'        // Clear the cookie for all paths
        });

        res.clearCookie('userRole', {
            httpOnly: true,  // Ensure settings match those used when setting the cookie
            sameSite: 'lax', // Match the sameSite setting when the cookie was set
            path: '/'        // Clear the cookie for all paths
        });

        // Send a successful response
        res.status(200).json({ message: 'Admin logged out successfully' });
    } catch (error) {
        // Handle any errors
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


app.get('/tour-info', isAuthenticated, async (req, res) => {
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

app.get('/adminRevenue', isAdmin, async (req, res) => {
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
  

app.get('/users', isAdmin, async (req, res) => {
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


app.get('/user/profile', isAuthenticated, async (req, res) => {
    try {
        const username = req.cookies.userName; // Access the specific cookie directly
        console.log(username);

        // Fetch the user details from MongoDB
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

            // Filter bookings based on the current date
            const completedBookings = user.booking.filter(
                (booking) => new Date(booking.endDate) < today
            );
            const ongoingBookings = user.booking.filter(
                (booking) => new Date(booking.startDate) <= today && new Date(booking.endDate) >= today
            );
            const upcomingBookings = user.booking.filter(
                (booking) => new Date(booking.startDate) > today
            );

            // Respond with the user profile and bookings categorized by status
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



app.post('/create', isAuthenticated, upload.single('image'), async (req, res) => {
    const username = req.cookies.userName;
    const {
        title,
        city,
        address,
        distance,
        price,
        desc,
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

app.post('/book', isAuthenticated, async (req, res) => {
    try {
        const username = req.cookies.userName;
        const {tourId, name, phone, startDate, endDate, adults, children } = req.body;

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

        const admins = await Admin.find(); // Fetch all admins
        if (!admins || admins.length === 0) {
            return res.status(404).json({ message: 'No admins found' });
        }

        await Admin.updateMany(
            {}, // No filter, so all admins will be updated
            { $inc: { revenue: adminShare } } // Increment the revenue field by adminShare for all admins
        );
    
        if (updatedTour.creator) {
            await User.findByIdAndUpdate(
                updatedTour.creator,
                { $inc: { revenue: employeeShare } }
            );
        }

        res.status(201).json({ message: 'Booking successful', booking: savedBooking });
    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const username = req.cookies.userName;

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

    // Check if both username and password are provided
    if (!name || !password) {
        return res.status(400).json({ message: 'Please provide both name and password' });
    }

    try {
        // Find the admin with the provided username and password
        const existingAdmin = await Admin.findOne({ name: name, password: password });

        if (existingAdmin) {
            // If credentials match, set cookies
            res.cookie('userName', existingAdmin.name, {
                httpOnly: true, // Block JavaScript access to the cookie
                secure: false,  // Set to true if using HTTPS
                sameSite: 'lax', // Restrict to same-site requests
                path: '/'        // Cookie will be sent for all paths
            });

            res.cookie('userRole', 5150, {
                httpOnly: true, // Block JavaScript access to the cookie
                secure: false,  // Set to true if using HTTPS
                sameSite: 'lax', // Restrict to same-site requests
                path: '/'        // Cookie will be sent for all paths
            });

            // Return success response with admin ID
            return res.status(200).json({
                message: 'Admin login successful',
                id: existingAdmin.id
            });
        } else {
            // If credentials don't match, return an error
            return res.status(401).json({ message: 'Invalid name or password' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'An error occurred while processing your request' });
    }
});



  // Route to fetch bookings from the last 3 months
  app.get('/admin/recent-bookings', isAdmin, async (req, res) => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Find all bookings created in the last 3 months and filter out bookings with missing tours
        const recentBookings = await Booking.find({
            createdAt: { $gte: threeMonthsAgo },
            tour: { $ne: null }, // Exclude bookings with null or missing tour
        })
            .populate('tour', 'title') // Populate the tour field with only the title
            .exec();

        console.log(recentBookings); // Log the fetched bookings for debugging

        res.status(200).json({
            recentBookings,
        });
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({ message: 'Error fetching recent bookings' });
    }
});


app.put( '/updateTours/:id', isAdmin, async(req, res) => {
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

app.delete('/deleteTours/:id', isAdmin, async(req, res) => {
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

app.post('/tours/:id/review', isAuthenticated, async (req, res) => {
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

app.get('/tours/:id', isAdmin, async (req, res) => {
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
  

app.get('/api/user-employee-counts',  isAdmin, getUserAndEmployeeCounts);

app.get('/api/loggedin-names',  isAdmin, getLoggedInNames);

app.use('/api',  isAdmin, userRoutes);

app.listen(8000, () => {
    console.log("Server started on port 8000");
});
