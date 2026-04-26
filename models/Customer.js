const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Lead', 'Churned'],
        default: 'Lead'
    }
}, {
    timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
