const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config/config.json');
const path = require('path');

const userRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');

dotenv.config();

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Konfiguracja Swaggera
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vendoro API',
            version: '1.0.0',
            description: 'Test API',
        },
        servers: [
            {
                url: config.development.BASE_URL,
            },
        ],
        tags: [
            {
                name: 'Authorization',
                description: 'Endpointy odpowiedzialne za rejestrację i logowanie użytkowników',
            },
            {
                name: 'Users',
                description: 'Endpointy odpowiedzialne za zarządzanie użytkownikami',
            },
            {
                name: 'Categories',
                description: 'Endpointy odpowiedzialne za zarządzanie kategoriami',
            },
            {
                name: 'Products',
                description: 'Endpointy odpowiedzialne za zarządzanie produktami',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

module.exports = swaggerOptions;

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const options = {
    swaggerOptions: {
        docExpansion: 'none'
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at: ${config.development.BASE_URL}/api-docs`);
});