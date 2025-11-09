const request = require('supertest');
const app = require('../index'); // The express app
const Trail = require('../Model/trail');
const User = require('../Model/user');
const { getWeather } = require('../utils/weatherService');
const mongoose = require('mongoose');

jest.mock('../Model/trail'); // Mock the Trail model
jest.mock('../Model/user'); // Mock the User model
jest.mock('../utils/weatherService');
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

    beforeEach(() => {
        const mockUser = { _id: 'some-user-id', role: ['user'] };
        User.findById.mockResolvedValue(mockUser);
    });

    describe('GET /api/mantrailing', () => {
        it('should return all trails for a user', async () => {
            const mockTrails = [{ dogId: 'some-dog-id' }, { dogId: 'some-other-dog-id' }];
            Trail.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        lean: jest.fn().mockResolvedValue(mockTrails)
                    })
                })
            });
            const res = await request(app).get('/api/mantrailing');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockTrails);
            expect(Trail.find).toHaveBeenCalledWith({ userId: 'some-user-id' });
        });

        it('should filter trainerComment for non-trainers', async () => {
            const mockUser = { _id: 'some-user-id', role: ['user'] };
            User.findById.mockResolvedValue(mockUser);

            const mockTrails = [
                { dogId: 'some-dog-id', trainerComment: 'Comment 1' },
                { dogId: 'other-dog-id', trainerComment: 'Comment 2' }
            ];

            Trail.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        lean: jest.fn().mockResolvedValue(mockTrails)
                    })
                })
            });

            const res = await request(app).get('/api/mantrailing');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0]).not.toHaveProperty('trainerComment');
        });

        it('should include trainerComment for trainers', async () => {
            const mockUser = { _id: 'some-user-id', role: ['trainer'] };
            User.findById.mockResolvedValue(mockUser);

            const mockTrails = [{ dogId: 'some-dog-id', trainerComment: 'Great!' }];

            Trail.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        lean: jest.fn().mockResolvedValue(mockTrails)
                    })
                })
            });

            const res = await request(app).get('/api/mantrailing');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0]).toHaveProperty('trainerComment');
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);

            const res = await request(app).get('/api/mantrailing');

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('User not found');
        });

        it('should handle errors', async () => {
            const error = new Error('Something went wrong');
            Trail.find.mockImplementation(() => {
                throw error;
            });

            const res = await request(app).get('/api/mantrailing');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/mantrailing/save', () => {
        it('should save a new trail', async () => {
            const mockTrail = { userId: 'some-user-id', dogId: 'some-dog-id', handlerName: 'some-handler-id' };
            const newTrail = { ...mockTrail };
            
            Trail.prototype.save = jest.fn().mockResolvedValue(newTrail);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send(mockTrail);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual(newTrail);
            expect(Trail.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('should fetch weather when location and date provided', async () => {
            const mockWeather = { temperature: 20, condition: 'sunny' };
            getWeather.mockResolvedValue(mockWeather);

            const mockTrail = {
                userId: 'some-user-id',
                dogId: 'some-dog-id',
                handlerName: 'handler',
                locationCoordinate: [6.0, 46.0],
                date: '2024-01-20T10:00:00Z'
            };

            Trail.prototype.save = jest.fn().mockResolvedValue(mockTrail);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send(mockTrail);

            expect(res.statusCode).toEqual(201);
            expect(getWeather).toHaveBeenCalledWith(6.0, 46.0, '2024-01-20', expect.any(Number));
        });

        it('should use track timestamp for weather when available', async () => {
            const mockWeather = { temperature: 18, condition: 'cloudy' };
            getWeather.mockResolvedValue(mockWeather);

            const mockTrail = {
                userId: 'some-user-id',
                dogId: 'some-dog-id',
                locationCoordinate: [7.0, 47.0],
                date: '2024-01-20T10:00:00Z',
                dogTrace: {
                    features: [{
                        properties: {
                            timestamps: ['2024-01-20T08:30:00Z']
                        }
                    }]
                }
            };

            Trail.prototype.save = jest.fn().mockResolvedValue(mockTrail);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send(mockTrail);

            expect(res.statusCode).toEqual(201);
            expect(getWeather).toHaveBeenCalledWith(7.0, 47.0, '2024-01-20', expect.any(Number));
        });

        it('should handle errors on save', async () => {
            const error = new Error('Something went wrong');
            error.name = 'ValidationError';
            Trail.prototype.save = jest.fn().mockRejectedValue(error);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send({ userId: 'some-user-id', dogId: 'some-dog-id', handlerName: 'some-handler-id' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send({ dogId: 'some-dog-id' });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('User not found');
        });

        it('should allow trainer to save trainerComment', async () => {
            const mockUser = { _id: 'some-user-id', role: ['trainer'] };
            User.findById.mockResolvedValue(mockUser);

            const mockTrail = {
                dogId: 'some-dog-id',
                trainerComment: 'Great progress!'
            };

            Trail.prototype.save = jest.fn().mockResolvedValue(mockTrail);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send(mockTrail);

            expect(res.statusCode).toEqual(201);
        });
    });

    describe('POST /api/mantrailing/delete', () => {
        it('should delete a trail', async () => {
            Trail.deleteOne.mockResolvedValue({ deletedCount: 1 });
            const res = await request(app)
                .post('/api/mantrailing/delete')
                .send({ id: 'some-id' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ success: true });
            expect(Trail.deleteOne).toHaveBeenCalledWith({ _id: 'some-id', userId: 'some-user-id' });
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
            const mockTrail = { _id: 'some-id', dogId: 'some-dog-id', save: jest.fn() };
            Trail.findOne.mockResolvedValue(mockTrail);
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
            expect(Trail.updateOne).toHaveBeenCalledWith({ _id: 'some-id', userId: 'some-user-id' }, expect.any(Object));
        });

        it('should handle errors on update', async () => {
            const mockTrail = { _id: 'some-id', dogId: 'some-dog-id' };
            Trail.findOne.mockResolvedValue(mockTrail);
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
