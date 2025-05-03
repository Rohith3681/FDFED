import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import Tour from '../models/Tour.js';
import Admin from '../models/Admin.js';
import Booking from '../models/Booking.js';

describe('POST /addToCart', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create(); // Start Mongo in-memory server
        const uri = mongoServer.getUri();
        await mongoose.connect(uri); // Connect to the in-memory database
    });

    afterAll(async () => {
        await mongoose.disconnect(); // Disconnect from mongoose
        await mongoServer.stop(); // Stop the in-memory server
    });

    afterEach(async () => {
        // Ensure async data clean-up
        await User.deleteMany({}); // Delete users
        await Tour.deleteMany({}); // Delete tours
    });

    it('should add a tour to the cart for a valid user', async () => {
        const user = await User.create({
            name: 'John',
            email: 'john@example.com',
            password: 'Test@1234',
            id: '2120',
            role: 'user',
            cart: []
        });

        const tour = await Tour.create({
            title: 'Sample Tour',
            city: 'Paris',
            address: '123 Paris St',
            distance: 10,
            price: 100,
            desc: 'Nice tour',
            creator: user._id,
            image: 'image.jpg',
            count: 5
        });

        const res = await request(app)
            .post('/addToCart')
            .set('Cookie', [`userName=John`, `userRole=2120`])
            .send({ tourId: tour._id });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Tour added to cart successfully');
        expect(res.body.cart.length).toBe(1);
    });

    it('should return an error when trying to add a non-existent tour to the cart', async () => {
        const user = await User.create({
            name: 'User',
            email: 'user@gmail.com',
            password: 'user@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true,
            booking: [new mongoose.Types.ObjectId('67da4d9a0fd5120a7295fdbb')],
            cart: [{
                quantity: 1,
                _id: new mongoose.Types.ObjectId('674f5482e49ade7c6903b748')
            }],
            totalSessionTime: 0
        });

        const invalidTourId = new mongoose.Types.ObjectId(); // Invalid tour ID

        const res = await request(app)
            .post('/addToCart')
            .set('Cookie', [`userName=User`, `userRole=2120`])
            .send({ tourId: invalidTourId });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Tour not found');
    });

    it('should add an existing tour to the cart for a user who already has an existing tour in their cart', async () => {
        const user = await User.create({
            name: 'User',
            email: 'user@gmail.com',
            password: 'user@123',
            id: '2120',
            isLoggedIn: true,
            role: 'user',
            booking: [new mongoose.Types.ObjectId('67da4d9a0fd5120a7295fdbb')],
            cart: [],
            totalSessionTime: 0
        });

        const existingTour = await Tour.create({
            _id: new mongoose.Types.ObjectId('674f5482e49ade7c6903b748'),
            title: 'Bali, Indonesia',
            city: 'Bali',
            address: 'Somewhere in Indonesia',
            distance: 400,
            price: 99,
            desc: 'This is the description',
            reviews: ['hello'],
            creator: new mongoose.Types.ObjectId('674f49714a3445080e689c62'),
            image: 'uploads/1733252226956-1727375852207-tour-img02.jpg',
            count: 0,
            bookedBy: [
                new mongoose.Types.ObjectId('674ff6c505676f964334ff48'),
                new mongoose.Types.ObjectId('674ff6c505676f964334ff48')
            ]
        });

        const res = await request(app)
            .post('/addToCart')
            .set('Cookie', [`userName=User`, `userRole=2120`])
            .send({ tourId: existingTour._id });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Tour added to cart successfully');
    });

    it('should increase the quantity of the tour in the cart when added multiple times', async () => {
        const user = await User.create({
            name: 'User',
            email: 'user@gmail.com',
            password: 'user@123',
            id: '2120',
            isLoggedIn: true,
            role: 'user',
            booking: [],
            totalSessionTime: 0,
            cart: []
        });

        const tour = await Tour.create({
            _id: new mongoose.Types.ObjectId('674f5482e49ade7c6903b748'),
            title: 'Bali, Indonesia',
            city: 'Bali',
            address: 'Somewhere in Indonesia',
            distance: 400,
            price: 99,
            desc: 'This is the description',
            reviews: ['hello'],
            creator: new mongoose.Types.ObjectId('674f49714a3445080e689c62'),
            image: 'uploads/1733252226956-1727375852207-tour-img02.jpg',
            count: 5,
            bookedBy: [new mongoose.Types.ObjectId('674ff6c505676f964334ff48')]
        });

        // Add the tour to the cart for the first time
        const res1 = await request(app)
            .post('/addToCart')
            .set('Cookie', [`userName=User`, `userRole=2120`])
            .send({ tourId: tour._id });

        expect(res1.statusCode).toBe(200);
        expect(res1.body.message).toBe('Tour added to cart successfully');

        // Add the same tour to the cart again (increases quantity)
        const res2 = await request(app)
            .post('/addToCart')
            .set('Cookie', [`userName=User`, `userRole=2120`])
            .send({ tourId: tour._id });

        expect(res2.statusCode).toBe(200);
        expect(res2.body.message).toBe('Tour added to cart successfully');

        // Add the same tour to the cart again (increases quantity)
        const res3 = await request(app)
            .post('/addToCart')
            .set('Cookie', [`userName=User`, `userRole=2120`])
            .send({ tourId: tour._id });

        expect(res3.statusCode).toBe(200);
        expect(res3.body.message).toBe('Tour added to cart successfully');
    });
});

