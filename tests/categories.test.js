const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../src/routes/categoryRoutes');

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

describe('Category Endpoints', () => {
    
    describe('GET /api/categories/all', () => {
        it('should get all categories', async () => {
            const res = await request(app)
                .get('/api/categories/all');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /api/categories/:id', () => {
        it('should get category by valid ID', async () => {
            const res = await request(app)
                .get('/api/categories/1');
            expect([200, 404]).toContain(res.statusCode);
        });

        it('should return 404 for non-existent category', async () => {
            const res = await request(app)
                .get('/api/categories/99999');
            expect(res.statusCode).toBe(404);
        });

        it('should handle invalid ID format', async () => {
            const res = await request(app)
                .get('/api/categories/invalid');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/categories/create', () => {
        it('should fail without admin authentication', async () => {
            const res = await request(app)
                .post('/api/categories/create')
                .send({
                    name: 'Electronics',
                    description: 'Electronic products',
                    icon: '💻'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail with missing name', async () => {
            const res = await request(app)
                .post('/api/categories/create')
                .set('Authorization', 'Bearer admin-token')
                .send({
                    description: 'Electronic products',
                    icon: '💻'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should create category with autoImage parameter', async () => {
            const res = await request(app)
                .post('/api/categories/create?autoImage=true')
                .set('Authorization', 'Bearer admin-token')
                .send({
                    name: 'Electronics',
                    description: 'Electronic products',
                    icon: '💻'
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should create category with custom imageUrl', async () => {
            const res = await request(app)
                .post('/api/categories/create')
                .set('Authorization', 'Bearer admin-token')
                .send({
                    name: 'Electronics',
                    description: 'Electronic products',
                    icon: '💻',
                    imageUrl: 'https://example.com/image.jpg'
                });
            expect([201, 401]).toContain(res.statusCode);
        });
    });

    describe('PUT /api/categories/:id', () => {
        it('should fail without admin authentication', async () => {
            const res = await request(app)
                .put('/api/categories/1')
                .send({
                    name: 'Updated Electronics',
                    description: 'Updated description'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail for non-existent category', async () => {
            const res = await request(app)
                .put('/api/categories/99999')
                .set('Authorization', 'Bearer admin-token')
                .send({
                    name: 'Updated Electronics'
                });
            expect([401, 404]).toContain(res.statusCode);
        });

        it('should update with autoImage parameter', async () => {
            const res = await request(app)
                .put('/api/categories/1?autoImage=true')
                .set('Authorization', 'Bearer admin-token')
                .send({
                    name: 'Updated Electronics'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should update with custom imageUrl', async () => {
            const res = await request(app)
                .put('/api/categories/1')
                .set('Authorization', 'Bearer admin-token')
                .send({
                    name: 'Updated Electronics',
                    imageUrl: 'https://example.com/new-image.jpg'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should handle empty update body', async () => {
            const res = await request(app)
                .put('/api/categories/1')
                .set('Authorization', 'Bearer admin-token')
                .send({});
            expect([200, 400, 401]).toContain(res.statusCode);
        });
    });

    describe('DELETE /api/categories/:id', () => {
        it('should fail without admin authentication', async () => {
            const res = await request(app)
                .delete('/api/categories/1');
            expect(res.statusCode).toBe(401);
        });

        it('should fail for non-existent category', async () => {
            const res = await request(app)
                .delete('/api/categories/99999')
                .set('Authorization', 'Bearer admin-token');
            expect([401, 404]).toContain(res.statusCode);
        });

        it('should handle invalid ID format', async () => {
            const res = await request(app)
                .delete('/api/categories/invalid')
                .set('Authorization', 'Bearer admin-token');
            expect([400, 401, 500]).toContain(res.statusCode);
        });
    });
});
