const request = require('supertest');
const app = require('../index');
const User = require('../Model/user');
const createAuthToken = require('../utils/createAuthToken');
const checkAuthToken = require('../utils/checkAuthToken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

jest.mock('../Model/user');
jest.mock('../utils/createAuthToken');
jest.mock('../utils/checkAuthToken', () => jest.fn((req, res, next) => {
    req.user = { id: 'some-user-id', email: 'test@test.com', username: 'testuser' };
    next();
}));
jest.mock('mongoose', () => ({
    ...jest.requireActual('mongoose'),
    connection: { close: jest.fn() }
}));
jest.mock('bcrypt');

describe('User API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/user/login', () => {
        it('should login a user and return a token', async () => {
            const mockUser = { _id: 'someid', email: 'test@test.com', password: 'hashedpassword', username: 'testuser' };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockImplementation((password, hash, callback) => callback(null, true));
            createAuthToken.mockReturnValue('test-token');

            const res = await request(app)
                .post('/api/user/login')
                .send({ email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ token: 'test-token', user: { _id: 'someid', email: 'test@test.com', username: 'testuser' } });
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword', expect.any(Function));
            expect(createAuthToken).toHaveBeenCalledWith(mockUser);
        });

        it('should return 400 for invalid credentials (user not found)', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/user/login')
                .send({ email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toEqual(400);
            expect(res.text).toBe('Invalid credentials');
        });

        it('should return 400 for invalid credentials (password mismatch)', async () => {
            const mockUser = { email: 'test@test.com', password: 'hashedpassword' };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockImplementation((password, hash, callback) => callback(null, false));

            const res = await request(app)
                .post('/api/user/login')
                .send({ email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toEqual(400);
            expect(res.text).toBe('Invalid credentials');
        });
    });

    describe('POST /api/user/register', () => {
        it('should register a new user and return a token', async () => {
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedpassword');
            const mockSavedUser = { email: 'test@test.com', username: 'test', password: 'hashedpassword' };
            User.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);
            createAuthToken.mockReturnValue('test-token');

            const res = await request(app)
                .post('/api/user/register')
                .send({ username: 'test', password: 'password', email: 'test@test.com' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual({ token: 'test-token' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
            expect(User.prototype.save).toHaveBeenCalledTimes(1);
            expect(createAuthToken).toHaveBeenCalledWith(mockSavedUser);
        });
    });

    describe('GET /api/user/check', () => {
        it('should return the user and call checkAuthToken middleware', async () => {
            const res = await request(app).get('/api/user/check');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ id: 'some-user-id', email: 'test@test.com', username: 'testuser' });
            expect(checkAuthToken).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /api/user/register validations', () => {
        it('should return 400 if fields are missing', async () => {
            const res = await request(app)
                .post('/api/user/register')
                .send({ email: 'test@test.com' });

            expect(res.statusCode).toEqual(400);
            expect(res.text).toBe('Please enter all fields');
        });

        it('should return 400 if password is too short', async () => {
            const res = await request(app)
                .post('/api/user/register')
                .send({ username: 'test', email: 'test@test.com', password: 'short' });

            expect(res.statusCode).toEqual(400);
            expect(res.text).toBe('Password must be at least 8 characters');
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/user/register')
                .send({ username: 'test', email: 'invalid-email', password: 'password123' });

            expect(res.statusCode).toEqual(400);
            expect(res.text).toBe('Invalid email format');
        });

        it('should return 409 if user already exists', async () => {
            User.findOne.mockResolvedValue({ email: 'test@test.com' });

            const res = await request(app)
                .post('/api/user/register')
                .send({ username: 'test', email: 'test@test.com', password: 'password123' });

            expect(res.statusCode).toEqual(409);
            expect(res.text).toBe('User already exists');
        });
    });

    describe('POST /api/user/login validations', () => {
        it('should return 400 if fields are missing', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({ email: 'test@test.com' });

            expect(res.statusCode).toEqual(400);
            expect(res.text).toBe('Please enter all fields');
        });
    });
});
