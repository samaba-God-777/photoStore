const prisma = require('../lib/prisma');

const ONLINE_WINDOW_MINUTES = 5;

const onlineSince = () => new Date(Date.now() - ONLINE_WINDOW_MINUTES * 60 * 1000);

const mapOnlineState = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  createdAt: user.createdAt,
  lastSeen: user.lastSeen,
  isOnline: !!user.lastSeen && user.lastSeen >= onlineSince(),
});

const getDashboardSummary = async (req, res) => {
  try {
    const [usersCount, packagesCount, ordersCount, pendingOrdersCount, onlineUsersCount] = await Promise.all([
      prisma.user.count(),
      prisma.package.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { lastSeen: { gte: onlineSince() } } }),
    ]);

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { package: { select: { name: true, category: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const recentOrders = orders.slice(0, 5);

    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const packageStatsMap = new Map();
    const categoryStatsMap = new Map();
    let totalRevenue = 0;

    for (const order of orders) {
      totalRevenue += order.total || 0;
      for (const line of order.items || []) {
        const pkg = line.package || {};
        const name = line.name || pkg.name || 'Paquete';
        const category = pkg.category || 'both';
        const quantity = line.quantity || 1;
        const lineRevenue = (line.price || 0) * quantity;

        const existingPackage = packageStatsMap.get(name) || { name, category, quantity: 0, revenue: 0, orders: 0 };
        existingPackage.quantity += quantity;
        existingPackage.revenue += lineRevenue;
        existingPackage.orders += 1;
        packageStatsMap.set(name, existingPackage);

        const existingCategory = categoryStatsMap.get(category) || { category, revenue: 0, quantity: 0, orders: 0 };
        existingCategory.revenue += lineRevenue;
        existingCategory.quantity += quantity;
        existingCategory.orders += 1;
        categoryStatsMap.set(category, existingCategory);
      }
    }

    const topPackages = Array.from(packageStatsMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    const serviceCategories = Array.from(categoryStatsMap.values()).sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: {
        usersCount,
        packagesCount,
        ordersCount,
        pendingOrdersCount,
        onlineUsersCount,
        totalRevenue,
        averageOrderValue: ordersCount ? totalRevenue / ordersCount : 0,
        statusBreakdown,
        topPackages,
        serviceCategories,
        recentOrders,
      },
    });
  } catch (err) {
    console.error('Error en getDashboardSummary:', err.message);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, count: users.length, data: users.map(mapOnlineState) });
  } catch (err) {
    console.error('Error en getUsers:', err.message);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    await prisma.user.delete({ where: { id: user.id } }); // onDelete: Cascade borra sus orders

    res.json({ success: true, message: 'Usuario eliminado.' });
  } catch (err) {
    console.error('Error en deleteUser:', err.message);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol inválido.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: { role } });

    res.json({ success: true, message: 'Rol actualizado.', data: mapOnlineState(updated) });
  } catch (err) {
    console.error('Error en updateUserRole:', err.message);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { lastSeen: { gte: onlineSince() } },
      orderBy: { lastSeen: 'desc' }
    });
    res.json({ success: true, count: users.length, data: users.map(mapOnlineState) });
  } catch (err) {
    console.error('Error en getOnlineUsers:', err.message);
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
};

module.exports = {
  getDashboardSummary,
  getUsers,
  deleteUser,
  updateUserRole,
  getOnlineUsers,
};
