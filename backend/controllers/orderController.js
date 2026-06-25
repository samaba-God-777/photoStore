const prisma = require('../lib/prisma');

const generateOrderNumber = () => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PS-${now.toString().slice(-6)}${random}`;
};

const ORDER_INCLUDE = {
  items: { include: { package: { select: { name: true, image: true, category: true } } } },
  comments: { include: { user: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'asc' } }
};
const ORDER_INCLUDE_ADMIN = {
  user: { select: { name: true, email: true, phone: true } },
  ...ORDER_INCLUDE
};

// El frontend (heredado de Mongo) espera `_id` y `order.packages` en vez de `items`
const toClient = (order) => ({
  ...order,
  _id: order.id,
  packages: (order.items || []).map((item) => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    package: item.package ? { ...item.package, _id: item.packageId } : undefined
  })),
  comments: (order.comments || []).map((c) => ({ ...c, _id: c.id }))
});
const toClientList = (orders) => orders.map(toClient);

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

    const orderItems = [];
    let total = 0;

    for (const item of pkgItems) {
      const pkg = await prisma.package.findUnique({ where: { id: item.packageId } });
      if (!pkg || !pkg.active) {
        return res.status(400).json({ success: false, message: 'Paquete no encontrado o no disponible.' });
      }
      const quantity = item.quantity || 1;
      orderItems.push({ packageId: pkg.id, name: pkg.name, price: pkg.price, quantity });
      total += pkg.price * quantity;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        customerName: fullName || req.user.name,
        customerEmail: email || req.user.email,
        customerPhone: phone || req.user.phone,
        total,
        paymentMethod,
        yappyPhone: paymentMethod === 'yappy' ? yappyPhone : null,
        notes,
        items: { create: orderItems }
      },
      include: ORDER_INCLUDE
    });

    res.status(201).json({ success: true, message: 'Orden creada exitosamente.', data: toClient(order) });
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
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: orders.length, data: toClientList(orders) });
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
    const where = status ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      include: ORDER_INCLUDE_ADMIN,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: orders.length, data: toClientList(orders) });
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

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    const data = { status };
    if (status === 'confirmed') data.confirmedAt = new Date();
    if (status === 'completed') data.completedAt = new Date();

    const updated = await prisma.order.update({ where: { id: order.id }, data, include: ORDER_INCLUDE });
    res.json({ success: true, message: 'Estado actualizado.', data: toClient(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Eliminar orden (admin)
// @route   DELETE /api/orders/:id
// @access  Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }
    await prisma.order.delete({ where: { id: order.id } });
    res.json({ success: true, message: 'Orden eliminada.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Asignar/actualizar fecha de la sesión fotográfica (admin)
// @route   PUT /api/orders/:id/appointment
// @access  Admin
const setAppointmentDate = async (req, res) => {
  try {
    const { appointmentDate } = req.body;
    const date = appointmentDate ? new Date(appointmentDate) : null;
    if (appointmentDate && Number.isNaN(date.getTime())) {
      return res.status(400).json({ success: false, message: 'Fecha inválida.' });
    }

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { appointmentDate: date },
      include: ORDER_INCLUDE
    });
    res.json({ success: true, message: 'Fecha de cita actualizada.', data: toClient(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

// @desc    Agregar comentario a una orden (dueño de la orden)
// @route   POST /api/orders/:id/comments
// @access  Privado (dueño) / Admin
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío.' });
    }

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado.' });
    }

    await prisma.comment.create({
      data: { orderId: order.id, userId: req.user.id, content: content.trim() }
    });

    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: ORDER_INCLUDE });
    res.status(201).json({ success: true, message: 'Comentario agregado.', data: toClient(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder, setAppointmentDate, addComment };
