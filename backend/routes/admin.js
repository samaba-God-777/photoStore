const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardSummary,
  getUsers,
  deleteUser,
  updateUserRole,
  getOnlineUsers,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/summary', getDashboardSummary);
router.get('/users', getUsers);
router.get('/users/online', getOnlineUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
