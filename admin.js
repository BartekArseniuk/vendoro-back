import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import AdminJSSequelize from '@adminjs/sequelize'
import db from './src/models/index.js'
import bcrypt from 'bcrypt'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const config = require('./config/config.json')

AdminJS.registerAdapter(AdminJSSequelize)

const adminJs = new AdminJS({
  databases: [db.sequelize],
  rootPath: '/admin',
  branding: {
    companyName: 'Vendoro Control Panel',
    logo: false,
    softwareBrothers: false,
    theme: {
      colors: {
        primary100: '#FE8D1C',
        primary80: '#FE8D1C',
        primary60: '#FE8D1C',
        grey100: '#242424',
        grey80: '#242424',
        grey20: '#F2F2F2',
        filterBg: '#F2F2F2',
        hoverBg: '#FE8D1C33',
        accent: '#FE8D1C',
      },
    },
  },
  resources: [
    {
      resource: db.User, options: {
        listProperties: ['id', 'email', 'firstName', 'lastName', 'phone', 'isVerified'],
        properties: {
          avatar: { isVisible: false },
          password: { isVisible: false },
          passwordChangedAt: { isDisabled: true },
        },
      }
    },
    {
      resource: db.Address, options: {
        listProperties: ['id', 'userId', 'city', 'street', 'houseNumber', 'postalCode'],
      }
    },
    {
      resource: db.Rating, options: {
        listProperties: ['id', 'rating', 'comment', 'raterUserId', 'ratedUserId'],
      }
    },
    { resource: db.Session },
    {
      resource: db.Category, options: {
        listProperties: ['id', 'name', 'description', 'icon'],
      }
    },
    {
      resource: db.Product, options: {
        listProperties: ['id', 'name', 'location', 'price', 'condition'],
        properties: {
          photo1: { isVisible: false },
          photo2: { isVisible: false },
          photo3: { isVisible: false },
          photo4: { isVisible: false },
          photo5: { isVisible: false },
        },
      }
    },
    {
      resource: db.ProductLike, options: {
        listProperties: ['id', 'userId', 'productId'],
      }
    },
    {
      resource: db.Order, options: {
        listProperties: ['id', 'orderNumber', 'userId', 'productId', 'wantInvoice', 'status', 'totalPrice'],
      }
    },
    {
      resource: db.Payment,
      options: {
        listProperties: ['id', 'orderNumber', 'method', 'status', 'amount'],
        properties: {
          orderId: { isVisible: false },
          orderNumber: {
            isVisible: { list: true, filter: true, show: true, edit: false },
            isVirtual: true,
          },
        },
        actions: {
          list: {
            after: async (response) => {
              await Promise.all(response.records.map(attachOrderNumber));
              return response;
            }
          },
          show: {
            after: async (response) => {
              await attachOrderNumber(response.record);
              return response;
            }
          }
        }
      }
    },
  ]
})

const authenticate = async (email, password) => {
  try {
    const user = await db.User.findOne({
      where: { email },
      attributes: ['id', 'email', 'password', 'role', 'firstName', 'lastName']
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    if (user.role !== 'admin') {
      throw new Error('User is not an admin')
    }

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role
    }
  } catch (error) {
    throw error
  }
}

const env = process.env.NODE_ENV || 'development'
const adminConfig = config[env].ADMINJS

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: adminConfig.COOKIE_SECRET,
  },
  null,
  {
    resave: true,
    saveUninitialized: true,
    secret: adminConfig.SESSION_SECRET,
    cookie: {
      httpOnly: adminConfig.COOKIE_HTTPONLY,
      secure: adminConfig.COOKIE_SECURE,
      maxAge: 1000 * 60 * 60 * 24,
    },
    name: 'adminjs',
  }
)

const attachOrderNumber = async (record) => {
  const orderId = record.params.orderId;
  if (orderId) {
    const order = await db.Order.findByPk(orderId, {
      attributes: ['orderNumber']
    });
    record.params.orderNumber = order ? order.orderNumber : null;
  }
};

export { adminJs, adminRouter }