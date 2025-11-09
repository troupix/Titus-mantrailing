
const request = require('supertest');
const app = require('../index'); // Use the main app for consistency
const mongoose = require('mongoose');
const Canicross = require('../Model/canicross');
const { getWeather } = require('../utils/weatherService');

jest.mock('../Model/canicross');
jest.mock('../utils/weatherService');
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connection: {
    close: jest.fn(),
  },
}));
jest.mock('../utils/checkAuthToken', () => (req, res, next) => {
  req.user = { id: 'some-user-id' };
  next();
});

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

    it('should fetch weather data when location and date provided', async () => {
      const mockWeather = { temperature: 18, condition: 'sunny' };
      getWeather.mockResolvedValue(mockWeather);

      const mockActivity = {
        distance: 7000,
        location: { type: 'Point', coordinates: [6.0, 46.0] },
        date: '2024-01-20T10:00:00Z'
      };

      Canicross.prototype.save = jest.fn().mockResolvedValue(mockActivity);

      const res = await request(app)
        .post('/api/canicross')
        .send(mockActivity);

      expect(res.statusCode).toEqual(201);
      expect(getWeather).toHaveBeenCalledWith(46.0, 6.0, '2024-01-20');
    });

    it('should handle errors on save', async () => {
      const error = new Error('Database error');
      Canicross.prototype.save = jest.fn().mockRejectedValue(error);

      const res = await request(app)
        .post('/api/canicross')
        .send({ distance: 5000 });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message');
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

    it('should return 404 if activity not found', async () => {
      Canicross.findOne.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(null)
        }))
      }));

      const res = await request(app).get('/api/canicross/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
    });

    it('should handle errors', async () => {
      Canicross.findOne.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      const res = await request(app).get('/api/canicross/some-id');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/canicross/:id', () => {
    it('should update a canicross activity', async () => {
      const existingActivity = { distance: 5000, weather: {} };
      const updatedActivity = { distance: 5500, userId: 'some-user-id' };

      Canicross.findOne.mockResolvedValue(existingActivity);
      Canicross.findOneAndUpdate.mockResolvedValue(updatedActivity);

      const res = await request(app)
        .put('/api/canicross/some-id')
        .send({ distance: 5500 });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedActivity);
    });

    it('should update weather when location and date provided', async () => {
      const mockWeather = { temperature: 22, condition: 'cloudy' };
      getWeather.mockResolvedValue(mockWeather);

      const existingActivity = { distance: 5000, weather: {} };
      const updatedActivity = { distance: 5500, weather: mockWeather };

      Canicross.findOne.mockResolvedValue(existingActivity);
      Canicross.findOneAndUpdate.mockResolvedValue(updatedActivity);

      const res = await request(app)
        .put('/api/canicross/some-id')
        .send({
          distance: 5500,
          location: { type: 'Point', coordinates: [7.0, 47.0] },
          date: '2024-01-21T14:00:00Z'
        });

      expect(res.statusCode).toEqual(200);
      expect(getWeather).toHaveBeenCalledWith(47.0, 7.0, '2024-01-21');
    });

    it('should return 404 if activity not found', async () => {
      Canicross.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/canicross/nonexistent')
        .send({ distance: 5500 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/canicross/:id', () => {
    it('should delete a canicross activity', async () => {
      Canicross.findOneAndDelete.mockResolvedValue({ distance: 5000 });

      const res = await request(app).delete('/api/canicross/some-id');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ message: 'Canicross activity successfully deleted.' });
    });

    it('should return 404 if activity not found', async () => {
      Canicross.findOneAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/canicross/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
    });

    it('should handle errors', async () => {
      Canicross.findOneAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/canicross/some-id');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message');
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
