const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Público
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Ya existe una cuenta con ese email.' });
    }

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
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

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Sesión iniciada correctamente.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
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
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt
    }
  });
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No existe una cuenta con ese email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

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
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save({ validateBeforeSave: false });
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

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
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
    const user = req.user;

    if (name) {
      if (name.length > 50) {
        return res.status(400).json({ success: false, message: 'El nombre no puede tener más de 50 caracteres.' });
      }
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
      }
      user.password = password;
    }

    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateProfile };
