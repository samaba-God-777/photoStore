const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getGalleryPhotos, createGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto
} = require('../controllers/galleryController');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Ruta pública
router.get('/', getGalleryPhotos);

// Rutas admin
router.post('/', protect, adminOnly, upload.single('image'), createGalleryPhoto);
router.put('/:id', protect, adminOnly, updateGalleryPhoto);
router.delete('/:id', protect, adminOnly, deleteGalleryPhoto);

module.exports = router;
