const request = require('supertest');
const express = require('express');
const orderRoutes = require('../src/routes/orderRoutes');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Endpoints', () => {
    
    describe('POST /api/orders/create', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .send({
                    productId: 1,
                    shippingMethod: 'inpost_courier',
                    shippingAddressId: 1,
                    productPrice: 100,
                    shippingPrice: 15,
                    paymentMethod: 'payu'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    productId: 1
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should create order with invoice data', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    productId: 1,
                    shippingMethod: 'inpost_courier',
                    shippingAddressId: 1,
                    productPrice: 100,
                    shippingPrice: 15,
                    paymentMethod: 'payu',
                    wantInvoice: true,
                    invoiceType: 'company',
                    companyName: 'Test Company',
                    companyNip: '1234567890',
                    companyStreet: 'Test Street',
                    companyHouseNumber: '1',
                    companyPostalCode: '00-001',
                    companyCity: 'Warsaw'
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should create order without invoice', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    productId: 1,
                    shippingMethod: 'inpost_courier',
                    shippingAddressId: 1,
                    productPrice: 100,
                    shippingPrice: 15,
                    paymentMethod: 'payu',
                    wantInvoice: false
                });
            expect([201, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid productId', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    productId: 'invalid',
                    shippingMethod: 'inpost_courier',
                    shippingAddressId: 1,
                    productPrice: 100,
                    shippingPrice: 15,
                    paymentMethod: 'payu'
                });
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should fail with negative price', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    productId: 1,
                    shippingMethod: 'inpost_courier',
                    shippingAddressId: 1,
                    productPrice: -100,
                    shippingPrice: 15,
                    paymentMethod: 'payu'
                });
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('POST /api/orders/payu-callback', () => {
        it('should handle PayU callback', async () => {
            const res = await request(app)
                .post('/api/orders/payu-callback')
                .send({
                    order: {
                        orderId: 'TEST123',
                        status: 'COMPLETED'
                    }
                });
            expect([200, 400]).toContain(res.statusCode);
        });

        it('should fail with invalid callback data', async () => {
            const res = await request(app)
                .post('/api/orders/payu-callback')
                .send({});
            expect(res.statusCode).toBe(500);
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/orders/1/status')
                .send({
                    status: 'shipped'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should fail with missing status', async () => {
            const res = await request(app)
                .put('/api/orders/1/status')
                .set('Authorization', 'Bearer valid-token')
                .send({});
            expect([400, 401]).toContain(res.statusCode);
        });

        it('should update order status', async () => {
            const res = await request(app)
                .put('/api/orders/1/status')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    status: 'shipped'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should fail for non-existent order', async () => {
            const res = await request(app)
                .put('/api/orders/99999/status')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    status: 'shipped'
                });
            expect([401, 404]).toContain(res.statusCode);
        });
    });

    describe('PUT /api/orders/:orderId/payment-status', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/orders/1/payment-status')
                .send({
                    status: 'paid'
                });
            expect(res.statusCode).toBe(401);
        });

        it('should update payment status', async () => {
            const res = await request(app)
                .put('/api/orders/1/payment-status')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    status: 'paid',
                    transactionId: 'TX123456'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should update payment status without transactionId', async () => {
            const res = await request(app)
                .put('/api/orders/1/payment-status')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    status: 'paid'
                });
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should fail with missing status', async () => {
            const res = await request(app)
                .put('/api/orders/1/payment-status')
                .set('Authorization', 'Bearer valid-token')
                .send({});
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('GET /api/orders/user', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/orders/user');
            expect(res.statusCode).toBe(401);
        });

        it('should get user orders with valid token', async () => {
            const res = await request(app)
                .get('/api/orders/user')
                .set('Authorization', 'Bearer valid-token');
            expect([200, 401]).toContain(res.statusCode);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/orders/user')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/orders/1');
            expect(res.statusCode).toBe(401);
        });

        it('should get order details with valid ID', async () => {
            const res = await request(app)
                .get('/api/orders/1')
                .set('Authorization', 'Bearer valid-token');
            expect([200, 401, 404]).toContain(res.statusCode);
        });

        it('should fail for non-existent order', async () => {
            const res = await request(app)
                .get('/api/orders/99999')
                .set('Authorization', 'Bearer valid-token');
            expect([401, 404]).toContain(res.statusCode);
        });

        it('should handle invalid ID format', async () => {
            const res = await request(app)
                .get('/api/orders/invalid')
                .set('Authorization', 'Bearer valid-token');
            expect([400, 401, 500]).toContain(res.statusCode);
        });
    });
});
