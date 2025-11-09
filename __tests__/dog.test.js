const request = require('supertest');
const app = require('../index');
const Dog = require('../Model/dog');
const DogShareLink = require('../Model/dogShareLink');
const mongoose = require('mongoose');

jest.mock('../Model/dog');
jest.mock('../Model/dogShareLink');
jest.mock('../utils/r2');
jest.mock('../utils/checkAuthToken', () => jest.fn((req, res, next) => {
    req.user = { id: 'some-user-id' };
    next();
}));

const { generateSignedUrl } = require('../utils/r2');
const checkAuthToken = require('../utils/checkAuthToken');

jest.setTimeout(10000);

describe('Dog API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/dog', () => {
        it('should return all dogs for a user with signed URLs', async () => {
            const mockDogs = [
                {
                    _id: 'dog1',
                    name: 'Max',
                    profilePhoto: 'https://r2.example.com/photo1.jpg',
                    toObject: function() {
                        return {
                            _id: this._id,
                            name: this.name,
                            profilePhoto: this.profilePhoto
                        };
                    }
                },
                {
                    _id: 'dog2',
                    name: 'Bella',
                    toObject: function() {
                        return {
                            _id: this._id,
                            name: this.name
                        };
                    }
                }
            ];

            Dog.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDogs)
            });
            generateSignedUrl.mockResolvedValue('http://signed-url.com');

            const res = await request(app).get('/api/dog');

            expect(res.statusCode).toEqual(200);
            expect(Dog.find).toHaveBeenCalledWith({ ownerIds: 'some-user-id' });
            expect(res.body).toHaveLength(2);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            Dog.find.mockImplementation(() => {
                throw error;
            });

            const res = await request(app).get('/api/dog');

            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /api/dog/:id', () => {
        it('should return a dog by ID', async () => {
            const mockDog = {
                _id: 'dog1',
                name: 'Max',
                toObject: function() {
                    return { _id: this._id, name: this.name };
                }
            };

            Dog.findOne.mockResolvedValue(mockDog);
            generateSignedUrl.mockResolvedValue('http://signed-url.com');

            const res = await request(app).get('/api/dog/dog1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual('Max');
            expect(Dog.findOne).toHaveBeenCalledWith({ _id: 'dog1', ownerIds: 'some-user-id' });
        });

        it('should return 404 if dog not found', async () => {
            Dog.findOne.mockResolvedValue(null);

            const res = await request(app).get('/api/dog/nonexistent');

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /api/dog', () => {
        it('should create a new dog', async () => {
            const mockDog = {
                name: 'Max',
                breed: 'Labrador',
                ownerIds: ['some-user-id']
            };

            Dog.prototype.save = jest.fn().mockResolvedValue(mockDog);

            const res = await request(app)
                .post('/api/dog')
                .send({ name: 'Max', breed: 'Labrador' });

            expect(res.statusCode).toEqual(201);
            expect(Dog.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('should handle errors on save', async () => {
            const error = new Error('Validation error');
            Dog.prototype.save = jest.fn().mockRejectedValue(error);

            const res = await request(app)
                .post('/api/dog')
                .send({ name: 'Max' });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/dog/:dogId/share', () => {
        it('should generate a share link with valid activities', async () => {
            const mockDog = {
                _id: 'dog1',
                name: 'Max',
                ownerIds: ['some-user-id']
            };

            Dog.findOne.mockResolvedValue(mockDog);
            DogShareLink.prototype.save = jest.fn().mockResolvedValue({
                token: 'abc123',
                activities: ['mantrailing'],
                expiresAt: new Date()
            });

            const res = await request(app)
                .post('/api/dog/dog1/share')
                .send({ activities: ['mantrailing'], expiresInHours: 48 });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(DogShareLink.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('should return 400 if activities are missing', async () => {
            const mockDog = {
                _id: 'dog1',
                ownerIds: ['some-user-id']
            };

            Dog.findOne.mockResolvedValue(mockDog);

            const res = await request(app)
                .post('/api/dog/dog1/share')
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Activities are required');
        });

        it('should return 400 if activities are invalid', async () => {
            const mockDog = {
                _id: 'dog1',
                ownerIds: ['some-user-id']
            };

            Dog.findOne.mockResolvedValue(mockDog);

            const res = await request(app)
                .post('/api/dog/dog1/share')
                .send({ activities: ['invalid-activity'] });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Invalid activities');
        });

        it('should return 404 if dog not found', async () => {
            Dog.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/dog/nonexistent/share')
                .send({ activities: ['mantrailing'] });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/dog/:id', () => {
        it('should update a dog', async () => {
            const updatedDog = {
                _id: 'dog1',
                name: 'Max Updated',
                breed: 'Labrador'
            };

            Dog.findOneAndUpdate.mockResolvedValue(updatedDog);

            const res = await request(app)
                .put('/api/dog/dog1')
                .send({ name: 'Max Updated' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual('Max Updated');
        });

        it('should return 404 if dog not found', async () => {
            Dog.findOneAndUpdate.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/dog/nonexistent')
                .send({ name: 'Updated' });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /api/dog/:id', () => {
        it('should delete a dog', async () => {
            const deletedDog = {
                _id: 'dog1',
                name: 'Max'
            };

            Dog.findOneAndDelete.mockResolvedValue(deletedDog);

            const res = await request(app).delete('/api/dog/dog1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual('Max');
        });

        it('should return 404 if dog not found', async () => {
            Dog.findOneAndDelete.mockResolvedValue(null);

            const res = await request(app).delete('/api/dog/nonexistent');

            expect(res.statusCode).toEqual(404);
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});
