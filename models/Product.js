const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ['one-time', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Archived'],
    default: 'Active',
  },
  subscribers: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
