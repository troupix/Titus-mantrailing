const request = require('supertest');
const app = require('../index'); // The express app
const Trail = require('../Model/trail');
const mongoose = require('mongoose');

jest.mock('../Model/trail'); // Mock the Trail model
const checkAuthToken = require('../utils/checkAuthToken');
jest.mock('../utils/checkAuthToken', () => jest.fn((req, res, next) => {
    req.user = { id: 'some-user-id' };
    next();
}));

jest.setTimeout(10000);

describe('Mantrailing API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/mantrailing/:userId', () => {
        it('should return all trails for a user', async () => {
            const mockTrails = [{ dogId: 'some-dog-id' }, { dogId: 'some-other-dog-id' }];
            Trail.find.mockResolvedValue(mockTrails);
            const res = await request(app).get('/api/mantrailing/some-user-id');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockTrails);
            expect(Trail.find).toHaveBeenCalledWith({ userId: 'some-user-id' });
        });

        it('should handle errors', async () => {
            const error = new Error('Something went wrong');
            Trail.find.mockRejectedValue(new Error('Something went wrong'));

            const res = await request(app).get('/api/mantrailing/some-user-id');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/mantrailing/save', () => {
        it('should save a new trail', async () => {
            const mockTrail = { userId: 'some-user-id', dogId: 'some-dog-id', handlerId: 'some-handler-id' };
            const newTrail = { ...mockTrail };
            
            // Mock the save method on the Trail model\'s prototype
            Trail.prototype.save = jest.fn().mockResolvedValue(newTrail);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send(mockTrail);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual(newTrail);
            expect(Trail.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('should handle errors on save', async () => {
            const error = new Error('Something went wrong');
            error.name = 'ValidationError';
            Trail.prototype.save = jest.fn().mockRejectedValue(error);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send({ userId: 'some-user-id', dogId: 'some-dog-id', handlerId: 'some-handler-id' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/mantrailing/delete', () => {
        it('should delete a trail', async () => {
            const res = await request(app)
                .post('/api/mantrailing/delete')
                .send({ id: 'some-id' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ success: true });
            expect(Trail.deleteOne).toHaveBeenCalledWith({ _id: 'some-id' });
        });

        it('should handle errors on delete', async () => {
            Trail.deleteOne.mockRejectedValue(new Error('Something went wrong'));

            const res = await request(app)
                .post('/api/mantrailing/delete')
                .send({ id: 'some-id' });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ success: false });
        });
    });

    describe('POST /api/mantrailing/update', () => {
        it('should update a trail', async () => {
            const mockTrail = { _id: 'some-id', dogId: 'some-dog-id' };
            Trail.findById.mockResolvedValue(mockTrail);
            Trail.updateOne.mockResolvedValue({ nModified: 1 });
            const updatedTrail = {
                dogId: 'some-dog-id',
                handlerId: 'some-handler-id',
                distance: 100,
                location: 'Park',
                duration: 60,
                notes: 'Good job',
                trailType: 'Urban',
                startType: 'Scent article',
                trainer: 'Jane',
                locationCoordinate: { lat: 0, lng: 0 },
                runnerTrace: [],
                dogTrace: []
            };

            const res = await request(app)
                .post('/api/mantrailing/update')
                .send({ id: 'some-id', trail: updatedTrail });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ success: true });
            expect(Trail.updateOne).toHaveBeenCalledWith({ _id: 'some-id' }, updatedTrail);
        });

        it('should handle errors on update', async () => {
            const mockTrail = { _id: 'some-id', dogId: 'some-dog-id' };
            Trail.findById.mockResolvedValue(mockTrail);
            Trail.updateOne.mockRejectedValue(new Error('Something went wrong'));

            const res = await request(app)
                .post('/api/mantrailing/update')
                .send({ id: 'some-id', trail: { dogId: 'some-dog-id' } });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});
