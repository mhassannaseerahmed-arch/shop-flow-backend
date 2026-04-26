const router = require('express').Router();
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');

// GET all invoices
router.get('/', auth, async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single invoice
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create manual invoice (Internal)
router.post('/add', auth, async (req, res) => {
    const { customerName, customerEmail, productName, amount, subscriptionId } = req.body;
    
    // Generate simple invoice number
    const invoiceNumber = 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newInvoice = new Invoice({
        invoiceNumber,
        customerName,
        customerEmail,
        productName,
        amount,
        subscriptionId
    });

    try {
        const savedInvoice = await newInvoice.save();
        res.json(savedInvoice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
