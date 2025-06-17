const axios = require('axios');
const qs = require('qs');
const config = require('../../config/config.json')[process.env.NODE_ENV || 'development'];

let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const auth = Buffer.from(`${config.PAYU.OAUTH_CLIENT_ID}:${config.PAYU.OAUTH_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
        'https://secure.snd.payu.com/pl/standard/user/oauth/authorize',
        qs.stringify({ grant_type: 'client_credentials' }),
        {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return accessToken;
}

async function createPayUOrder(order, payment) {
    const token = await getAccessToken();

    const continueUrl = `${config.FRONTEND_URL}${config.PAYU.CONTINUE_PATH}/${order.id}`;

    const body = {
        notifyUrl: `${config.BASE_URL}/api/orders/payu-callback`,
        customerIp: '127.0.0.1',
        merchantPosId: config.PAYU.POS_ID,
        description: `Zamówienie ${order.orderNumber}`,
        currencyCode: 'PLN',
        totalAmount: Math.round(payment.amount * 100),
        buyer: {
            email: order.user.email,
            firstName: order.user.firstName.split(' ')[0],
            lastName: order.user.lastName.split(' ')[0],
            phone: order.user.phone,
        },
        products: [
            {
                name: order.product.name,
                unitPrice: Math.round(order.productPrice * 100),
                quantity: 1,
            },
        ],
        continueUrl
    };

    const response = await axios.post(
        config.PAYU.ORDER_URL,
        body,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            maxRedirects: 0,
            validateStatus: status => status >= 200 && status < 303,
        }
    );

    if ((response.status === 302 || response.status === 301) && response.headers.location) {
        return { redirectUri: response.headers.location };
    }

    if (response.data.redirectUri || response.data.redirectUrl) {
        return { redirectUri: response.data.redirectUri || response.data.redirectUrl };
    }

    throw new Error('Nie można uzyskać linku płatności z odpowiedzi PayU');
}

module.exports = {
    createPayUOrder,
};