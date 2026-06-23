const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getPackages, getPackage, createPackage, updatePackage, deletePackage, getAllPackagesAdmin
} = require('../controllers/packageController');

// Configuración de Multer para subida de imágenes (memoria, se sube a Supabase Storage)
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

// Rutas públicas
router.get('/', getPackages);
router.get('/admin/all', protect, adminOnly, getAllPackagesAdmin);
router.get('/:id', getPackage);

// Rutas admin
router.post('/', protect, adminOnly, upload.single('image'), createPackage);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePackage);
router.delete('/:id', protect, adminOnly, deletePackage);

module.exports = router;
