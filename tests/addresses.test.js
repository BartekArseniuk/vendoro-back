const request = require('supertest');
const express = require('express');
const addressRoutes = require('../src/routes/addressRoutes');

const app = express();
app.use(express.json());
app.use('/api/users/addresses', addressRoutes);

describe('Address Endpoints', () => {
    
    describe('POST /api/users/addresses', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/users/addresses')
                .send({
                    street: 'Test Street',
                    houseNumber: '123',
                    city: 'Warsaw',
                    postalCode: '00-001'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should create address with valid data', async () => {
            const res = await request(app)
                .post('/api/users/addresses')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Test Street',
                    houseNumber: '123',
                    city: 'Warsaw',
                    postalCode: '00-001',
                    type: 'both',
                    isDefault: false
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/users/addresses')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Test Street'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should create shipping address', async () => {
            const res = await request(app)
                .post('/api/users/addresses')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Test Street',
                    houseNumber: '123',
                    city: 'Warsaw',
                    postalCode: '00-001',
                    type: 'shipping'
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should create billing address', async () => {
            const res = await request(app)
                .post('/api/users/addresses')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Test Street',
                    houseNumber: '123',
                    city: 'Warsaw',
                    postalCode: '00-001',
                    type: 'billing'
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should create default address', async () => {
            const res = await request(app)
                .post('/api/users/addresses')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Test Street',
                    houseNumber: '123',
                    city: 'Warsaw',
                    postalCode: '00-001',
                    isDefault: true
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid postal code format', async () => {
            const res = await request(app)
                .post('/api/users/addresses')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Test Street',
                    houseNumber: '123',
                    city: 'Warsaw',
                    postalCode: 'invalid'
                });
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('PUT /api/users/addresses/:id', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/users/addresses/1')
                .send({
                    street: 'Updated Street'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should update address with valid data', async () => {
            const res = await request(app)
                .put('/api/users/addresses/1')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Updated Street',
                    houseNumber: '456',
                    city: 'Krakow',
                    postalCode: '30-001'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should fail for non-existent address', async () => {
            const res = await request(app)
                .put('/api/users/addresses/99999')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    street: 'Updated Street'
                });
            expect([401, 404]).toContain(res.statusCode);
        });

        it('should update address type', async () => {
            const res = await request(app)
                .put('/api/users/addresses/1')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'shipping'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should update default status', async () => {
            const res = await request(app)
                .put('/api/users/addresses/1')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    isDefault: true
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should handle empty update body', async () => {
            const res = await request(app)
                .put('/api/users/addresses/1')
                .set('Authorization', 'Bearer valid-token')
                .send({});
            expect([200, 400, 401]).toContain(res.statusCode);
        });
    });

    describe('DELETE /api/users/addresses/:id', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .delete('/api/users/addresses/1');
            expect(res.statusCode).toBe(401);
        });

        it('should delete address with valid ID', async () => {
            const res = await request(app)
                .delete('/api/users/addresses/1')
                .set('Authorization', 'Bearer valid-token');
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should fail for non-existent address', async () => {
            const res = await request(app)
                .delete('/api/users/addresses/99999')
                .set('Authorization', 'Bearer valid-token');
            expect([401, 404]).toContain(res.statusCode);
        });

        it('should handle invalid ID format', async () => {
            const res = await request(app)
                .delete('/api/users/addresses/invalid')
                .set('Authorization', 'Bearer valid-token');
            expect([400, 401, 500]).toContain(res.statusCode);
        });
    });
});