describe('POST /register', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should successfully register a new user', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user'
        };

        const res = await request(app)
            .post('/register')
            .send(userData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toMatchObject({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            id: userData.id
        });
    });

    it('should successfully register an employee', async () => {
        const employeeData = {
            name: 'Test Employee',
            email: 'employee@example.com',
            password: 'Test@123',
            id: '2121',
            role: 'employee'
        };

        const res = await request(app)
            .post('/register')
            .send(employeeData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.role).toBe('employee');
    });

    it('should return error when registering with existing email', async () => {
        // First create a user
        const existingUser = await User.create({
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user'
        });

        // Try to register with same email
        const res = await request(app)
            .post('/register')
            .send({
                name: 'New User',
                email: 'existing@example.com',
                password: 'Test@123',
                id: '2121',
                role: 'user'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return error when required fields are missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                name: 'Test User',
                password: 'Test@123'
                // email, role, and id missing
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'All fields are required');
    });
});

describe('POST /login', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should successfully login a user with valid credentials', async () => {
        // First create a user
        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user'
        });

        const res = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'Test@123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Login successful');
        expect(res.body.data).toMatchObject({
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
            id: '2120'
        });
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should successfully login an employee with valid credentials', async () => {
        await User.create({
            name: 'Test Employee',
            email: 'employee@example.com',
            password: 'Test@123',
            id: '2121',
            role: 'employee'
        });

        const res = await request(app)
            .post('/login')
            .send({
                email: 'employee@example.com',
                password: 'Test@123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.role).toBe('employee');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return error with invalid email', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'Test@123'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return error with invalid password', async () => {
        // First create a user
        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user'
        });

        const res = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'WrongPassword'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
});

describe('POST /logout', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should successfully logout a logged-in user', async () => {
        // Create and login a user first
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const res = await request(app)
            .post('/logout')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Logout successful');
        
        // Verify cookies are cleared
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie'][0]).toMatch(/userName=;/);
        expect(res.headers['set-cookie'][1]).toMatch(/userRole=;/);

        // Verify user's isLoggedIn status is updated
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.isLoggedIn).toBe(false);
    });

    it('should handle logout for already logged-out user', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: false
        });

        const res = await request(app)
            .post('/logout')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Already logged out');
    });

    it('should handle logout without authentication cookies', async () => {
        const res = await request(app)
            .post('/logout');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Not authenticated');
    });

    it('should handle logout with invalid authentication cookies', async () => {
        const res = await request(app)
            .post('/logout')
            .set('Cookie', ['userName=InvalidUser', 'userRole=InvalidId']);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid authentication');
    });
});

