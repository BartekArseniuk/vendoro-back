const { Product, User, Category } = require('../models');

exports.createProduct = async (req, res) => {
    const {
        name,
        description,
        location,
        price,
        deliveryMethod,
        sharePhoneNumber,
        photo1,
        photo2,
        photo3,
        photo4,
        photo5,
        userId,
        categoryId,
    } = req.body;

    try {
        if (!name || !description || !location || !price || !userId || !categoryId || !deliveryMethod) {
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
            deliveryMethod,
            sharePhoneNumber,
            photo1,
            photo2,
            photo3,
            photo4,
            photo5,
            userId,
            categoryId,
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

exports.getProductsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const products = await Product.findAll({
            where: { userId },
        });

        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu produktów użytkownika' });
    }
};

exports.getProductsByCategoryId = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const products = await Product.findAll({
            where: { categoryId },
        });

        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu produktów dla tej kategorii' });
    }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id, {
            include: ['user', 'category'],
        });

        if (!product) {
            return res.status(404).json({ message: 'Produkt nie znaleziony' });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu produktu' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        location,
        price,
        deliveryMethod,
        sharePhoneNumber,
        photo1,
        photo2,
        photo3,
        photo4,
        photo5,
        userId,
        categoryId,
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
        product.deliveryMethod = deliveryMethod;
        product.sharePhoneNumber = sharePhoneNumber;
        product.photo1 = photo1;
        product.photo2 = photo2;
        product.photo3 = photo3;
        product.photo4 = photo4;
        product.photo5 = photo5;
        product.userId = userId;
        product.categoryId = categoryId;

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