const Order = require('../models/Order');
const Package = require('../models/Package');

// @desc    Crear orden
// @route   POST /api/orders
// @access  Privado
const createOrder = async (req, res) => {
  try {
    const { packages: pkgItems, paymentMethod, yappyPhone, notes, fullName, email, phone } = req.body;

    if (!pkgItems || pkgItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Debes seleccionar al menos un paquete.' });
    }
    if (!['yappy', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Método de pago inválido.' });
    }
    if (paymentMethod === 'yappy' && !yappyPhone) {
      return res.status(400).json({ success: false, message: 'El número de Yappy es requerido.' });
    }

    // Verificar y construir los items de la orden
    const orderItems = [];
    let total = 0;

    for (const item of pkgItems) {
      let pkg;
      try {
        pkg = await Package.findById(item.packageId);
      } catch {
        return res.status(400).json({ success: false, message: `ID de paquete inválido.` });
      }
      if (!pkg || !pkg.active) {
        return res.status(400).json({ success: false, message: `Paquete no encontrado o no disponible.` });
      }
      const quantity = item.quantity || 1;
      orderItems.push({
        package: pkg._id,
        name: pkg.name,
        price: pkg.price,
        quantity
      });
      total += pkg.price * quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      customerName: fullName || req.user.name,
      customerEmail: email || req.user.email,
      customerPhone: phone || req.user.phone,
      packages: orderItems,
      total,
      paymentMethod,
      yappyPhone: paymentMethod === 'yappy' ? yappyPhone : null,
      notes
    });

    await order.populate('packages.package', 'name image category');

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente.',
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Obtener órdenes del usuario actual
// @route   GET /api/orders/me
// @access  Privado
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('packages.package', 'name image category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Obtener todas las órdenes (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('packages.package', 'name image category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Actualizar estado de orden (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado inválido.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    order.status = status;
    if (status === 'confirmed') order.confirmedAt = new Date();
    if (status === 'completed') order.completedAt = new Date();

    await order.save();
    res.json({ success: true, message: 'Estado actualizado.', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Eliminar orden (admin)
// @route   DELETE /api/orders/:id
// @access  Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }
    res.json({ success: true, message: 'Orden eliminada.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder };
