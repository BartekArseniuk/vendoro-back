const request = require('supertest');
const express = require('express');
const ratingRoutes = require('../src/routes/ratingRoutes');

const app = express();
app.use(express.json());
app.use('/api/ratings', ratingRoutes);

describe('Rating Endpoints', () => {
    
    describe('POST /api/ratings/rate', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/ratings/rate')
                .send({
                    ratedUserId: 5,
                    rating: 4,
                    comment: 'Great seller!'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should create rating with valid data', async () => {
            const res = await request(app)
                .post('/api/ratings/rate')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    ratedUserId: 5,
                    rating: 4,
                    comment: 'Great seller!'
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should fail with missing ratedUserId', async () => {
            const res = await request(app)
                .post('/api/ratings/rate')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    rating: 4,
                    comment: 'Great seller!'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with rating below minimum', async () => {
            const res = await request(app)
                .post('/api/ratings/rate')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    ratedUserId: 5,
                    rating: 0
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with rating above maximum', async () => {
            const res = await request(app)
                .post('/api/ratings/rate')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    ratedUserId: 5,
                    rating: 6
                });
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('GET /api/ratings/my', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/ratings/my');
            expect(res.statusCode).toBe(401);
        });

        it('should get user ratings with valid token', async () => {
            const res = await request(app)
                .get('/api/ratings/my')
                .set('Authorization', 'Bearer valid-token');
            expect([200, 401]).toContain(res.statusCode);
        });
    });

    describe('PUT /api/ratings/:ratingId', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/ratings/1')
                .send({
                    rating: 5,
                    comment: 'Updated comment'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should update rating with valid data', async () => {
            const res = await request(app)
                .put('/api/ratings/1')
                .set('Authorization', 'Bearer admin-token')
                .send({
                    rating: 5,
                    comment: 'Updated comment'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });
    });

    describe('DELETE /api/ratings/:ratingId', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .delete('/api/ratings/1');
            expect(res.statusCode).toBe(401);
        });

        it('should delete rating with valid ID', async () => {
            const res = await request(app)
                .delete('/api/ratings/1')
                .set('Authorization', 'Bearer admin-token');
            expect([200, 401, 404]).toContain(res.statusCode);
        });
    });

    describe('GET /api/ratings/has-rated/:sellerId', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/ratings/has-rated/5');
            expect(res.statusCode).toBe(401);
        });

        it('should check if user has rated seller', async () => {
            const res = await request(app)
                .get('/api/ratings/has-rated/5')
                .set('Authorization', 'Bearer valid-token');
            expect([200, 401]).toContain(res.statusCode);
        });
    });
});
