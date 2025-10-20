const request = require('supertest');
const app = require('../index'); // The express app
const Trail = require('../Model/trail');
const mongoose = require('mongoose');

jest.mock('../Model/trail'); // Mock the Trail model

describe('Mantrailing API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/mantrailing', () => {
        it('should return all trails', async () => {
            const mockTrails = [{ dogName: 'Buddy' }, { dogName: 'Lucy' }];
            Trail.find.mockResolvedValue(mockTrails);

            const res = await request(app).get('/api/mantrailing');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockTrails);
            expect(Trail.find).toHaveBeenCalledTimes(1);
        });

        it('should handle errors', async () => {
            const error = new Error('Something went wrong');
            Trail.find.mockRejectedValue(error);

            const res = await request(app).get('/api/mantrailing');

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/mantrailing/save', () => {
        it('should save a new trail', async () => {
            const mockTrail = { dogName: 'Buddy' };
            const newTrail = { ...mockTrail };
            
            // Mock the save method on the Trail model's prototype
            Trail.prototype.save = jest.fn().mockResolvedValue(newTrail);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send(mockTrail);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(newTrail);
            expect(Trail.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('should handle errors on save', async () => {
            const error = new Error('Something went wrong');
            Trail.prototype.save = jest.fn().mockRejectedValue(error);

            const res = await request(app)
                .post('/api/mantrailing/save')
                .send({ dogName: 'Buddy' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/mantrailing/delete', () => {
        it('should delete a trail', async () => {
            Trail.deleteOne.mockResolvedValue({ n: 1 });

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
            Trail.updateOne.mockResolvedValue({ nModified: 1 });
            const updatedTrail = {
                dogName: 'Buddy',
                handlerName: 'John',
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
            Trail.updateOne.mockRejectedValue(new Error('Something went wrong'));

            const res = await request(app)
                .post('/api/mantrailing/update')
                .send({ id: 'some-id', trail: { dogName: 'Buddy' } });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ success: false });
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});
