const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');

// Create a Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    const { productId, customerEmail, customerName } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // In a real app, you'd create or find a Stripe Customer here
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name,
                            description: product.description,
                        },
                        unit_amount: Math.round(product.price * 100),
                        recurring: product.billingCycle !== 'One-time' ? {
                            interval: product.billingCycle.toLowerCase() === 'yearly' ? 'year' : 'month',
                        } : undefined,
                    },
                    quantity: 1,
                },
            ],
            mode: product.billingCycle !== 'One-time' ? 'subscription' : 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/subscriptions?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/subscriptions?canceled=true`,
            customer_email: customerEmail,
            metadata: {
                productId: product._id.toString(),
                customerName: customerName
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error('Stripe Session Error:', err);
        res.status(500).json({ message: 'Stripe integration error', error: err.message });
    }
});

// Webhook to handle successful payments (Simplified)
router.post('/webhook', async (req, res) => {
    const event = req.body;

    // In production, verify signature here
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Logic to create subscription in your DB after successful payment
        // const { productId, customerName } = session.metadata;
        // const newSub = new Subscription({ ... });
        // await newSub.save();
    }

    res.json({ received: true });
});

module.exports = router;