describe('GET /refresh', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should successfully refresh session for logged-in user', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const res = await request(app)
            .get('/refresh')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Session refreshed');
        expect(res.body.data).toMatchObject({
            name: user.name,
            email: user.email,
            role: user.role,
            id: user.id
        });
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return error for non-logged-in user', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: false
        });

        const res = await request(app)
            .get('/refresh')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`]);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'User not logged in');
    });

    it('should handle refresh without authentication cookies', async () => {
        const res = await request(app)
            .get('/refresh');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Not authenticated');
    });

    it('should handle refresh with invalid authentication cookies', async () => {
        const res = await request(app)
            .get('/refresh')
            .set('Cookie', ['userName=InvalidUser', 'userRole=InvalidId']);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid authentication');
    });
});

describe('POST /adminSignup', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await Admin.deleteMany({});
    });

    it('should successfully register a new admin', async () => {
        const adminData = {
            name: 'Admin User',
            password: 'Admin@123',
            id: '5150'
        };

        const res = await request(app)
            .post('/adminSignup')
            .send(adminData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Admin registered successfully');
        expect(res.body.data).toMatchObject({
            name: adminData.name,
            id: adminData.id
        });
    });

    it('should return error when admin id already exists', async () => {
        // First create an admin
        await Admin.create({
            name: 'Existing Admin',
            password: 'Admin@123',
            id: '5150'
        });

        const res = await request(app)
            .post('/adminSignup')
            .send({
                name: 'New Admin',
                password: 'Admin@123',
                id: '5150'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Admin ID already exists');
    });

    it('should return error when required fields are missing', async () => {
        const res = await request(app)
            .post('/adminSignup')
            .send({
                name: 'Admin User'
                // password missing
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'All fields are required');
    });

    it('should return error when password is too weak', async () => {
        const res = await request(app)
            .post('/adminSignup')
            .send({
                name: 'Admin User',
                password: '123',  // weak password
                id: '5150'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Password must be at least 6 characters long');
    });
});

describe('POST /adminLogin', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await Admin.deleteMany({});
    });

    it('should successfully login an admin with valid credentials', async () => {
        // First create an admin
        const admin = await Admin.create({
            name: 'Admin User',
            password: 'Admin@123',
            id: '5150'
        });

        const res = await request(app)
            .post('/adminLogin')
            .send({
                id: '5150',
                password: 'Admin@123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Admin login successful');
        expect(res.body.data).toMatchObject({
            name: admin.name,
            id: admin.id
        });
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return error with invalid admin ID', async () => {
        const res = await request(app)
            .post('/adminLogin')
            .send({
                id: 'invalid-id',
                password: 'Admin@123'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid admin ID or password');
    });

    it('should return error with invalid password', async () => {
        // First create an admin
        await Admin.create({
            name: 'Admin User',
            password: 'Admin@123',
            id: '5150'
        });

        const res = await request(app)
            .post('/adminLogin')
            .send({
                id: '5150',
                password: 'WrongPassword'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid admin ID or password');
    });

    it('should return error when required fields are missing', async () => {
        const res = await request(app)
            .post('/adminLogin')
            .send({
                id: '5150'
                // password missing
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'All fields are required');
    });
});

describe('POST /adminLogout', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await Admin.deleteMany({});
    });

    it('should successfully logout an admin', async () => {
        // First create an admin
        const admin = await Admin.create({
            name: 'Admin User',
            password: 'Admin@123',
            id: '5150'
        });

        const res = await request(app)
            .post('/adminLogout')
            .set('Cookie', [`adminName=${admin.name}`, `adminId=${admin.id}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Admin logout successful');
        
        // Verify cookies are cleared
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie'][0]).toMatch(/adminName=;/);
        expect(res.headers['set-cookie'][1]).toMatch(/adminId=;/);
    });

    it('should handle logout without admin authentication cookies', async () => {
        const res = await request(app)
            .post('/adminLogout');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Not authenticated as admin');
    });

    it('should handle logout with invalid admin authentication cookies', async () => {
        const res = await request(app)
            .post('/adminLogout')
            .set('Cookie', ['adminName=InvalidAdmin', 'adminId=InvalidId']);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid admin authentication');
    });
});

