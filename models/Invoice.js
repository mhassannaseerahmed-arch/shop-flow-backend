const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Void'],
    default: 'Paid'
  },
  date: {
    type: Date,
    default: Date.now
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }
}, {
  timestamps: true,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
