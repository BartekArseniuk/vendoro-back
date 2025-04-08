const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
    const { name, description, icon } = req.body;

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
        const newCategory = await Category.create({
            name,
            description,
            icon: icon || '📦'
        });

        return res.status(201).json({
            message: 'Kategoria została utworzona pomyślnie.',
            category: newCategory,
        });
    } catch (error) {
        console.error(error);
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
    const { name, description, icon } = req.body;

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

        category.name = name || category.name;
        category.description = description || category.description;
        category.icon = icon || category.icon; // Aktualizacja ikony

        await category.save();

        return res.status(200).json({
            message: 'Kategoria została zaktualizowana',
            category,
        });
    } catch (error) {
        console.error(error);
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