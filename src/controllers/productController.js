const { Product, ProductLike, User, Category } = require('../models');
const { Op } = require('sequelize');

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
        const likesCount = await ProductLike.count({
            where: { productId: product.id }
        });
        return {
            ...product.toJSON(),
            likesCount
        };
    }));
};

exports.getLatestProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'description', 'price', 'photo1'],
            where: {
                isSold: false,
            },
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
    const userId = req.user?.id || req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }

    try {
        const likedProductLinks = await ProductLike.findAll({
            where: { userId },
            attributes: ['productId'],
        });

        const productIds = likedProductLinks.map(like => like.productId);

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

exports.getProductsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const products = await Product.findAll({
            where: { userId },
        });

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

        const likesCount = await ProductLike.count({
            where: { productId: id }
        });

        let userData = null;
        if (product.userId) {
            const userAttributes = ['avatar', 'firstName', 'lastName', 'email', 'createdAt'];
            if (product.sharePhoneNumber) {
                userAttributes.push('phone');
            }

            const user = await User.findByPk(product.userId, {
                attributes: userAttributes
            });

            userData = {
                avatar: user?.avatar,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email,
                phone: product.sharePhoneNumber ? user?.phone : undefined,
                createdAt: user?.createdAt
            };
        }

        const formattedProduct = {
            ...product.toJSON(),
            user: userData,
            category: product.category,
            likesCount
        };

        return res.status(200).json(formattedProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu produktu' });
    }
};

exports.createProduct = async (req, res) => {
    const {
        name,
        description,
        location,
        price,
        condition,
        deliveryMethod,
        sharePhoneNumber,
        photo1,
        photo2,
        photo3,
        photo4,
        photo5,
        userId,
        categoryId,
        isSold
    } = req.body;

    try {
        if (!name || !description || !location || !price || !condition || !userId || !categoryId || !deliveryMethod) {
            return res.status(400).json({ message: 'Wszystkie wymagane pola muszą być wypełnione' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'Użytkownik nie istnieje' });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({ message: 'Kategoria nie istnieje' });
        }

        const newProduct = await Product.create({
            name,
            description,
            location,
            price,
            condition,
            deliveryMethod,
            sharePhoneNumber,
            photo1,
            photo2,
            photo3,
            photo4,
            photo5,
            userId,
            categoryId,
            isSold
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
        name,
        description,
        location,
        price,
        condition,
        deliveryMethod,
        sharePhoneNumber,
        photo1,
        photo2,
        photo3,
        photo4,
        photo5,
        userId,
        categoryId,
        isSold
    } = req.body;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Produkt nie znaleziony' });
        }

        if (!name || !location || !price || !userId || !categoryId || !deliveryMethod) {
            return res.status(400).json({ message: 'Wszystkie wymagane pola muszą być wypełnione' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'Użytkownik nie istnieje' });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({ message: 'Kategoria nie istnieje' });
        }

        product.name = name;
        product.description = description;
        product.location = location;
        product.price = price;
        product.condition = condition;
        product.deliveryMethod = deliveryMethod;
        product.sharePhoneNumber = sharePhoneNumber;
        product.photo1 = photo1;
        product.photo2 = photo2;
        product.photo3 = photo3;
        product.photo4 = photo4;
        product.photo5 = photo5;
        product.userId = userId;
        product.categoryId = categoryId;
        product.isSold = isSold;

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

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Produkt nie znaleziony' });
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
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }

    try {
        const existingLike = await ProductLike.findOne({
            where: { productId, userId },
        });

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