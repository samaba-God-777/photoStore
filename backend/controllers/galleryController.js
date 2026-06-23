const prisma = require('../lib/prisma');
const { uploadBuffer, deleteByUrl } = require('../utils/storage');

const toClient = (photo) => ({ ...photo, image_url: photo.imageUrl, _id: photo.id });
const toClientList = (photos) => photos.map(toClient);

// @desc    Obtener todas las fotos de la galería
// @route   GET /api/gallery
// @access  Público
const getGalleryPhotos = async (req, res) => {
  try {
    const photos = await prisma.galleryPhoto.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, count: photos.length, data: toClientList(photos) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Subir una foto a la galería (admin)
// @route   POST /api/gallery
// @access  Admin
const createGalleryPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'La imagen es requerida.' });
    }
    const { title } = req.body;
    const imageUrl = await uploadBuffer(req.file.buffer, req.file.originalname, 'gallery');

    const photo = await prisma.galleryPhoto.create({
      data: { title: title?.trim() || '', imageUrl }
    });

    res.status(201).json({ success: true, message: 'Imagen subida exitosamente.', data: toClient(photo) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Actualizar el título de una foto (admin)
// @route   PUT /api/gallery/:id
// @access  Admin
const updateGalleryPhoto = async (req, res) => {
  try {
    const existing = await prisma.galleryPhoto.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada.' });
    }
    const { title } = req.body;
    const photo = await prisma.galleryPhoto.update({
      where: { id: req.params.id },
      data: { title: title?.trim() ?? existing.title }
    });
    res.json({ success: true, message: 'Imagen actualizada.', data: toClient(photo) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Eliminar una foto de la galería (admin)
// @route   DELETE /api/gallery/:id
// @access  Admin
const deleteGalleryPhoto = async (req, res) => {
  try {
    const existing = await prisma.galleryPhoto.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada.' });
    }
    await prisma.galleryPhoto.delete({ where: { id: req.params.id } });
    await deleteByUrl(existing.imageUrl);
    res.json({ success: true, message: 'Imagen eliminada.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { getGalleryPhotos, createGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto };
