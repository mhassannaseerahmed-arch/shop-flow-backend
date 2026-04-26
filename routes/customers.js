const router = require('express').Router();
let Customer = require('../models/Customer');

// GET all customers
router.route('/').get((req, res) => {
    Customer.find()
        .then(customers => res.json(customers))
        .catch(err => res.status(400).json('Error: ' + err));
});

// ADD new customer
router.route('/add').post((req, res) => {
    const { name, email, phone, company, status } = req.body;

    const newCustomer = new Customer({
        name,
        email,
        phone,
        company,
        status
    });

    newCustomer.save()
        .then(() => res.json('Customer added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// GET single customer
router.route('/:id').get((req, res) => {
    Customer.findById(req.params.id)
        .then(customer => res.json(customer))
        .catch(err => res.status(400).json('Error: ' + err));
});

// UPDATE customer
router.route('/update/:id').post((req, res) => {
    Customer.findById(req.params.id)
        .then(customer => {
            customer.name = req.body.name;
            customer.email = req.body.email;
            customer.phone = req.body.phone;
            customer.company = req.body.company;
            customer.status = req.body.status;

            customer.save()
                .then(() => res.json('Customer updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE customer
router.route('/:id').delete((req, res) => {
    Customer.findByIdAndDelete(req.params.id)
        .then(() => res.json('Customer deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
