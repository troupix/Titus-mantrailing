const request = require('supertest');
const express = require('express');
const trainerRouter = require('../Router/trainer');
const Dog = require('../Model/dog');
const DogShareLink = require('../Model/dogShareLink');
const MantrailingTrail = require('../Model/trail');
const HikingTrail = require('../Model/hike');
const CanicrossTrail = require('../Model/canicross');
const checkAuthToken = require('../utils/checkAuthToken');
const { generateSignedUrl } = require('../utils/r2');

jest.mock('../Model/dog');
jest.mock('../Model/dogShareLink');
jest.mock('../Model/trail');
jest.mock('../Model/hike');
jest.mock('../Model/canicross');
jest.mock('../utils/checkAuthToken');
jest.mock('../utils/r2');

const app = express();
app.use(express.json());
app.use('/api/trainer', trainerRouter);

describe('Trainer API', () => {
  let mockTrainer;
  let mockNonTrainer;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTrainer = { id: 'trainer123', role: ['trainer'] };
    mockNonTrainer = { id: 'user123', role: ['user'] };

    checkAuthToken.mockImplementation((req, res, next) => {
      req.user = mockTrainer;
      next();
    });

    generateSignedUrl.mockResolvedValue('https://signed-url.com/photo.jpg');
  });

  describe('GET /api/trainer/dogs', () => {
    it('should return all dogs for a trainer with activity stats', async () => {
      const mockDogs = [
        {
          _id: 'dog1',
          name: 'Max',
          profilePhoto: 'uploads/photo.jpg',
          ownerIds: [{ _id: 'owner1', username: 'owner', email: 'owner@test.com' }],
          trainers: [{ trainerId: { _id: 'trainer123', username: 'trainer' }, activities: ['mantrailing', 'hiking'] }],
        },
      ];

      const mockChain = {
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };
      // On the second populate call, resolve with mockDogs
      mockChain.populate.mockReturnValueOnce(mockChain).mockResolvedValueOnce(mockDogs);
      Dog.find.mockReturnValue(mockChain);

      MantrailingTrail.countDocuments.mockResolvedValue(5);
      MantrailingTrail.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ date: new Date('2024-01-15') }),
      });

      HikingTrail.countDocuments.mockResolvedValue(3);
      HikingTrail.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ date: new Date('2024-01-20') }),
      });

      const response = await request(app).get('/api/trainer/dogs');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('activityStats');
      expect(response.body[0].activityStats.mantrailing).toBe(5);
      expect(response.body[0].activityStats.hiking).toBe(3);
    });

    it('should return 403 if user is not a trainer', async () => {
      checkAuthToken.mockImplementation((req, res, next) => {
        req.user = mockNonTrainer;
        next();
      });

      const response = await request(app).get('/api/trainer/dogs');

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const mockChain = {
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };
      // First populate returns chain, second populate throws error
      mockChain.populate.mockReturnValueOnce(mockChain).mockRejectedValueOnce(new Error('Database error'));
      Dog.find.mockReturnValue(mockChain);

      const response = await request(app).get('/api/trainer/dogs');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toContain('Failed to fetch dogs');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('POST /api/trainer/claim-dog', () => {
    it('should successfully claim a dog with a valid share token', async () => {
      const mockShareLink = {
        _id: 'link1',
        token: 'valid-token',
        dogId: 'dog1',
        activities: ['mantrailing'],
        expiresAt: new Date(Date.now() + 86400000),
      };

      const mockDog = {
        _id: 'dog1',
        name: 'Max',
        trainers: [],
        save: jest.fn().mockResolvedValue(true),
      };

      DogShareLink.findOne.mockResolvedValue(mockShareLink);
      Dog.findById.mockResolvedValue(mockDog);
      DogShareLink.deleteOne.mockResolvedValue({});

      const response = await request(app)
        .post('/api/trainer/claim-dog')
        .send({ shareToken: 'valid-token' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('successfully claimed');
      expect(mockDog.trainers).toHaveLength(1);
      expect(mockDog.save).toHaveBeenCalled();
    });

    it('should merge activities if trainer is already assigned', async () => {
      const mockShareLink = {
        _id: 'link1',
        token: 'valid-token',
        dogId: 'dog1',
        activities: ['hiking', 'canicross'],
        expiresAt: new Date(Date.now() + 86400000),
      };

      const mockDog = {
        _id: 'dog1',
        trainers: [{ trainerId: 'trainer123', activities: ['mantrailing'] }],
        save: jest.fn().mockResolvedValue(true),
      };

      DogShareLink.findOne.mockResolvedValue(mockShareLink);
      Dog.findById.mockResolvedValue(mockDog);
      DogShareLink.deleteOne.mockResolvedValue({});

      const response = await request(app)
        .post('/api/trainer/claim-dog')
        .send({ shareToken: 'valid-token' });

      expect(response.statusCode).toBe(200);
      expect(mockDog.trainers[0].activities).toContain('mantrailing');
      expect(mockDog.trainers[0].activities).toContain('hiking');
      expect(mockDog.trainers[0].activities).toContain('canicross');
    });

    it('should return 400 if share token is missing', async () => {
      const response = await request(app).post('/api/trainer/claim-dog').send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Share token is required');
    });

    it('should return 404 if share link is expired', async () => {
      const mockShareLink = {
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 86400000),
      };

      DogShareLink.findOne.mockResolvedValue(mockShareLink);

      const response = await request(app)
        .post('/api/trainer/claim-dog')
        .send({ shareToken: 'expired-token' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('invalid or has expired');
    });

    it('should return 403 if user is not a trainer', async () => {
      checkAuthToken.mockImplementation((req, res, next) => {
        req.user = mockNonTrainer;
        next();
      });

      const response = await request(app)
        .post('/api/trainer/claim-dog')
        .send({ shareToken: 'any-token' });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('GET /api/trainer/dogs/:dogId/trails', () => {
    it('should return all trails for a dog based on assigned activities', async () => {
      const mockDog = {
        _id: 'dog1',
        ownerIds: [{ _id: 'owner1' }],
        trainers: [{ trainerId: 'trainer123', activities: ['mantrailing', 'hiking'] }],
      };

      const mockMantrailingTrails = [{ _id: 'trail1', date: '2024-01-15' }];
      const mockHikingTrails = [{ _id: 'trail2', date: '2024-01-20' }];

      Dog.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDog),
      });

      MantrailingTrail.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMantrailingTrails),
      });

      HikingTrail.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockHikingTrails),
      });

      const response = await request(app).get('/api/trainer/dogs/dog1/trails');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('category');
    });

    it('should return 404 if dog is not found', async () => {
      Dog.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app).get('/api/trainer/dogs/nonexistent/trails');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Dog not found');
    });

    it('should return 403 if trainer is not assigned to the dog', async () => {
      const mockDog = {
        _id: 'dog1',
        trainers: [{ trainerId: 'other-trainer', activities: ['mantrailing'] }],
      };

      Dog.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDog),
      });

      const response = await request(app).get('/api/trainer/dogs/dog1/trails');

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('not assigned to this dog');
    });
  });

  describe('GET /api/trainer/trails/:trailId', () => {
    it('should return a mantrailing trail with category', async () => {
      const mockTrail = {
        _id: 'trail1',
        dog: 'dog1',
        date: '2024-01-15',
      };

      const mockDog = {
        _id: 'dog1',
        trainers: [{ trainerId: 'trainer123', activities: ['mantrailing'] }],
      };

      MantrailingTrail.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTrail),
      });

      Dog.findById.mockResolvedValue(mockDog);

      const response = await request(app).get('/api/trainer/trails/trail1');

      expect(response.statusCode).toBe(200);
      expect(response.body.category).toBe('mantrailing');
    });

    it('should return 404 if trail is not found', async () => {
      MantrailingTrail.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      HikingTrail.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      CanicrossTrail.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app).get('/api/trainer/trails/nonexistent');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Trail not found');
    });

    it('should return 403 if trainer is not assigned to the activity', async () => {
      const mockTrail = {
        _id: 'trail1',
        dog: 'dog1',
        date: '2024-01-15',
      };

      const mockDog = {
        _id: 'dog1',
        trainers: [{ trainerId: 'trainer123', activities: ['hiking'] }],
      };

      MantrailingTrail.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTrail),
      });

      Dog.findById.mockResolvedValue(mockDog);

      const response = await request(app).get('/api/trainer/trails/trail1');

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('not assigned to this dog');
    });
  });
});
