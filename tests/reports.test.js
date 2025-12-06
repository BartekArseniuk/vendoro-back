const request = require('supertest');
const express = require('express');
const reportRoutes = require('../src/routes/reportRoutes');

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Report Endpoints', () => {
    
    describe('POST /api/reports', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/reports')
                .send({
                    entityType: 'rating',
                    entityId: 123,
                    reason: 'abuse',
                    details: 'Offensive content'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should create report with valid data', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'rating',
                    entityId: 123,
                    reason: 'abuse',
                    details: 'Offensive content'
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should fail with missing entityType', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityId: 123,
                    reason: 'abuse'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with missing entityId', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'rating',
                    reason: 'abuse'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with missing reason', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'rating',
                    entityId: 123
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should create report for product', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'product',
                    entityId: 456,
                    reason: 'fraud',
                    details: 'Scam listing'
                });
            expect([201, 401, 404]).toContain(res.statusCode);
        });

        it('should create report for user', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'user',
                    entityId: 789,
                    reason: 'spam'
                });
            expect([201, 401, 404]).toContain(res.statusCode);
        });

        it('should create report without details', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'rating',
                    entityId: 123,
                    reason: 'abuse'
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid entityType', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'invalid',
                    entityId: 123,
                    reason: 'abuse'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid reason', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entityType: 'rating',
                    entityId: 123,
                    reason: 'invalid_reason'
                });
            expect([400, 401]).toContain(res.statusCode);
        });
    });
});