describe('GET /admin/revenue', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await Admin.deleteMany({});
    });

    it('should return admin revenue when authenticated', async () => {
        // Create an admin with revenue
        const admin = await Admin.create({
            name: 'Admin User',
            password: 'Admin@123',
            id: '5150',
            revenue: 1500
        });

        const res = await request(app)
            .get('/admin/revenue')
            .set('Cookie', [`adminName=${admin.name}`, `adminId=${admin.id}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('revenue', 1500);
    });

    it('should handle request without admin authentication', async () => {
        const res = await request(app)
            .get('/admin/revenue');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Not authenticated as admin');
    });

    it('should handle invalid admin credentials', async () => {
        const res = await request(app)
            .get('/admin/revenue')
            .set('Cookie', ['adminName=InvalidAdmin', 'adminId=InvalidId']);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid admin authentication');
    });

    it('should handle non-existent admin', async () => {
        // Create and then delete an admin
        const admin = await Admin.create({
            name: 'Admin User',
            password: 'Admin@123',
            id: '5150',
            revenue: 1500
        });
        await Admin.deleteMany({});

        const res = await request(app)
            .get('/admin/revenue')
            .set('Cookie', [`adminName=${admin.name}`, `adminId=${admin.id}`]);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid admin authentication');
    });
});

describe('DELETE /cancel/:id', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
        await Tour.deleteMany({});
        await Booking.deleteMany({});
    });

    it('should successfully cancel a booking', async () => {
        // Create a user
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        // Create an employee as tour creator
        const employee = await User.create({
            name: 'Test Employee',
            email: 'employee@example.com',
            password: 'Test@123',
            id: '2121',
            role: 'employee'
        });

        // Create a tour
        const tour = await Tour.create({
            title: 'Test Tour',
            city: 'Test City',
            address: 'Test Address',
            distance: 100,
            price: 200,
            desc: 'Test Description',
            image: 'test.jpg',
            count: 1,
            creator: employee._id
        });

        // Create a booking with all required fields
        const booking = await Booking.create({
            tour: tour._id,
            user: user._id,
            price: tour.price,
            name: 'Test Booking',
            phone: '1234567890',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000), // Next day
            adults: 2,
            date: new Date()
        });

        // Add booking to user's bookings
        user.booking.push(booking._id);
        await user.save();

        const res = await request(app)
            .delete(`/cancel/${booking._id}`)
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Booking cancelled successfully');

        // Verify booking is deleted
        const deletedBooking = await Booking.findById(booking._id);
        expect(deletedBooking).toBeNull();

        // Verify booking is removed from user's bookings
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.booking).not.toContain(booking._id);
    });

    it('should return error for non-existent booking', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .delete(`/cancel/${nonExistentId}`)
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`]);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Booking not found');
    });

    it('should return error when not authenticated', async () => {
        const bookingId = new mongoose.Types.ObjectId();
        
        const res = await request(app)
            .delete(`/cancel/${bookingId}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Unauthorized access: Missing or invalid cookies');
    });
});

describe('POST /book', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
        await Tour.deleteMany({});
        await Booking.deleteMany({});
    });

    it('should successfully create a booking', async () => {
        // Create a user
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        // Create a tour
        const tour = await Tour.create({
            title: 'Test Tour',
            city: 'Test City',
            address: 'Test Address',
            distance: 100,
            price: 200,
            desc: 'Test Description',
            image: 'test.jpg',
            count: 5,
            creator: new mongoose.Types.ObjectId()
        });

        const bookingData = {
            tourId: tour._id,
            name: 'Test Booking',
            phone: '1234567890',
            startDate: '2024-01-01',
            endDate: '2024-01-03',
            adults: 2,
            children: 1
        };

        const res = await request(app)
            .post('/book')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`])
            .send(bookingData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Booking created successfully');
        expect(res.body.data).toMatchObject({
            name: bookingData.name,
            phone: bookingData.phone,
            adults: bookingData.adults
        });

        // Verify tour count is updated
        const updatedTour = await Tour.findById(tour._id);
        expect(updatedTour.count).toBe(3); // 5 - 2 adults
    });

    it('should return error when tour has insufficient capacity', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const tour = await Tour.create({
            title: 'Test Tour',
            city: 'Test City',
            address: 'Test Address',
            distance: 100,
            price: 200,
            desc: 'Test Description',
            image: 'test.jpg',
            count: 1,
            creator: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .post('/book')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`])
            .send({
                tourId: tour._id,
                name: 'Test Booking',
                phone: '1234567890',
                startDate: '2024-01-01',
                endDate: '2024-01-03',
                adults: 2, // More than available capacity
                children: 1
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Insufficient tour capacity');
    });

    it('should return error when not authenticated', async () => {
        const res = await request(app)
            .post('/book')
            .send({
                tourId: new mongoose.Types.ObjectId(),
                name: 'Test Booking',
                phone: '1234567890',
                startDate: '2024-01-01',
                endDate: '2024-01-03',
                adults: 2
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Unauthorized access: Missing or invalid cookies');
    });

    it('should return error when required fields are missing', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const res = await request(app)
            .post('/book')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`])
            .send({
                name: 'Test Booking',
                // Missing required fields
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'All required fields must be provided');
    });
});

