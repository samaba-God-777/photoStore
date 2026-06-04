const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre es demasiado largo']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [500, 'La descripción es demasiado larga']
  },
  category: {
    type: String,
    enum: ['exterior', 'studio', 'both'],
    required: [true, 'La categoría es requerida']
  },
  image: {
    type: String,
    default: null
  },
  features: [{
    type: String
  }],
  duration: {
    type: String,
    default: '1-2 horas'
  },
  photos: {
    type: Number,
    default: 20,
    comment: 'Número de fotos editadas incluidas'
  },
  active: {
    type: Boolean,
    default: true
  },
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', PackageSchema);
