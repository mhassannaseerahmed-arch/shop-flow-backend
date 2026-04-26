const router = require('express').Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');

// GET dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // In a real SaaS, we'd filter by user ID. 
        // For now, we'll give global stats but protected by auth.
        
        const totalProducts = await Product.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'Active' });
        const canceledSubscriptions = await Subscription.countDocuments({ status: 'Canceled' });
        const totalSubscriptions = await Subscription.countDocuments();
        
        // Calculate MRR (Monthly Recurring Revenue)
        const subscriptions = await Subscription.find().populate('product');
        let mrr = 0;
        subscriptions.forEach(sub => {
            if (sub.status === 'Active' && sub.product && sub.product.price) {
                const price = sub.product.price;
                const cycle = (sub.product.billingCycle || 'monthly').toLowerCase();
                
                if (cycle === 'monthly') {
                    mrr += price;
                } else if (cycle === 'yearly') {
                    mrr += (price / 12);
                } else {
                    mrr += price; 
                }
            }
        });

        // Real Churn Rate: (Canceled / Total) * 100
        const churnRate = totalSubscriptions > 0 
            ? (canceledSubscriptions / totalSubscriptions) * 100 
            : 0;

        // Calculate actual revenue growth for the last 6 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const revenueGrowth = [];

        for (let i = 5; i >= 0; i--) {
            const m = (currentMonth - i + 12) % 12;
            const monthName = months[m];
            
            // Calculate total revenue for subscriptions created up to this month
            // This is a simplified projection for the dashboard demo
            let monthlyTotal = 0;
            subscriptions.forEach(sub => {
                const subDate = new Date(sub.createdAt);
                if (subDate.getMonth() <= m && sub.product) {
                    const price = sub.product.price;
                    const cycle = (sub.product.billingCycle || 'monthly').toLowerCase();
                    monthlyTotal += (cycle === 'yearly' ? price / 12 : price);
                }
            });
            
            revenueGrowth.push({ name: monthName, value: Math.round(monthlyTotal) });
        }

        // Fetch recent activities
        const recentSubs = await Subscription.find().sort({ createdAt: -1 }).limit(5).populate('product');
        const recentActivities = recentSubs.map(s => ({
            id: s._id,
            user: s.customerName,
            action: s.status === 'Active' ? 'Started a new subscription' : 'Subscription status changed',
            target: s.product ? s.product.name : 'Unknown Product',
            time: s.createdAt,
            status: s.status
        }));

        res.json({
            stats: [
                { name: "Monthly Recurring Revenue", value: `$${mrr.toFixed(2)}`, change: "+12.5%", trend: "up" },
                { name: "Active Subscribers", value: activeSubscriptions.toString(), change: "+5.1%", trend: "up" },
                { name: "Total Products", value: totalProducts.toString(), change: "0%", trend: "neutral" },
                { name: "Churn Rate", value: `${churnRate.toFixed(1)}%`, change: "-0.2%", trend: "down" }
            ],
            charts: {
                revenue: revenueGrowth
            },
            recentActivities
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
