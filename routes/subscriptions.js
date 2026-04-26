const router = require('express').Router();
let Subscription = require('../models/Subscription');
let Product = require('../models/Product');
let Invoice = require('../models/Invoice');

// GET all subscriptions, populated with product info
router.route('/').get((req, res) => {
  Subscription.find().populate('product')
    .then(subscriptions => res.json(subscriptions))
    .catch(err => res.status(400).json('Error: ' + err));
});

// GET single subscription
router.route('/:id').get((req, res) => {
  Subscription.findById(req.params.id).populate('product')
    .then(subscription => res.json(subscription))
    .catch(err => res.status(400).json('Error: ' + err));
});

// ADD new subscription
router.route('/add').post(async (req, res) => {
  const customerName = req.body.customerName;
  const customerEmail = req.body.customerEmail;
  const product = req.body.productId; // Expected to be the ObjectId of the Product
  const status = req.body.status || 'Active';
  
  // Calculate next billing assuming starting today (1 month out usually)
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  try {
    const newSubscription = new Subscription({
      customerName,
      customerEmail,
      product,
      status,
      nextBillingDate
    });

    const savedSubscription = await newSubscription.save();

    // Generate Invoice if active
    if (status === 'Active') {
        const productDetails = await Product.findById(product);
        if (productDetails) {
            const invoiceNumber = 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            const newInvoice = new Invoice({
                invoiceNumber,
                customerName,
                customerEmail,
                productName: productDetails.name,
                amount: productDetails.price,
                subscriptionId: savedSubscription._id
            });
            await newInvoice.save();
        }
    }

    res.json(savedSubscription);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// CANCEL subscription (Update status)
router.route('/cancel/:id').post((req, res) => {
  Subscription.findById(req.params.id)
    .then(subscription => {
      subscription.status = 'Canceled';
      subscription.save()
        .then(() => res.json('Subscription canceled!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE subscription
router.route('/:id').delete((req, res) => {
    Subscription.findByIdAndDelete(req.params.id)
        .then(() => res.json('Subscription deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
