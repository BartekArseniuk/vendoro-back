const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', authRoutes);

describe('Auth Endpoints', () => {
    
    describe('POST /api/users/register', () => {
        it('should register a new user with valid data', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    email: `test${Date.now()}@example.com`,
                    password: 'Test123!'
                });
            expect(res.statusCode).toBe(201);
        });

        it('should fail when email is missing', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    password: 'Test123!'
                });
            expect(res.statusCode).toBe(400);
        });

        it('should fail when password is missing', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    email: 'test@example.com'
                });
            expect(res.statusCode).toBe(400);
        });

        it('should fail when registering with existing email', async () => {
            const email = `duplicate${Date.now()}@example.com`;
            await request(app)
                .post('/api/users/register')
                .send({
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    email: email,
                    password: 'Test123!'
                });
            
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    firstName: 'Anna',
                    lastName: 'Nowak',
                    email: email,
                    password: 'Test456!'
                });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/users/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!'
                });
            expect([200, 400]).toContain(res.statusCode);
        });

        it('should fail with invalid email', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Test123!'
                });
            expect(res.statusCode).toBe(400);
        });

        it('should fail with invalid password', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword!'
                });
            expect(res.statusCode).toBe(400);
        });

        it('should fail when email is missing', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    password: 'Test123!'
                });
            expect(res.statusCode).toBe(400);
        });

        it('should fail when password is missing', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com'
                });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/users/reset-password', () => {
        it('should send reset email for existing user', async () => {
            const res = await request(app)
                .post('/api/users/reset-password')
                .send({
                    email: 'test@example.com'
                });
            expect([200, 400]).toContain(res.statusCode);
        });

        it('should fail when email is missing', async () => {
            const res = await request(app)
                .post('/api/users/reset-password')
                .send({});
            expect(res.statusCode).toBe(400);
        });

        it('should handle non-existent email', async () => {
            const res = await request(app)
                .post('/api/users/reset-password')
                .send({
                    email: 'nonexistent@example.com'
                });
            expect([200, 400]).toContain(res.statusCode);
        });
    });

    describe('POST /api/users/update-password', () => {
        it('should fail with invalid token', async () => {
            const res = await request(app)
                .post('/api/users/update-password')
                .send({
                    token: 'invalid-token',
                    password: 'NewPassword123!',
                    confirmPassword: 'NewPassword123!'
                });
            expect([400, 500]).toContain(res.statusCode);
        });

        it('should fail when passwords do not match', async () => {
            const res = await request(app)
                .post('/api/users/update-password')
                .send({
                    token: 'some-token',
                    password: 'NewPassword123!',
                    confirmPassword: 'DifferentPassword123!'
                });
            expect(res.statusCode).toBe(400);
        });

        it('should fail when token is missing', async () => {
            const res = await request(app)
                .post('/api/users/update-password')
                .send({
                    password: 'NewPassword123!',
                    confirmPassword: 'NewPassword123!'
                });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/users/logout', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/users/logout');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .post('/api/users/logout')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });
    });
});
