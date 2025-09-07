const { Category } = require('../models');
const { getCategoryImageUrl } = require('../services/unsplashService');

exports.createCategory = async (req, res) => {
    const { name, description, icon, imageUrl } = req.body;
    const autoImage = String(req.query.autoImage || '').toLowerCase() === 'true';

    if (!name) {
        return res.status(400).json({ message: 'Nazwa kategorii jest wymagana' });
    }

    if (name.length > 255) {
        return res.status(400).json({ message: 'Nazwa kategorii nie może przekroczyć 255 znaków' });
    }

    if (description && description.length > 500) {
        return res.status(400).json({ message: 'Opis kategorii nie może przekroczyć 500 znaków' });
    }

    try {
        let finalImageUrl = imageUrl || null;

        if (!finalImageUrl && autoImage) {
            finalImageUrl = await getCategoryImageUrl(name);
        }

        const newCategory = await Category.create({
            name,
            description,
            icon: icon || '📦',
            imageUrl: finalImageUrl
        });

        return res.status(201).json({
            message: 'Kategoria została utworzona pomyślnie.',
            category: newCategory,
        });
    } catch (error) {
        console.error(error);
        if (error?.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Kategoria o takiej nazwie już istnieje' });
        }
        return res.status(500).json({ message: 'Błąd przy tworzeniu kategorii' });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).json({ categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu kategorii' });
    }
};

exports.getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Kategoria nie znaleziona' });
        }
        return res.status(200).json({ category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy pobieraniu kategorii' });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, icon, imageUrl } = req.body;
    const autoImage = String(req.query.autoImage || '').toLowerCase() === 'true';

    if (name && name.length > 255) {
        return res.status(400).json({ message: 'Nazwa kategorii nie może przekroczyć 255 znaków' });
    }

    if (description && description.length > 500) {
        return res.status(400).json({ message: 'Opis kategorii nie może przekroczyć 500 znaków' });
    }

    try {
        const category = await Category.findByPk(id);
        
        if (!category) {
            return res.status(404).json({ message: 'Kategoria nie znaleziona' });
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (icon !== undefined) category.icon = icon;

        if (imageUrl !== undefined) {
            category.imageUrl = imageUrl || null;
        } else if (autoImage && (name || !category.imageUrl)) {
            const query = name || category.name;
            const fetched = await getCategoryImageUrl(query);
            if (fetched) category.imageUrl = fetched;
        }

        await category.save();

        return res.status(200).json({
            message: 'Kategoria została zaktualizowana',
            category,
        });
    } catch (error) {
        console.error(error);
        if (error?.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Kategoria o takiej nazwie już istnieje' });
        }
        return res.status(500).json({ message: 'Błąd przy aktualizacji kategorii' });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Kategoria nie znaleziona' });
        }
        await category.destroy();
        return res.status(200).json({ message: 'Kategoria została usunięta' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd przy usuwaniu kategorii' });
    }
};