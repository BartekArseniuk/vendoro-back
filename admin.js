import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import AdminJSSequelize from '@adminjs/sequelize'
import db from './src/models/index.js'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { ComponentLoader } from 'adminjs'
import { Op } from 'sequelize'
import dayjs from 'dayjs'

const require = createRequire(import.meta.url)
const config = require('./config/config.json')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

AdminJS.registerAdapter(AdminJSSequelize)

// Rejestracja komponentów
const componentLoader = new ComponentLoader()
const COMPONENTS = {
  Dashboard: componentLoader.add('Dashboard', path.join(__dirname, 'admin', 'dashboard-component.jsx')),
  Login: componentLoader.override('Login', path.join(__dirname, 'admin', 'custom-login.jsx')),
}

const adminJs = new AdminJS({
  databases: [db.sequelize],
  rootPath: '/admin',
  componentLoader,
  loginPage: {
    component: COMPONENTS.Login,
  },
  dashboard: {
    handler: async (request) => {
      const days = parseInt(request.query?.days) || 7

      const usersCount = await db.User.count()
      const productsCount = await db.Product.count()
      const ordersCount = await db.Order.count()

      const sales = await db.Order.findAll({
        attributes: ['createdAt'],
        where: {
          createdAt: {
            [Op.gte]: dayjs().subtract(days, 'day').startOf('day').toDate(),
          },
        },
      })

      const lastSoldProducts = await db.Order.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        }],
        attributes: ['id', 'createdAt']
      })

      const salesByCategory = await db.Order.findAll({
        include: [{
          model: db.Product,
          as: 'product',
          include: [{
            model: db.Category,
            as: 'category',
            attributes: ['id', 'name']
          }]
        }],
        where: {
          createdAt: {
            [Op.gte]: dayjs().subtract(days, 'day').startOf('day').toDate(),
          },
        },
        attributes: ['id']
      })

      const categorySalesMap = {}
      salesByCategory.forEach(order => {
        if (order.product && order.product.category) {
          const categoryId = order.product.category.id
          const categoryName = order.product.category.name
          categorySalesMap[categoryId] = categorySalesMap[categoryId] || {
            id: categoryId,
            name: categoryName,
            count: 0
          }
          categorySalesMap[categoryId].count++
        }
      })
      const salesByCategoryData = Object.values(categorySalesMap)
        .sort((a, b) => b.count - a.count)
      let salesChartData = []

      if (days <= 30) {
        const lastDays = Array.from({ length: days }).map((_, i) => {
          const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD')
          return { date, count: 0 }
        })

        for (const sale of sales) {
          const date = dayjs(sale.createdAt).format('YYYY-MM-DD')
          const match = lastDays.find(d => d.date === date)
          if (match) match.count++
        }
        salesChartData = lastDays

      } else {
        const monthsCount = days === 365 ? 12 : Math.ceil(days / 30)
        const startMonth = dayjs().subtract(monthsCount - 1, 'month').startOf('month')

        const months = Array.from({ length: monthsCount }).map((_, i) => {
          const month = startMonth.add(i, 'month')
          return {
            month: month.format('YYYY-MM'),
            label: month.format('MMMM'),
            count: 0,
          }
        })

        for (const sale of sales) {
          const saleMonth = dayjs(sale.createdAt).format('YYYY-MM')
          const match = months.find(m => m.month === saleMonth)
          if (match) match.count++
        }

        salesChartData = months.map(m => ({
          date: m.label,
          count: m.count,
        }))
      }

      return {
        usersCount,
        productsCount,
        ordersCount,
        salesChartData,
        lastSoldProducts: lastSoldProducts.map(order => ({
          id: order.id,
          productId: order.product.id,
          productName: order.product.name,
          price: order.product.price,
          date: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')
        })),
        salesByCategory: salesByCategoryData
      }
    },
    component: COMPONENTS.Dashboard,
  },
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
        navigation: { name: 'Resources' },
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
        navigation: { name: 'Resources' },
        listProperties: ['id', 'userId', 'city', 'street', 'houseNumber', 'postalCode'],
      }
    },
    {
      resource: db.Rating, options: {
        navigation: { name: 'Resources' },
        listProperties: ['id', 'rating', 'comment', 'raterUserId', 'ratedUserId'],
      }
    },
    {
      resource: db.Session, options: {
        navigation: { name: 'Resources' },
      }
    },
    {
      resource: db.Category, options: {
        navigation: { name: 'Resources' },
        listProperties: ['id', 'name', 'description', 'icon'],
      }
    },
    {
      resource: db.Product, options: {
        navigation: { name: 'Resources' },
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
        navigation: { name: 'Resources' },
        listProperties: ['id', 'userId', 'productId'],
      }
    },
    {
      resource: db.Order, options: {
        navigation: { name: 'Resources' },
        listProperties: ['id', 'orderNumber', 'userId', 'productId', 'wantInvoice', 'status', 'totalPrice'],
      }
    },
    {
      resource: db.Payment,
      options: {
        navigation: { name: 'Resources' },
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