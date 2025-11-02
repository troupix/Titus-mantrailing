const request = require('supertest');
const app = require('../index'); // The express app
const Hike = require('../Model/hike');
const mongoose = require('mongoose');

jest.mock('../Model/hike'); // Mock the Hike model

jest.setTimeout(10000);

describe('Hike API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/hike/:userId', () => {
        it('should return all hikes for a user', async () => {
            const mockHikes = [{ name: 'Hike 1' }, { name: 'Hike 2' }];
            Hike.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockHikes) });

            const res = await request(app).get('/api/hike/some-user-id');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockHikes);
            expect(Hike.find).toHaveBeenCalledWith({ userId: 'some-user-id' });
        });

        it('should handle errors', async () => {
            const error = new Error('Something went wrong');
            Hike.find.mockImplementation(() => { throw new Error('Something went wrong') });

            const res = await request(app).get('/api/hike/some-user-id');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/hike', () => {
        it('should save a new hike', async () => {
            const mockHike = { name: 'New Hike', userId: 'some-user-id' };
            const newHike = { ...mockHike };
            
            Hike.prototype.save = jest.fn().mockResolvedValue(newHike);

            const res = await request(app)
                .post('/api/hike')
                .send(mockHike);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toMatchObject(newHike);
            expect(Hike.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('should handle errors on save', async () => {
            const error = new Error('Something went wrong');
            Hike.prototype.save = jest.fn().mockRejectedValue(error);

            const res = await request(app)
                .post('/api/hike')
                .send({ name: 'New Hike', userId: 'some-user-id' });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message');
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});
