const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder, setAppointmentDate, addComment } = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/appointment', protect, adminOnly, setAppointmentDate);
router.post('/:id/comments', protect, addComment);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;
