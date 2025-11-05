
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Canicross = require('../Model/canicross');
const canicrossRouter = require('../Router/canicross');
const checkAuthToken = require('../utils/checkAuthToken');

jest.mock('../Model/canicross');
jest.mock('../utils/checkAuthToken', () => (req, res, next) => {
  req.user = { id: 'some-user-id' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/canicross', canicrossRouter);

describe('Canicross API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/canicross', () => {
    it('should return all canicross activities for a user', async () => {
      const mockActivities = [{ distance: 5000 }, { distance: 3000 }];
      Canicross.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockActivities)
      }));

      const res = await request(app).get('/api/canicross');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockActivities);
      expect(Canicross.find).toHaveBeenCalledWith({ userId: 'some-user-id' });
    });
  });

  describe('POST /api/canicross', () => {
    it('should save a new canicross activity', async () => {
      const mockActivity = { distance: 7000, userId: 'some-user-id' };
      const newActivity = { ...mockActivity };

      Canicross.prototype.save = jest.fn().mockResolvedValue(newActivity);

      const res = await request(app)
        .post('/api/canicross')
        .send(mockActivity);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchObject(newActivity);
      expect(Canicross.prototype.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/canicross/:id', () => {
    it('should return a canicross activity by id', async () => {
      const mockActivity = { distance: 5000, userId: 'some-user-id' };
      Canicross.findOne.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockActivity)
        }))
      }));

      const res = await request(app).get('/api/canicross/some-id');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockActivity);
      expect(Canicross.findOne).toHaveBeenCalledWith({ _id: 'some-id', userId: 'some-user-id' });
    });
  });

  describe('PUT /api/canicross/:id', () => {

      it('should update a canicross activity', async () => {

        const updatedActivity = { distance: 5500, userId: 'some-user-id' };

        Canicross.findOneAndUpdate.mockResolvedValue(updatedActivity);

  

        const res = await request(app)

          .put('/api/canicross/some-id')

          .send({ distance: 5500 });

  

        expect(res.statusCode).toEqual(200);

        expect(res.body).toEqual(updatedActivity);

      });

    });

  describe('DELETE /api/canicross/:id', () => {
    it('should delete a canicross activity', async () => {
      Canicross.findOneAndDelete.mockResolvedValue({ distance: 5000 });

      const res = await request(app).delete('/api/canicross/some-id');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ message: 'Canicross activity successfully deleted.' });
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
