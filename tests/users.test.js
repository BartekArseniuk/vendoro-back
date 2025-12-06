const request = require('supertest');
const express = require('express');
const userRoutes = require('../src/routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Endpoints', () => {
    
    describe('GET /api/users/me', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/users/me');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with malformed authorization header', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', 'InvalidFormat');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/users/me', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .send({
                    firstName: 'Updated',
                    lastName: 'Name'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', 'Bearer invalid-token')
                .send({
                    firstName: 'Updated',
                    lastName: 'Name'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail with empty body', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', 'Bearer valid-token')
                .send({});
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid email format', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    email: 'invalid-email'
                });
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('DELETE /api/users/me', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .delete('/api/users/me');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .delete('/api/users/me')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with expired token', async () => {
            const res = await request(app)
                .delete('/api/users/me')
                .set('Authorization', 'Bearer expired-token');
            expect(res.statusCode).toBe(401);
        });
    });
});
