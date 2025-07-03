require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

async function seedDemoUsers() {
  const demoUsers = [
    {
      name: 'Admin',
      email: 'admin@shop.com',
      password: 'admin123',
      isAdmin: true
    },
    {
      name: 'User',
      email: 'user@shop.com',
      password: 'user123',
      isAdmin: false
    }
  ];

  for (const demo of demoUsers) {
    const existing = await User.findOne({ email: demo.email });
    if (!existing) {
      const hashed = await bcrypt.hash(demo.password, 10);
      await User.create({
        name: demo.name,
        email: demo.email,
        password: hashed,
        isAdmin: demo.isAdmin
      });
      console.log(`Seeded demo user: ${demo.email}`);
    }
  }
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  await seedDemoUsers();
})
.catch((err) => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('E-Commerce API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 