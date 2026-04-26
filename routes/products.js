const router = require('express').Router();
let Product = require('../models/Product');
let Subscription = require('../models/Subscription');

// GET all products with subscription counts
router.route('/').get(async (req, res) => {
  try {
    const products = await Product.find();
    
    // Enrich products with subscription count
    const enrichedProducts = await Promise.all(products.map(async (product) => {
      const subscribers = await Subscription.countDocuments({ 
        product: product._id,
        status: 'Active' 
      });
      return {
        ...product.toObject(),
        subscribers
      };
    }));
    
    res.json(enrichedProducts);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// GET single product 
router.route('/:id').get((req, res) => {
  Product.findById(req.params.id)
    .then(product => res.json(product))
    .catch(err => res.status(400).json('Error: ' + err));
});

// ADD new product
router.route('/add').post((req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const price = Number(req.body.price);
  const billingCycle = req.body.billingCycle ? req.body.billingCycle.toLowerCase() : 'monthly';
  const status = req.body.status || 'Active';

  const newProduct = new Product({
    name,
    description,
    price,
    billingCycle,
    status
  });

  newProduct.save()
    .then(savedProduct => res.json(savedProduct))
    .catch(err => res.status(400).json('Error: ' + err));
});

// UPDATE product
router.route('/update/:id').post((req, res) => {
  Product.findById(req.params.id)
    .then(product => {
      product.name = req.body.name;
      product.description = req.body.description;
      product.price = Number(req.body.price);
      product.billingCycle = req.body.billingCycle ? req.body.billingCycle.toLowerCase() : 'monthly';
      product.status = req.body.status;

      product.save()
        .then(() => res.json('Product updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE product
router.route('/:id').delete((req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then(() => res.json('Product deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
