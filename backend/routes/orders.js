const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;
