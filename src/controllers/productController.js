const { Product, ProductLike, User, Category, Rating } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');

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

const addLikesToProducts = async (products) => {
    return Promise.all(products.map(async (product) => {
        const likesCount = await ProductLike.count({ where: { productId: product.id } });
        return { ...product.toJSON(), likesCount };
    }));
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