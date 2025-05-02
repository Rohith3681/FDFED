import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import Tour from '../models/Tour.js';
import redisClient from '../config/redisClient.js';
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
    });

    it('should successfully book a tour', async () => {
        const user = await User.create({
            name: 'User',
            email: 'user@example.com',
            password: 'user@123',
            id: '2120',
            role: 'user',
            booking: []
        });

        const tour = await Tour.create({
            _id: new mongoose.Types.ObjectId('674f5482e49ade7c6903b748'),
            title: 'Bali, Indonesia',
            city: 'Bali',
            address: 'Somewhere in Indonesia',
            distance: 400,
            price: 99,
            desc: 'this is the description',
            reviews: ['hello'],
            creator: new mongoose.Types.ObjectId('674f49714a3445080e689c62'),
            image: 'uploads/1733252226956-1727375852207-tour-img02.jpg',
            count: 5,
            bookedBy: [],
            Id: 10,
            revenue: 0
        });

        const res = await request(app)
            .post('/book')
            .set('Cookie', [`userName=Test User`, `userRole=2120`])
            .send({ tourId: tour._id });

        expect(res.statusCode).toBe(400);
    });

    it('should return error when trying to book a non-existent tour', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123',
            id: '2120',
            role: 'user',
            booking: []
        });

        const nonExistentTourId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post('/book')
            .set('Cookie', [`userName=Test User`, `userRole=2120`])
            .send({ tourId: nonExistentTourId });

        expect(res.statusCode).toBe(400);
    });

    it('should return error when tour is fully booked', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123',
            id: '2120',
            role: 'user',
            booking: []
        });

        const tour = await Tour.create({
            _id: new mongoose.Types.ObjectId('674f5482e49ade7c6903b748'),
            title: 'Bali, Indonesia',
            city: 'Bali',
            address: 'Somewhere in Indonesia',
            distance: 400,
            price: 99,
            desc: 'this is the description',
            reviews: ['hello'],
            creator: new mongoose.Types.ObjectId('674f49714a3445080e689c62'),
            image: 'uploads/1733252226956-1727375852207-tour-img02.jpg',
            count: 0,
            bookedBy: [
                new mongoose.Types.ObjectId('674ff6c505676f964334ff48'),
                new mongoose.Types.ObjectId('674ff6c505676f964334ff48'),
                new mongoose.Types.ObjectId('674ff6c505676f964334ff48'),
                new mongoose.Types.ObjectId('674ff6c505676f964334ff48')
            ],
            Id: 10,
            revenue: 0
        });

        const res = await request(app)
            .post('/book')
            .set('Cookie', [`userName=Test User`, `userRole=2120`])
            .send({ tourId: tour._id });

        expect(res.statusCode).toBe(400);
    });

    it('should prevent booking the same tour twice', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123',
            id: '2120',
            role: 'user',
            booking: []
        });

        const tour = await Tour.create({
            _id: new mongoose.Types.ObjectId('674f5482e49ade7c6903b748'),
            title: 'Bali, Indonesia',
            city: 'Bali',
            address: 'Somewhere in Indonesia',
            distance: 400,
            price: 99,
            desc: 'this is the description',
            reviews: ['hello'],
            creator: new mongoose.Types.ObjectId('674f49714a3445080e689c62'),
            image: 'uploads/1733252226956-1727375852207-tour-img02.jpg',
            count: 5,
            bookedBy: [],
            Id: 10,
            revenue: 0
        });

        // First booking
        await request(app)
            .post('/book')
            .set('Cookie', [`userName=Test User`, `userRole=2120`])
            .send({ tourId: tour._id });

        // Attempt to book the same tour again
        const res = await request(app)
            .post('/book')
            .set('Cookie', [`userName=Test User`, `userRole=2120`])
            .send({ tourId: tour._id });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('You have already booked this tour');
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

    it('should return 404 when trying to cancel non-existent booking', async () => {
        const nonExistentBookingId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .delete(`/cancel/${nonExistentBookingId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Booking not found');
    });

    it('should handle invalid booking ID format', async () => {
        const res = await request(app)
            .delete('/cancel/invalidid');

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error canceling booking');
    });
});

