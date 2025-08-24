const { Product, ProductLike, User, Category, Rating } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');

const withLikesCount = (alias = 'likesCount') => ([
    [
        sequelize.literal(`(
      SELECT COUNT(*)
      FROM \`product_likes\` pl
      WHERE pl.\`productId\` = \`Product\`.\`id\`
    )`),
        alias
    ]
]);

const addLikesToProducts = async (products) => {
    return Promise.all(products.map(async (product) => {
        const likesCount = await ProductLike.count({ where: { productId: product.id } });
        return { ...product.toJSON(), likesCount };
    }));
};

exports.searchProducts = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Brak frazy do wyszukania' });
    }

    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'description', 'location', 'price', 'condition', 'deliveryMethod', 'photo1'],
            where: {
                isSold: false,
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } }
                ]
            },
            order: [['createdAt', 'DESC']],
        });

        const productsWithLikes = await addLikesToProducts(products);
        return res.status(200).json(productsWithLikes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy wyszukiwaniu produktów' });
    }
};

exports.getLatestProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'description', 'price', 'photo1'],
            where: { isSold: false },
            limit: 12,
            order: [['createdAt', 'DESC']]
        });

        const productsWithLikes = await addLikesToProducts(products);
        return res.status(200).json(productsWithLikes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu najnowszych produktów' });
    }
};

exports.getLikedProducts = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }

    try {
        const likedLinks = await ProductLike.findAll({
            where: { userId },
            attributes: ['productId'],
        });

        const productIds = likedLinks.map(like => like.productId);

        const likedProducts = await Product.findAll({
            where: { id: productIds },
            attributes: ['id', 'name', 'description', 'price', 'photo1', 'isSold'],
        });

        const productsWithLikes = await addLikesToProducts(likedProducts);
        return res.status(200).json(productsWithLikes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu polubionych produktów' });
    }
};

exports.getProductsByLoggedInUser = async (req, res) => {
    const userId = req.user.id;

    try {
        const products = await Product.findAll({ where: { userId } });
        const productsWithLikes = await addLikesToProducts(products);
        return res.status(200).json(productsWithLikes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu produktów użytkownika' });
    }
};

exports.getProductsByCategoryId = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'description', 'price', 'photo1'],
            where: { categoryId, isSold: false },
            order: [['createdAt', 'DESC']]
        });

        const productsWithLikes = await addLikesToProducts(products);
        return res.status(200).json(productsWithLikes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu produktów dla tej kategorii' });
    }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name', 'icon'],
                    as: 'category',
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Produkt nie znaleziony' });
        }

        const likesCount = await ProductLike.count({ where: { productId: id } });

        let userData = null;
        if (product.userId) {
            const user = await User.findByPk(product.userId, {
                attributes: ['avatar', 'firstName', 'lastName', 'email', 'createdAt', ...(product.sharePhoneNumber ? ['phone'] : [])]
            });

            const ratingsStats = await Rating.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
                ],
                where: { ratedUserId: product.userId },
                raw: true
            });

            userData = {
                ...user?.toJSON(),
                averageRating: ratingsStats?.averageRating ? parseFloat(ratingsStats.averageRating).toFixed(2) : null,
                totalRatings: ratingsStats?.totalRatings ? parseInt(ratingsStats.totalRatings, 10) : 0
            };
        }

        return res.status(200).json({
            ...product.toJSON(),
            user: userData,
            category: product.category,
            likesCount
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu produktu' });
    }
};

