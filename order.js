const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
function auth(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, tax, shippingAddress, paymentMethod } = req.body;
    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      tax,
      status: 'confirmed',
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all orders (admin)
router.get('/', auth, async (req, res) => {
  try {
    // Only allow admin
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get orders for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Only allow the user or admin
    if (req.user.id !== req.params.userId && !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const orders = await Order.find({ user: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 