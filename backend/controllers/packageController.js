const prisma = require('../lib/prisma');
const { uploadBuffer, deleteByUrl } = require('../utils/storage');

// El frontend (heredado de Mongo) espera `_id` además de `id`
const toClient = (pkg) => ({ ...pkg, _id: pkg.id });
const toClientList = (pkgs) => pkgs.map(toClient);

const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  return features
    .split(/[,\n]+/)
    .map((f) => f.trim())
    .filter(Boolean);
};

// @desc    Obtener todos los paquetes activos
// @route   GET /api/packages
// @access  Público
const getPackages = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { active: true };
    if (category && ['exterior', 'studio', 'both'].includes(category)) {
      where.category = category;
    }
    const packages = await prisma.package.findMany({ where, orderBy: { price: 'asc' } });
    res.json({ success: true, count: packages.length, data: toClientList(packages) });
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
    const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paquete no encontrado.' });
    }
    res.json({ success: true, data: toClient(pkg) });
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

    const imageUrl = req.file ? await uploadBuffer(req.file.buffer, req.file.originalname, 'packages') : null;

    const pkg = await prisma.package.create({
      data: {
        name,
        price: Number(price),
        description,
        category,
        features: featuresArr,
        duration: duration || '1-2 horas',
        photos: Number(photos) || 20,
        popular: popular === 'true' || popular === true,
        image: imageUrl
      }
    });

    res.status(201).json({ success: true, message: 'Paquete creado exitosamente.', data: toClient(pkg) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Actualizar paquete (admin)
// @route   PUT /api/packages/:id
// @access  Admin
const updatePackage = async (req, res) => {
  try {
    const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paquete no encontrado.' });
    }

    const { name, price, description, category, features, duration, photos, popular, active } = req.body;
    const data = {};

    if (req.file) {
      data.image = await uploadBuffer(req.file.buffer, req.file.originalname, 'packages');
      await deleteByUrl(pkg.image);
    }
    if (name) data.name = name;
    if (price !== undefined) data.price = Number(price);
    if (description) data.description = description;
    if (category) data.category = category;
    if (features) data.features = parseFeatures(features);
    if (duration) data.duration = duration;
    if (photos !== undefined) data.photos = Number(photos);
    if (popular !== undefined) data.popular = popular === 'true' || popular === true;
    if (active !== undefined) data.active = active === 'true' || active === true;

    const updated = await prisma.package.update({ where: { id: pkg.id }, data });
    res.json({ success: true, message: 'Paquete actualizado.', data: toClient(updated) });
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
    const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paquete no encontrado.' });
    }
    await prisma.package.delete({ where: { id: pkg.id } });
    await deleteByUrl(pkg.image);
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
    const packages = await prisma.package.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, count: packages.length, data: toClientList(packages) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { getPackages, getPackage, createPackage, updatePackage, deletePackage, getAllPackagesAdmin };
