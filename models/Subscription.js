const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Past Due', 'Canceled'],
    default: 'Active',
  },
  nextBillingDate: {
    type: Date,
  }
}, {
  timestamps: true,
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
