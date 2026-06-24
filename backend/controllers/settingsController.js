const prisma = require('../lib/prisma');
const { uploadBuffer } = require('../utils/storage');

// @desc    Obtener el valor de un setting (ej: imagen de la sección "Nosotros")
// @route   GET /api/settings/:key
// @access  Público
const getSetting = async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
    res.json({ success: true, data: setting ? { key: setting.key, value: setting.value } : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Subir/actualizar la imagen de un setting (admin)
// @route   PUT /api/settings/:key
// @access  Admin
const updateSettingImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'La imagen es requerida.' });
    }
    const imageUrl = await uploadBuffer(req.file.buffer, req.file.originalname, 'settings');

    const setting = await prisma.siteSetting.upsert({
      where: { key: req.params.key },
      update: { value: imageUrl },
      create: { key: req.params.key, value: imageUrl },
    });

    res.json({ success: true, message: 'Imagen actualizada.', data: { key: setting.key, value: setting.value } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { getSetting, updateSettingImage };