describe('GET /user/profile', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should return user profile when authenticated', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const res = await request(app)
            .get('/user/profile')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toMatchObject({
            name: user.name,
            email: user.email,
            role: user.role,
            id: user.id
        });
    });

    it('should return error when not authenticated', async () => {
        const res = await request(app)
            .get('/user/profile');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Unauthorized access: Missing or invalid cookies');
    });

    it('should return error when user doesn\'t exist', async () => {
        const res = await request(app)
            .get('/user/profile')
            .set('Cookie', ['userName=NonExistent', 'userRole=1234']);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Unauthorized access: User not found');
    });

    it('should return error with invalid authentication cookies', async () => {
        const res = await request(app)
            .get('/user/profile')
            .set('Cookie', ['invalidCookie=value']);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Unauthorized access: Missing or invalid cookies');
    });
});

describe('PATCH /user/update', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should successfully update user profile', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const updateData = {
            name: 'Updated Name',
            email: 'updated@example.com'
        };

        const res = await request(app)
            .patch('/user/update')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`])
            .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Profile updated successfully');
        expect(res.body.data).toMatchObject(updateData);
    });

    it('should return error when updating with existing email', async () => {
        const existingUser = await User.create({
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'Test@123',
            id: '2121',
            role: 'user'
        });

        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const res = await request(app)
            .patch('/user/update')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`])
            .send({ email: 'existing@example.com' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return error with invalid update fields', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            id: '2120',
            role: 'user',
            isLoggedIn: true
        });

        const res = await request(app)
            .patch('/user/update')
            .set('Cookie', [`userName=${user.name}`, `userRole=${user.id}`])
            .send({ role: 'admin' }); // Cannot update role

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid update fields');
    });

    it('should return error when not authenticated', async () => {
        const res = await request(app)
            .patch('/user/update')
            .send({ name: 'Updated Name' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Unauthorized access: Missing or invalid cookies');
    });
});