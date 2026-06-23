const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const sendEmail = require('../utils/email');
const { uploadBuffer } = require('../utils/storage');

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt
});

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Público
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Ya existe una cuenta con ese email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashedPassword, phone }
    });
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      token,
      user: publicUser(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Público
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Sesión iniciada correctamente.',
      token,
      user: publicUser(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/me
// @access  Privado
const getMe = async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
};

// @desc    Olvidé contraseña - enviar token de reseteo
// @route   POST /api/auth/forgot-password
// @access  Público
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'El email es requerido.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No existe una cuenta con ese email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: hashedToken, resetPasswordExpire: new Date(Date.now() + 30 * 60 * 1000) }
    });

    const baseUrl = req.get('host')?.includes('localhost') ? 'http://localhost:3000' : 'https://photostore-2.onrender.com';
    const resetUrl = `${baseUrl}/auth/reset-password/${resetToken}`;

    const message = `Recibiste este email porque solicitaste restablecer tu contraseña.

Haz clic en el siguiente enlace para restablecerla:
${resetUrl}

Si no solicitaste esto, ignora este mensaje.
Este enlace expirará en 30 minutos.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Restablecer contraseña - PhotoStudio',
        message
      });
    } catch (err) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpire: null }
      });
      return res.status(500).json({ success: false, message: 'Error al enviar el email.' });
    }

    res.json({
      success: true,
      message: 'Correo enviado con las instrucciones para restablecer tu contraseña.',
      resetUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Resetear contraseña con token
// @route   PUT /api/auth/reset-password/:token
// @access  Público
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: hashedToken, resetPasswordExpire: { gt: new Date() } }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpire: null }
    });

    const token = generateToken(updated.id);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente.',
      token,
      user: publicUser(updated)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/me
// @access  Privado
const updateProfile = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const data = {};

    if (name) {
      if (name.length > 50) {
        return res.status(400).json({ success: false, message: 'El nombre no puede tener más de 50 caracteres.' });
      }
      data.name = name;
    }
    if (phone !== undefined) data.phone = phone;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
      }
      data.password = await bcrypt.hash(password, 12);
    }
    if (req.file) {
      data.avatar = await uploadBuffer(req.file.buffer, req.file.originalname, 'avatars');
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente.',
      user: publicUser(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateProfile };
