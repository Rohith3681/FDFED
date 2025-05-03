import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import Tour from '../models/Tour.js';

describe('POST /addToCart', () => {
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
});
