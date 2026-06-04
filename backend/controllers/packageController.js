const Package = require('../models/Package');
const path = require('path');
const fs = require('fs');

const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  return features
    .split(/[,\n]+/)
    .map(f => f.trim())
    .filter(Boolean);
};

// @desc    Obtener todos los paquetes activos
// @route   GET /api/packages
// @access  Público
const getPackages = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { active: true };
    if (category && ['exterior', 'studio', 'both'].includes(category)) {
      filter.category = category;
    }
    const packages = await Package.find(filter).sort({ price: 1 });
    res.json({ success: true, count: packages.length, data: packages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Obtener un paquete por ID
// @route   GET /api/packages/:id
// @access  Público
const getPackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paquete no encontrado.' });
    }
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Crear paquete (admin)
// @route   POST /api/packages
// @access  Admin
const createPackage = async (req, res) => {
  try {
    const { name, price, description, category, features, duration, photos, popular } = req.body;
    const featuresArr = parseFeatures(features);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const pkg = await Package.create({
      name, price: Number(price), description, category,
      features: featuresArr, duration, photos: Number(photos) || 20,
      popular: popular === 'true' || popular === true,
      image: imageUrl
    });

    res.status(201).json({ success: true, message: 'Paquete creado exitosamente.', data: pkg });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Actualizar paquete (admin)
// @route   PUT /api/packages/:id
// @access  Admin
const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paquete no encontrado.' });
    }

    const { name, price, description, category, features, duration, photos, popular, active } = req.body;
    const featuresArr = features ? parseFeatures(features) : pkg.features;

    if (req.file) {
      // Eliminar imagen anterior si existe
      if (pkg.image) {
        const oldPath = path.join(__dirname, '..', pkg.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      pkg.image = `/uploads/${req.file.filename}`;
    }

    pkg.name = name || pkg.name;
    pkg.price = price !== undefined ? Number(price) : pkg.price;
    pkg.description = description || pkg.description;
    pkg.category = category || pkg.category;
    pkg.features = featuresArr;
    pkg.duration = duration || pkg.duration;
    pkg.photos = photos !== undefined ? Number(photos) : pkg.photos;
    pkg.popular = popular !== undefined ? (popular === 'true' || popular === true) : pkg.popular;
    pkg.active = active !== undefined ? (active === 'true' || active === true) : pkg.active;

    await pkg.save();
    res.json({ success: true, message: 'Paquete actualizado.', data: pkg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Eliminar paquete (admin)
// @route   DELETE /api/packages/:id
// @access  Admin
const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paquete no encontrado.' });
    }
    // Eliminar imagen si existe
    if (pkg.image) {
      const imgPath = path.join(__dirname, '..', pkg.image.replace(/^\//, ''));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    res.json({ success: true, message: 'Paquete eliminado.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Obtener todos los paquetes (admin, incluye inactivos)
// @route   GET /api/packages/admin/all
// @access  Admin
const getAllPackagesAdmin = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json({ success: true, count: packages.length, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { getPackages, getPackage, createPackage, updatePackage, deletePackage, getAllPackagesAdmin };