exports.createProduct = async (req, res) => {
    const {
        name, description, location, price, condition, deliveryMethod,
        sharePhoneNumber, photo1, photo2, photo3, photo4, photo5,
        categoryId, isSold
    } = req.body;

    const userId = req.user.id;

    try {
        if (!name || !description || !location || !price || !condition || !categoryId || !deliveryMethod) {
            return res.status(400).json({ message: 'Wszystkie wymagane pola muszą być wypełnione' });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({ message: 'Kategoria nie istnieje' });
        }

        const newProduct = await Product.create({
            name, description, location, price, condition, deliveryMethod,
            sharePhoneNumber, photo1, photo2, photo3, photo4, photo5,
            categoryId, userId, isSold
        });

        return res.status(201).json({
            message: 'Produkt został pomyślnie stworzony',
            product: newProduct,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy tworzeniu produktu' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        name, description, location, price, condition, deliveryMethod,
        sharePhoneNumber, photo1, photo2, photo3, photo4, photo5,
        categoryId, isSold
    } = req.body;

    const userId = req.user.id;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produkt nie znaleziony' });
        }

        if (product.userId !== userId) {
            return res.status(401).json({ message: 'Brak dostępu do edycji tego produktu' });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({ message: 'Kategoria nie istnieje' });
        }

        Object.assign(product, {
            name, description, location, price, condition, deliveryMethod,
            sharePhoneNumber, photo1, photo2, photo3, photo4, photo5,
            categoryId, isSold
        });

        await product.save();

        return res.status(200).json({
            message: 'Produkt został zaktualizowany',
            product,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy aktualizacji produktu' });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produkt nie znaleziony' });
        }

        if (product.userId !== userId) {
            return res.status(401).json({ message: 'Brak dostępu do usunięcia tego produktu' });
        }

        await product.destroy();

        return res.status(200).json({ message: 'Produkt został usunięty' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy usuwaniu produktu' });
    }
};

exports.toggleLike = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }

    try {
        const existingLike = await ProductLike.findOne({ where: { productId, userId } });

        if (existingLike) {
            await existingLike.destroy();
            return res.status(200).json({ liked: false, message: 'Polubienie usunięte' });
        } else {
            await ProductLike.create({ productId, userId });
            return res.status(201).json({ liked: true, message: 'Produkt polubiony' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd podczas zmiany stanu polubienia' });
    }
};

exports.getRecommendedForUser = async (req, res) => {
    const userId = req.user?.id;

    try {
        if (!userId) {
            const trending = await Product.findAll({
                where: { isSold: false },
                attributes: [
                    'id', 'name', 'description', 'price', 'photo1', 'categoryId', 'createdAt',
                    ...withLikesCount()
                ],
                order: [
                    [sequelize.literal('`likesCount`'), 'DESC'],
                    ['createdAt', 'DESC']
                ],
                limit: 12
            });
            return res.status(200).json(trending);
        }

        const liked = await ProductLike.findAll({
            where: { userId },
            attributes: [],
            include: [{
                model: Product,
                attributes: ['categoryId', 'price'],
                required: true
            }]
        });

        let userOwned = [];
        if (liked.length === 0) {
            userOwned = await Product.findAll({
                where: { userId },
                attributes: ['categoryId', 'price']
            });
        }

        const signalRows = [
            ...liked.map(l => l.Product),
            ...userOwned
        ];

        if (signalRows.length === 0) {
            const trending = await Product.findAll({
                where: { isSold: false },
                attributes: [
                    'id', 'name', 'description', 'price', 'photo1', 'categoryId', 'createdAt',
                    ...withLikesCount()
                ],
                order: [
                    [sequelize.literal('`likesCount` DESC'), 'DESC'],
                    ['createdAt', 'DESC']
                ],
                limit: 12
            });
            return res.status(200).json(trending);
        }

        const categoryFreq = {};
        const prices = [];
        for (const r of signalRows) {
            if (r.categoryId) categoryFreq[r.categoryId] = (categoryFreq[r.categoryId] || 0) + 1;
            if (r.price != null) prices.push(Number(r.price));
        }

        const topCategories = Object.entries(categoryFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([catId]) => Number(catId));

        if (topCategories.length === 0) {
            const trending = await Product.findAll({
                where: { isSold: false },
                attributes: [
                    'id', 'name', 'description', 'price', 'photo1', 'categoryId', 'createdAt',
                    ...withLikesCount()
                ],
                order: [
                    [sequelize.literal('`likesCount` DESC'), 'DESC'],
                    ['createdAt', 'DESC']
                ],
                limit: 12
            });
            return res.status(200).json(trending);
        }

        const mid = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] || null;
        const priceTol = mid ? Math.max(50, Math.round(mid * 0.4)) : null;

        const baseWhere = {
            isSold: false,
            categoryId: { [Op.in]: topCategories },
            userId: { [Op.ne]: userId }
        };
        if (mid && priceTol) {
            baseWhere.price = { [Op.between]: [mid - priceTol, mid + priceTol] };
        }

        const catWeights = topCategories.reduce((acc, catId, i) => {
            const weight = (topCategories.length - i);
            acc.push(`WHEN \`Product\`.\`categoryId\` = ${catId} THEN ${weight}`);
            return acc;
        }, []);
        const categoryWeightSql = `CASE ${catWeights.join(' ')} ELSE 0 END`;

        const candidates = await Product.findAll({
            where: baseWhere,
            attributes: [
                'id', 'name', 'description', 'price', 'photo1', 'categoryId', 'createdAt',
                ...withLikesCount(),
                [
                    sequelize.literal(`GREATEST(0, 100000 - TIMESTAMPDIFF(HOUR, \`Product\`.\`createdAt\`, NOW()))`),
                    'freshnessScore'
                ],
                ...(mid ? [[
                    sequelize.literal(`(CASE WHEN \`Product\`.\`price\` IS NULL THEN 0 ELSE (1000 / (1 + ABS(\`Product\`.\`price\` - ${mid}))) END)`),
                    'priceFit'
                ]] : []),
                [sequelize.literal(categoryWeightSql), 'categoryWeight'],
                [sequelize.literal(`
          (${categoryWeightSql})*3
          + LOG(LEAST(GREATEST(1, (
              SELECT COUNT(*) FROM \`product_likes\` pl2 WHERE pl2.\`productId\` = \`Product\`.\`id\`
            )), 100) + 1)*2
          + GREATEST(0, 100000 - TIMESTAMPDIFF(HOUR, \`Product\`.\`createdAt\`, NOW()))
          ${mid ? `+ (CASE WHEN \`Product\`.\`price\` IS NULL THEN 0 ELSE (1000 / (1 + ABS(\`Product\`.\`price\` - ${mid}))) END)` : ``}
        `), 'score']
            ],
            order: [[sequelize.literal('`score`'), 'DESC']],
            limit: 60
        });

        const byCat = new Map();
        for (const p of candidates) {
            const k = p.categoryId || 0;
            if (!byCat.has(k)) byCat.set(k, []);
            byCat.get(k).push(p);
        }
        const diversified = [];
        let added = true;
        while (diversified.length < 12 && added) {
            added = false;
            for (const arr of byCat.values()) {
                if (arr.length && diversified.length < 12) {
                    diversified.push(arr.shift());
                    added = true;
                }
            }
        }

        if (diversified.length < 12) {
            const excludeIds = diversified.map(p => p.id);
            const fill = await Product.findAll({
                where: {
                    isSold: false,
                    id: { [Op.notIn]: excludeIds },
                    userId: { [Op.ne]: userId }
                },
                attributes: [
                    'id', 'name', 'description', 'price', 'photo1', 'categoryId', 'createdAt',
                    ...withLikesCount()
                ],
                order: [
                    [sequelize.literal('`likesCount` DESC'), 'DESC'],
                    ['createdAt', 'DESC']
                ],
                limit: 12 - diversified.length
            });
            diversified.push(...fill);
        }

        return res.status(200).json(diversified);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy generowaniu polecanych' });
    }
};
