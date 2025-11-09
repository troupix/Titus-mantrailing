const request = require('supertest');
const app = require('../index');
const User = require('../Model/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

jest.mock('../Model/user');
jest.mock('bcrypt');
jest.mock('../utils/checkAuthToken', () => jest.fn((req, res, next) => {
    req.user = { id: 'some-user-id' };
    next();
}));

describe('User Management API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('GET /api/users', () => {
        it('should return all users without passwords', async () => {
            const mockUsers = [{ username: 'test1' }, { username: 'test2' }];
            User.find.mockResolvedValue(mockUsers);

            const res = await request(app).get('/api/users');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockUsers);
            expect(User.find).toHaveBeenCalledWith({}, { password: 0 });
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a user by id without password', async () => {
            const mockUser = { username: 'test1' };
            User.findById.mockResolvedValue(mockUser);

            const res = await request(app).get('/api/users/some-id');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockUser);
            expect(User.findById).toHaveBeenCalledWith('some-id', { password: 0 });
        });
    });

    describe('POST /api/users/create', () => {
        it('should create a new user with a default password', async () => {
            bcrypt.hashSync.mockReturnValue('hashedpassword');
            const mockSavedUser = { username: 'test', email: 'test@test.com' };
            User.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);

            const res = await request(app)
                .post('/api/users/create')
                .send({ username: 'test', email: 'test@test.com', color: 'blue', role: ['user'] });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockSavedUser);
            expect(bcrypt.hashSync).toHaveBeenCalledWith('password', 10);
            expect(User.prototype.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update a user', async () => {
            const updatedUser = { username: 'updated' };
            User.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const res = await request(app)
                .put('/api/users/some-id')
                .send({ name: 'updated', mail: 'updated@test.com' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedUser);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('some-id', {
                username: 'updated',
                email: 'updated@test.com',
                color: undefined,
                role: undefined
            }, { new: true, select: '-password' });
        });

        it('should update a user with a new role', async () => {
            const updatedUser = { username: 'updated', role: ['admin', 'user'] };
            User.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const res = await request(app)
                .put('/api/users/some-id')
                .send({ role: ['admin', 'user'] });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedUser);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('some-id', {
                username: undefined,
                email: undefined,
                color: undefined,
                role: ['admin', 'user']
            }, { new: true, select: '-password' });
        });

        it('should update a user with a new password', async () => {
            bcrypt.hashSync.mockReturnValue('newhashedpassword');
            const updatedUser = { username: 'updated' };
            User.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const res = await request(app)
                .put('/api/users/some-id')
                .send({ name: 'updated', mail: 'updated@test.com', password: 'newpassword' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedUser);
            expect(bcrypt.hashSync).toHaveBeenCalledWith('newpassword', 10);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('some-id', {
                username: 'updated',
                email: 'updated@test.com',
                password: 'newhashedpassword',
                color: undefined,
                role: undefined
            }, { new: true, select: '-password' });
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete a user', async () => {
            User.findByIdAndDelete.mockResolvedValue({});

            const res = await request(app).delete('/api/users/some-id');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'User deleted' });
            expect(User.findByIdAndDelete).toHaveBeenCalledWith('some-id');
        });

        it('should handle errors on delete', async () => {
            User.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

            const res = await request(app).delete('/api/users/some-id');

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('GET /api/users/trainers', () => {
        it('should return all trainers without passwords', async () => {
            const mockTrainers = [
                { username: 'trainer1', role: 'trainer' },
                { username: 'trainer2', role: 'trainer' }
            ];

            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockTrainers)
            });

            const res = await request(app).get('/api/users/trainers');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockTrainers);
            expect(User.find).toHaveBeenCalledWith({ role: 'trainer' });
        });

        it('should handle errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            
            User.find.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            const res = await request(app).get('/api/users/trainers');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message');
            
            consoleErrorSpy.mockRestore();
        });
    });
});
