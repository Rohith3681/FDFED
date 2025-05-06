import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './mongo.js'
import User from "./models/User.js";
import Tour from "./models/Tour.js";
import Booking from "./models/Booking.js"
import Admin from "./models/Admin.js";
import { getUserAndEmployeeCounts, getLoggedInNames } from './controllers/auth-controller.js';
import userRoutes from './Routes/userRoutes.js';
import cookieParser from "cookie-parser";
import redisClient from './config/redisClient.js';
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { updateUser,deleteUser } from './controllers/User-controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  

const app = express();
const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Pack Your Bags API",
        version: "1.0.0",
        description: "API documentation for Pack Your Bags tourism website",
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "userName",
          },
        },
      },
      security: [
        {
          cookieAuth: [],
        },
      ],
      servers: [
        {
          url: "https://fdfed.onrender.com",
        },
      ],
      tags: [
        { name: "Auth", description: "User authentication and registration" },
        { name: "Admin", description: "Admin management and stats" },
        { name: "Tours", description: "Tour creation, review, search" },
        { name: "Users", description: "User management and profile" },
        { name: "Bookings", description: "Booking actions" },
        { name: "Cart", description: "User cart operations" },
        { name: "Dashboard", description: "Employee dashboard" },
        { name: "Users and Employees", description: "Stats about users and employees" },
      ],
    },
    apis: [path.join(__dirname, 'index.js')], 
  };
    
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cookieParser());
app.use(express.json({limit:'50mb'}));

