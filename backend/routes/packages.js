const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getPackages, getPackage, createPackage, updatePackage, deletePackage, getAllPackagesAdmin
} = require('../controllers/packageController');

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pkg-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
  storage,
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
