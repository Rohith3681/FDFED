import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import Tour from './models/Tour.js';
import Booking from './models/Booking.js';
import redisClient from './config/redisClient.js';
import Admin from './models/Admin.js';

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

// Authentication middleware
const requireAuth = async (req, res, next) => {
    const userName = req.cookies.userName;
    const userRole = req.cookies.userRole;

    if (!userName || !userRole) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access: Missing or invalid cookies'
        });
    }

    const user = await User.findOne({ name: userName, id: userRole });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access: User not found'
        });
    }

    req.user = user;
    next();
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

// Cancel booking route
app.delete('/cancel/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Find the booking
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify the booking belongs to the user
        if (!user.booking.includes(booking._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Update the tour's count (add back the cancelled seats)
        const tour = await Tour.findById(booking.tour);
        if (tour) {
            tour.count += booking.adults;
            await tour.save();
        }

        // Remove booking from user's bookings
        user.booking = user.booking.filter(b => !b.equals(booking._id));
        await user.save();

        // Delete the booking
        await Booking.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Booking cancellation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, id } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role || !id) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role,
            id
        });

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                id: user.id
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});     

app.post('/adminSignup', async (req, res) => {
    try {
        const { name, password, id } = req.body;

        // Validate required fields
        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if admin already exists with same ID
        const existingAdmin = await Admin.findOne({ id: id || "5150" });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin ID already exists'
            });
        }

        // Create new admin
        const admin = await Admin.create({
            name,
            password,
            id: id || "5150"  // Use provided ID or default
        });

        return res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                name: admin.name,
                id: admin.id
            }
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Admin registration failed',
            error: error.message
        });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password (assuming password is stored as plain text for this example)
        // In production, you should use proper password hashing
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Set cookies for authentication
        res.cookie('userName', user.name);
        res.cookie('userRole', user.id);

        // Update login status
        user.isLoggedIn = true;
        await user.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                id: user.id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Admin Login route
app.post('/adminLogin', async (req, res) => {
    try {
        const { id, password } = req.body;

        // Check for required fields
        if (!id || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Find admin by ID
        const admin = await Admin.findOne({ id });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin ID or password'
            });
        }

        // Verify password
        if (admin.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin ID or password'
            });
        }

        // Set admin cookies for authentication
        res.cookie('adminName', admin.name);
        res.cookie('adminId', admin.id);

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Admin login successful',
            data: {
                name: admin.name,
                id: admin.id
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Admin Logout route
app.post('/adminLogout', async (req, res) => {
    try {
        const adminName = req.cookies.adminName;
        const adminId = req.cookies.adminId;

        // Check if admin cookies exist
        if (!adminName || !adminId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated as admin'
            });
        }

        // Verify admin exists
        const admin = await Admin.findOne({ name: adminName, id: adminId });
        if (!admin) {
            // Clear invalid cookies
            res.clearCookie('adminName');
            res.clearCookie('adminId');
            return res.status(401).json({
                success: false,
                message: 'Invalid admin authentication'
            });
        }

        // Clear admin cookies
        res.clearCookie('adminName');
        res.clearCookie('adminId');

        return res.status(200).json({
            success: true,
            message: 'Admin logout successful'
        });

    } catch (error) {
        console.error('Admin logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Admin logout failed',
            error: error.message
        });
    }
});

// Logout route
app.post('/logout', async (req, res) => {
    try {
        const userName = req.cookies.userName;
        const userRole = req.cookies.userRole;

        // Check if user is authenticated
        if (!userName || !userRole) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Find user
        const user = await User.findOne({ name: userName, id: userRole });
        if (!user) {
            // Clear invalid cookies
            res.clearCookie('userName');
            res.clearCookie('userRole');
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication'
            });
        }

        // Check if already logged out
        if (!user.isLoggedIn) {
            return res.status(200).json({
                success: true,
                message: 'Already logged out'
            });
        }

        // Update user's login status
        user.isLoggedIn = false;
        await user.save();

        // Clear cookies
        res.clearCookie('userName');
        res.clearCookie('userRole');

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
});

// Refresh route
app.get('/refresh', async (req, res) => {
    try {
        const userName = req.cookies.userName;
        const userRole = req.cookies.userRole;

        // Check if authentication cookies exist
        if (!userName || !userRole) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Find user
        const user = await User.findOne({ name: userName, id: userRole });
        if (!user) {
            // Clear invalid cookies
            res.clearCookie('userName');
            res.clearCookie('userRole');
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication'
            });
        }

        // Check if user is logged in
        if (!user.isLoggedIn) {
            return res.status(401).json({
                success: false,
                message: 'User not logged in'
            });
        }

        // Refresh cookies
        res.cookie('userName', user.name);
        res.cookie('userRole', user.id);

        // Return refreshed session data
        return res.status(200).json({
            success: true,
            message: 'Session refreshed',
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                id: user.id
            }
        });

    } catch (error) {
        console.error('Refresh error:', error);
        return res.status(500).json({
            success: false,
            message: 'Session refresh failed',
            error: error.message
        });
    }
});

app.get('/admin/revenue', async (req, res) => {
    try {
        const adminName = req.cookies.adminName;
        const adminId = req.cookies.adminId;

        // Check if admin is authenticated
        if (!adminName || !adminId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated as admin'
            });
        }

        // Find admin and get revenue
        const admin = await Admin.findOne({ name: adminName, id: adminId });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin authentication'
            });
        }

        // Return admin's revenue
        return res.status(200).json({
            success: true,
            revenue: admin.revenue
        });

    } catch (error) {
        console.error('Error fetching admin revenue:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch admin revenue',
            error: error.message
        });
    }
});

app.post('/book', requireAuth, async (req, res) => {
    try {
        const { tourId, name, phone, startDate, endDate, adults, children = 0 } = req.body;
        const user = req.user;

        // Validate required fields
        if (!tourId || !name || !phone || !startDate || !endDate || !adults) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Find tour
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found'
            });
        }

        // Check tour capacity
        if (tour.count < adults) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient tour capacity'
            });
        }

        // Create booking
        const booking = await Booking.create({
            tour: tourId,
            name,
            phone,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            adults,
            children,
            cost: tour.price * adults
        });

        // Update tour count
        tour.count -= adults;
        await tour.save();

        // Add booking to user's bookings
        user.booking.push(booking._id);
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
});

// Get user profile route
app.get('/user/profile', requireAuth, async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                id: user.id,
                booking: user.booking,
                cart: user.cart
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
});

// Update user profile route
app.patch('/user/update', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const { name, email } = req.body;

        // Validate update fields
        const allowedUpdates = ['name', 'email'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({
                success: false,
                message: 'Invalid update fields'
            });
        }

        // Check if email is being updated and is unique
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update user
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();

        // Update cookie if name changed
        if (name) {
            res.cookie('userName', name);
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                id: user.id
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

export default app;