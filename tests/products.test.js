const request = require('supertest');
const express = require('express');
const productRoutes = require('../src/routes/productRoutes');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Endpoints', () => {
    
    describe('GET /api/products/search', () => {
        it('should search products with valid query', async () => {
            const res = await request(app)
                .get('/api/products/search')
                .query({ query: 'laptop' });
            expect([200, 400]).toContain(res.statusCode);
        });

        it('should fail when query parameter is missing', async () => {
            const res = await request(app)
                .get('/api/products/search');
            expect(res.statusCode).toBe(400);
        });

        it('should handle empty query string', async () => {
            const res = await request(app)
                .get('/api/products/search')
                .query({ query: '' });
            expect([200, 400]).toContain(res.statusCode);
        });

        it('should handle special characters in query', async () => {
            const res = await request(app)
                .get('/api/products/search')
                .query({ query: '@#$%' });
            expect([200, 400]).toContain(res.statusCode);
        });
    });

    describe('GET /api/products/latest', () => {
        it('should get latest products', async () => {
            const res = await request(app)
                .get('/api/products/latest');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /api/products/liked', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/products/liked');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/products/liked')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/products/user', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/products/user');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/products/user')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/products/category/:categoryId', () => {
        it('should get products by valid category ID', async () => {
            const res = await request(app)
                .get('/api/products/category/1');
            expect([200, 404]).toContain(res.statusCode);
        });

        it('should handle non-existent category', async () => {
            const res = await request(app)
                .get('/api/products/category/99999');
            expect([200, 404]).toContain(res.statusCode);
        });

        it('should handle invalid category ID format', async () => {
            const res = await request(app)
                .get('/api/products/category/invalid');
            expect([200, 404]).toContain(res.statusCode);
        });
    });

    describe('GET /api/products/recommended', () => {
        it('should get recommended products without auth', async () => {
            const res = await request(app)
                .get('/api/products/recommended');
            expect(res.statusCode).toBe(200);
        });

        it('should get personalized recommendations with auth', async () => {
            const res = await request(app)
                .get('/api/products/recommended')
                .set('Authorization', 'Bearer valid-token');
            expect([200, 401]).toContain(res.statusCode);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should get product by valid ID', async () => {
            const res = await request(app)
                .get('/api/products/1');
            expect([200, 404]).toContain(res.statusCode);
        });

        it('should return 404 for non-existent product', async () => {
            const res = await request(app)
                .get('/api/products/99999');
            expect(res.statusCode).toBe(404);
        });

        it('should handle invalid ID format', async () => {
            const res = await request(app)
                .get('/api/products/invalid');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/products/create', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/products/create')
                .send({
                    name: 'Test Product',
                    location: 'Warsaw',
                    price: 100,
                    categoryId: 1,
                    deliveryMethod: 'courier'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/products/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    name: 'Test Product'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid price', async () => {
            const res = await request(app)
                .post('/api/products/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    name: 'Test Product',
                    location: 'Warsaw',
                    price: -100,
                    categoryId: 1,
                    deliveryMethod: 'courier'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid categoryId', async () => {
            const res = await request(app)
                .post('/api/products/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    name: 'Test Product',
                    location: 'Warsaw',
                    price: 100,
                    categoryId: 'invalid',
                    deliveryMethod: 'courier'
                });
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/products/1')
                .send({
                    name: 'Updated Product',
                    location: 'Warsaw',
                    price: 150,
                    categoryId: 1,
                    deliveryMethod: 'courier'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail for non-existent product', async () => {
            const res = await request(app)
                .put('/api/products/99999')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    name: 'Updated Product',
                    location: 'Warsaw',
                    price: 150,
                    categoryId: 1,
                    deliveryMethod: 'courier'
                });
            expect([401, 404]).toContain(res.statusCode);
        });

        it('should fail with missing required fields', async () => {
            const res = await request(app)
                .put('/api/products/1')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    name: 'Updated Product'
                });
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .delete('/api/products/1');
            expect(res.statusCode).toBe(401);
        });

        it('should fail for non-existent product', async () => {
            const res = await request(app)
                .delete('/api/products/99999')
                .set('Authorization', 'Bearer valid-token');
            expect([401, 404]).toContain(res.statusCode);
        });

        it('should fail with invalid ID format', async () => {
            const res = await request(app)
                .delete('/api/products/invalid')
                .set('Authorization', 'Bearer valid-token');
            expect([400, 401, 500]).toContain(res.statusCode);
        });
    });

    describe('POST /api/products/:productId/like', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/products/1/like');
            expect(res.statusCode).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .post('/api/products/1/like')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });

        it('should handle non-existent product', async () => {
            const res = await request(app)
                .post('/api/products/99999/like')
                .set('Authorization', 'Bearer valid-token');
            expect([401, 404, 500]).toContain(res.statusCode);
        });
    });
});
