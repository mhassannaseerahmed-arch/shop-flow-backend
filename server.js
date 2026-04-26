const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock DB connection if no URI provided
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://hassan1244:hassan1244@cluster0.jtewbtt.mongodb.net/?appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connection established successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Don't exit process in development, just log error
  }
};

connectDB();

// Routes
const productsRouter = require('./routes/products');
const subscriptionsRouter = require('./routes/subscriptions');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const customersRouter = require('./routes/customers');
const paymentsRouter = require('./routes/payments');
const invoicesRouter = require('./routes/invoices');

app.use('/api/products', productsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/customers', customersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/invoices', invoicesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
