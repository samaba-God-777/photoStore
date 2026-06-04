const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  packages: [{
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['yappy', 'cash'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  yappyPhone: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    maxlength: 500
  },
  orderNumber: {
    type: String,
    unique: true
  },
  confirmedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Generar número de orden automáticamente
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const now = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `PS-${now.toString().slice(-6)}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