app.use(cors({
    origin: 'https://fdfed-gilt.vercel.app', // Your frontend origin
    credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1);

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

app.get("/test-error", (req, res, next) => {
    const error = new Error("Something went wrong!");
    error.status = 400;  // Setting custom error status
    next(error);  // Pass the error to middleware
});

app.get("/refresh", isAuthenticated, async (req, res) => {
    try {
        const name = req.cookies.userName;
        const rol = req.cookies.userRole;

        const user = await User.findOne({ name });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


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


/**
 * @swagger
 * /addToCart:
 *   post:
 *     summary: Add a tour to the user's cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourId:
 *                 type: string
 *                 description: The ID of the tour to add
 *     responses:
 *       200:
 *         description: Tour added to cart successfully
 *       400:
 *         description: Invalid user or not authorized
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Server error
 */
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
        return res.status(400).json({ message: 'Tour not found' });
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
  

/**
 * @swagger
 * /cart/remove/{tourId}:
 *   delete:
 *     summary: Remove a tour from the user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the tour to remove
 *     responses:
 *       200:
 *         description: Tour removed from cart successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
  app.delete('/cart/remove/:tourId', isAuthenticated, async (req, res) => {
    try {
        const { tourId } = req.params;
        const name = req.cookies.userName;
        
        const user = await User.findOne({ name: name });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the index of the tour in the cart
        const tourIndex = user.cart.findIndex(item => item._id.toString() === tourId);
        
        if (tourIndex === -1) {
            return res.status(404).json({ message: 'Tour not found in cart' });
        }

        // Remove the tour from the cart array
        user.cart.splice(tourIndex, 1);
        await user.save();

        res.status(200).json({ 
            message: 'Tour removed from cart successfully',
            cart: user.cart
        });
    } catch (error) {
        console.error('Error removing tour from cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /deleteTours/{id}:
 *   delete:
 *     summary: Delete a tour
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []  
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the tour to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tour deleted successfully
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Failed to delete tour
 */
app.delete("/tours/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const tour = await Tour.findById(id);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        // Remove tour from the employee's tour array
        await User.findByIdAndUpdate(tour.creator, { 
            $pull: { tour: id } 
        });

        // Remove tour from all users' booking array
        await User.updateMany(
            { _id: { $in: tour.bookedBy } },
            { $pull: { booking: id } }
        );

        // Delete all bookings related to the tour
        await Booking.deleteMany({ tour: id });

        // Delete the tour itself
        await Tour.findByIdAndDelete(id);

        // Clear both the specific tour cache and the all tours cache
        await redisClient.del(`tour:${id}`);
        await redisClient.del('tours');

        res.status(200).json({ message: "Tour deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting tour", error: error.message });
    }
});


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user or employee
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Must include at least 8 characters, one letter, and one number
 *               role:
 *                 type: string
 *                 enum: [user, employee]
 *               employeeId:
 *                 type: string
 *                 description: Required only if role is 'employee'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input (email, password, role, or ID)
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user or employee and set authentication cookies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with cookies set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 role:
 *                   type: string
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       price:
 *                         type: number
 *                       image:
 *                         type: string
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
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
            httpOnly: true, // Prevent JavaScript access to the cookie
            secure: true, // Set to true if using HTTPS
            sameSite: 'None', // Restrict the cookie to same-site requests
            path: '/'
        });

        res.cookie('userRole', rol, {
            httpOnly: true, // Prevent JavaScript access to the cookie
            secure: true, // Set to true if using HTTPS
            sameSite: 'None', // Restrict the cookie to same-site requests
            path: '/'
        });

        
        
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

/**
 * @swagger
 * /book:
 *   post:
 *     summary: Book a tour
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourId:
 *                 type: string
 *                 description: Tour ID to be booked
 *               name:
 *                 type: string
 *                 description: User name
 *               phone:
 *                 type: string
 *                 description: User phone number
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Tour start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Tour end date
 *               adults:
 *                 type: integer
 *                 description: Number of adults
 *               children:
 *                 type: integer
 *                 description: Number of children
 *     responses:
 *       201:
 *         description: Booking successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 booking:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     cost:
 *                       type: number
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Tour or user not found
 *       500:
 *         description: Error during booking
 */
app.post('/book', isAuthenticated, async (req, res) => {
    try {
        const username = req.cookies.userName;
        const { tourId, name, phone, startDate, endDate, adults, children = 0 } = req.body;

        if (!username || !tourId || !name || !phone || !startDate || !endDate || !adults) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const tour = await Tour.findById(tourId).populate('creator');
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        const totalCost = (tour.price * adults) + (tour.price * children);
        const adminShare = parseFloat((totalCost * 0.1).toFixed(2));
        const employeeShare = parseFloat((totalCost * 0.9).toFixed(2));

        const newBooking = new Booking({
            name,
            phone,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
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

        await Tour.findByIdAndUpdate(
            tourId,
            {
                $push: { bookedBy: user._id }
            }
        );

        const admins = await Admin.find();
        if (!admins.length) {
            return res.status(404).json({ message: 'No admins found' });
        }

        await Admin.updateMany({}, { $inc: { revenue: adminShare } });

        if (tour.creator && tour.creator._id) {
            await User.findByIdAndUpdate(
                tour.creator._id,
                { $inc: { revenue: employeeShare } }
            );
        }

        res.status(201).json({ message: 'Booking successful', booking: savedBooking });
    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /admin/recent-bookings:
 *   get:
 *     summary: Get all bookings made in the last 3 months
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: List of recent bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recentBookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       tour:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *       500:
 *         description: Error fetching recent bookings
 */
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


        res.status(200).json({
            recentBookings,
        });
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({ message: 'Error fetching recent bookings' });
    }
});


/**
 * @swagger
 * /adminSignup:
 *   post:
 *     summary: Register a new admin account
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Admin already exists or invalid input
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /deleteTours/{id}:
 *   delete:
 *     summary: Delete a tour
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []  
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the tour to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tour deleted successfully
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Failed to delete tour
 */
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

/**
 * @swagger
 * /tours/{id}/review:
 *   post:
 *     summary: Add a review to a specific tour
 *     tags: [Tours]
 *     security:
 *       - cookieAuth: []  
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the tour to which the review will be added
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review:
 *                 type: string
 *                 description: The review text for the tour
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tour:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Failed to add review
 */
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

/**
 * @swagger
 * /updateTours/{id}:
 *   put:
 *     summary: Update a tour
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []  
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the tour to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               distance:
 *                 type: number
 *               price:
 *                 type: number
 *               desc:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tour updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedTour:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Failed to update tour
 */
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

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout the currently authenticated user and clear cookies
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: Optional cart data to save for the user
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *     responses:
 *       200:
 *         description: Logout successful, cookies cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *                 resetCart:
 *                   type: boolean
 *       400:
 *         description: No user is logged in
 *       500:
 *         description: Internal server error
 */
app.post("/logout", async (req, res) => {
    try {
        const name = req.cookies?.userName;

        if (!name) {
            return res.status(400).json({ message: "No user cookie found" });
        }

        const user = await User.findOne({ name });
        if (user) {
            user.isLoggedIn = false;
            await user.save();
        }

        const tours = await Tour.find({}, '_id');

        // Prepare cache keys
        const cacheKeys = [
            ...tours.map(t => `tour:${t._id}`),
            `user:${name}`,
            'tours'
        ];

        // Delete all keys concurrently
        await Promise.all(cacheKeys.map(key => redisClient.del(key)));

        // Clear cookies with the SAME settings as when they were set
        res.clearCookie('userName', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.clearCookie('userRole', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Error during logout" });
    }
});

/**
 * @swagger
 * /cancel/{id}:
 *   delete:
 *     summary: Cancel a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the booking to cancel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking canceled successfully and removed from user records
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Error canceling booking
 */
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


/**
 * @swagger
 * /adminLogout:
 *   post:
 *     summary: Log out an admin by clearing cookies
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 *       400:
 *         description: No admin is logged in
 *       500:
 *         description: Internal server error
 */
app.post('/adminLogout', async (req, res) => {
    const userName = req.cookies.userName;

    try {
        if (!userName) {
            return res.status(400).json({ message: 'No admin is logged in' });
        }

        // Invalidate any cached data related to this admin
        await redisClient.del(`adminProfile:${userName}`);

        // Clear the cookies with the SAME settings as when they were set
        res.clearCookie('userName', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.clearCookie('userRole', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.status(200).json({ message: 'Admin logged out successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


/**
 * @swagger
 * /tour-info:
 *   get:
 *     summary: Get the total number of tours and bookings
 *     tags: [Tours]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: Successfully retrieved the number of tours and bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTours:
 *                   type: integer
 *                   description: The total number of tours
 *                 totalBookings:
 *                   type: integer
 *                   description: The total number of bookings across all users
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /adminRevenue:
 *   get:
 *     summary: Get the revenue of a specific admin
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: Successfully retrieved the admin's revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revenue:
 *                   type: number
 *                   format: float
 *                   description: The total revenue for the admin
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
app.get('/adminRevenue', isAdmin, async (req, res) => {
    const startTime = Date.now();
    const cacheKey = 'adminRevenue:5150';

    try {
        const cachedRevenue = await redisClient.get(cacheKey);
        if (cachedRevenue) {
            const endTime = Date.now();
            console.log(`✅ Cache HIT for /adminRevenue - Time taken: ${endTime - startTime}ms`);
            return res.json({ revenue: JSON.parse(cachedRevenue) });
        }

        const admin = await Admin.findOne({ id: '5150' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(admin.revenue));

        const endTime = Date.now();
        console.log(`❌ Cache MISS for /adminRevenue - Time taken: ${endTime - startTime}ms`);
        return res.json({ revenue: admin.revenue });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
  
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: User ID
 *                   name:
 *                     type: string
 *                     description: User name
 *       500:
 *         description: Server error
 */
app.get('/users', isAdmin, async (req, res) => {
    try {
      const users = await User.find({ id: '2120' }); // Fetch users with id = 2120
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Get all tours with updated image paths
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: Successfully retrieved tours with updated image paths
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Tour ID
 *                   title:
 *                     type: string
 *                     description: Tour title
 *                   photo:
 *                     type: string
 *                     description: Updated photo path
 *       500:
 *         description: Internal server error
 */
app.get('/tours', async (req, res) => {
    const startTime = Date.now();
    try {
        const cachedTours = await redisClient.get('tours');
        
        if (cachedTours) {
            const endTime = Date.now();
            console.log(`✅ Cache HIT for /tours - Time taken: ${endTime - startTime}ms`);
            return res.json(JSON.parse(cachedTours));
        }

        const tours = await Tour.find();
        const toursWithImagePath = tours.map(tour => ({
            ...tour._doc,
            image: tour.image  // Use the base64 string directly
        }));

        await redisClient.setEx('tours', 3600, JSON.stringify(toursWithImagePath));
        
        const endTime = Date.now();
        console.log(`❌ Cache MISS for /tours - Time taken: ${endTime - startTime}ms`);
        res.json(toursWithImagePath);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/tours/:id', isAuthenticated, async (req, res) => {
    const startTime = Date.now();
    try {
        const { id } = req.params;
        
        const cachedTour = await redisClient.get(`tour:${id}`);
        
        if (cachedTour) {
            const endTime = Date.now();
            return res.json(JSON.parse(cachedTour));
        }

        const tour = await Tour.findById(id)
            .populate('reviews');
            
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        const tourData = {
            ...tour._doc,
            image: tour.image  // Use the base64 string directly
        };

        await redisClient.setEx(`tour:${id}`, 3600, JSON.stringify(tourData));
        
        const endTime = Date.now();
        res.json(tourData);
    } catch (error) {
        console.error("Error fetching tour:", error);
        res.status(500).json({ message: "Error fetching tour", error: error.message });
    }
});

/**
 * @swagger
 * /tours/search/{location}:
 *   get:
 *     summary: Search for tours by location
 *     tags: [Tours]
 *     parameters:
 *       - name: location
 *         in: path
 *         description: Location to search for tours
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tours in the specified location
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   city:
 *                     type: string
 *       500:
 *         description: Error searching for tours
 */
app.get('/tours/search/:location', async (req, res) => {
    const startTime = Date.now();
    try {
        const { location } = req.params;
        
        // Try to get search results from cache
        const cachedResults = await redisClient.get(`search:${location}`);
        
        if (cachedResults) {
            const endTime = Date.now();
            console.log(`✅ Cache HIT for search:${location} - Time taken: ${endTime - startTime}ms`);
            return res.json(JSON.parse(cachedResults));
        }

        const tours = await Tour.find({
            "$or": [
                { city: { $regex: location, $options: 'i' } },
                { title: { $regex: location, $options: 'i' } }
            ]
        });

        // Cache search results for 5 minutes (300 seconds)
        await redisClient.setEx(`search:${location}`, 300, JSON.stringify(tours));
        
        const endTime = Date.now();
        console.log(`❌ Cache MISS for search:${location} - Time taken: ${endTime - startTime}ms`);
        res.json(tours);
    } catch (error) {
        res.status(500).json({ message: "Error searching tours", error: error.message });
    }
});


/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile including their bookings
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile and categorized bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: User's name
 *                 completedBookings:
 *                   type: array
 *                   description: List of completed bookings
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                 ongoingBookings:
 *                   type: array
 *                   description: List of ongoing bookings
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                 upcomingBookings:
 *                   type: array
 *                   description: List of upcoming bookings
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
app.get('/user/profile', isAuthenticated, async (req, res) => {
    const startTime = Date.now();
    try {
        const username = req.cookies.userName;
        const cacheKey = `userProfile:${username}`;

        const cachedProfile = await redisClient.get(cacheKey);
        if (cachedProfile) {
            const endTime = Date.now();
            console.log(`✅ Cache HIT for /user/profile - Time taken: ${endTime - startTime}ms`);
            return res.json(JSON.parse(cachedProfile));
        }

        const user = await User.findOne({ name: username })
            .populate({
                path: 'booking',
                populate: {
                    path: 'tour',
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

            const profileData = {
                user: user.name,
                completedBookings,
                ongoingBookings,
                upcomingBookings,
            };

            await redisClient.setEx(cacheKey, 3600, JSON.stringify(profileData));

            const endTime = Date.now();
            console.log(`❌ Cache MISS for /user/profile - Time taken: ${endTime - startTime}ms`);
            res.json(profileData);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * @swagger
 * /adminLogin:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin username
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       400:
 *         description: Missing username or password
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Error processing the login request
 */
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
                secure: true,  // Set to true if using HTTPS
                sameSite: 'none', // Restrict to same-site requests
                path: '/'        // Cookie will be sent for all paths
            });

            res.cookie('userRole', 5150, {
                httpOnly: true, // Block JavaScript access to the cookie
                secure: true,  // Set to true if using HTTPS
                sameSite: 'none', // Restrict to same-site requests
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

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new tour
 *     tags: [Tours]
 *     security:
 *       - cookieAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tour title
 *               city:
 *                 type: string
 *                 description: City of the tour
 *               address:
 *                 type: string
 *                 description: Address of the tour
 *               distance:
 *                 type: number
 *                 description: Distance of the tour
 *               price:
 *                 type: number
 *                 description: Price of the tour per person
 *               desc:
 *                 type: string
 *                 description: Description of the tour
 *     responses:
 *       201:
 *         description: Tour created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tour:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *       400:
 *         description: Bad request (missing required fields)
 *       404:
 *         description: User not found
 *       500:
 *         description: Error creating tour
 */
app.post('/create', isAuthenticated, async (req, res) => {
    const username = req.cookies.userName;
    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        let {
            title,
            city,
            address,
            distance,
            price,
            desc,
            image,
            maxGroupSize
        } = req.body;
        
        const validationErrors = {};
        if (!title) validationErrors.title = 'Title is required';
        if (!city) validationErrors.city = 'City is required';
        if (!address) validationErrors.address = 'Address is required';
        if (!distance || isNaN(distance)) validationErrors.distance = 'Distance must be a valid number';
        if (!price || isNaN(price)) validationErrors.price = 'Price must be a valid number';
        if (!desc) validationErrors.desc = 'Description is required';
        if (!maxGroupSize || isNaN(maxGroupSize)) validationErrors.maxGroupSize = 'Max group size must be a valid number';
        if (!image) {
            validationErrors.image = 'Image is required';
        } else {
            const base64Pattern = /^data:image\/(png|jpeg|jpg|webp);base64,/;
            if (!base64Pattern.test(image)) {
                validationErrors.image = 'Invalid image format. Must be base64 string starting with data:image/';
            }
        }
        
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        const newTour = new Tour({
            title: title.trim(),
            city: city.trim(),
            address: address.trim(),
            distance: Number(distance),
            price: Number(price),
            desc: desc.trim(),
            creator: user._id,
            image: image,
            count: 0,
            bookedBy: [],
            revenue: 0
        });
        

        await newTour.save();
        await redisClient.del('tours');

        if (user.role === 'employee') {
            user.tour.push(newTour._id);
            await user.save();
        }

        res.status(201).json({
            message: 'Tour created successfully',
            tour: newTour
        });
    } catch (error) {
        console.error('Error creating tour:', error);
        res.status(500).json({
            message: 'Error creating tour',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tours/search/{location}:
 *   get:
 *     summary: Search for tours by location
 *     tags: [Tours]
 *     parameters:
 *       - name: location
 *         in: path
 *         description: Location to search for tours
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tours in the specified location
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   city:
 *                     type: string
 *       500:
 *         description: Error searching for tours
 */
app.get('/tours/search/:location', async (req, res) => {
    const { location } = req.params; // Use req.params to get the location
  
    try {
      const tours = await Tour.find({ city: { $regex: location, $options: 'i' } });
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: 'Error searching for tours' });
    }
  });
  

  
  /**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard data for employees
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: Employee dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 revenue:
 *                   type: number
 *                 tours:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       bookedByNames:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: User not found or not an employee
 *       500:
 *         description: Error fetching tours
 */
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


app.get('/profile/:username', isAuthenticated, async (req, res) => {
    const startTime = Date.now();
    try {
        const { username } = req.params;
        const cacheKey = `profile:${username}`;
        
        // Try to get from cache first
        const cachedProfile = await redisClient.get(cacheKey);
        if (cachedProfile) {
            console.log(`✅ Cache HIT for profile:${username}`);
            return res.json(JSON.parse(cachedProfile));
        }

        // If not in cache, fetch from database
        const user = await User.findOne({ name: username })
            .populate({
                path: 'booking',
                populate: {
                    path: 'tour',
                    select: 'title price image'
                }
            })
            .select('-password'); // Exclude password from response

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profileData = {
            name: user.name,
            email: user.email,
            role: user.role,
            bookings: user.booking || [],
            cart: user.cart || []
        };

        // Cache for 30 minutes (1800 seconds)
        await redisClient.setEx(cacheKey, 1800, JSON.stringify(profileData));
        console.log(`❌ Cache MISS for profile:${username}`);

        res.json(profileData);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching user details or bookings' });
    }
});

/**
 * @swagger
 * /admin/user-employee-counts:
 *   get:
 *     summary: Get the number of logged-in users and employees
 *     tags: [Users and Employees]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: Counts of logged-in users and employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loggedInUsers:
 *                   type: integer
 *                   description: The count of logged-in users
 *                 loggedInEmployees:
 *                   type: integer
 *                   description: The count of logged-in employees
 *       500:
 *         description: Error fetching user and employee counts
 */
app.get('/api/user-employee-counts',  isAdmin, getUserAndEmployeeCounts);


/**
 * @swagger
 * /admin/logged-in-names:
 *   get:
 *     summary: Get the names of logged-in users and employees
 *     tags: [Users and Employees]
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: List of logged-in users and employees names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loggedInUsers:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of names of logged-in users
 *                 loggedInEmployees:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of names of logged-in employees
 *       500:
 *         description: Error fetching logged-in names
 */
app.get('/api/loggedin-names',  isAdmin, getLoggedInNames);

/**
 * @swagger
 * /admin/update-user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user
 */
app.put('/admin/update-user/:id', isAdmin, updateUser);

/**
 * @swagger
 * /admin/delete-user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
app.delete('/admin/delete-user/:id', isAdmin, deleteUser);

app.use('/api',  isAdmin, userRoutes);

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

app.listen(8000, () => {
    console.log("Server started on port 8000");
    console.log("Swagger docs available at http://localhost:8000/api-docs");
});