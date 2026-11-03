require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // <-- Tambahin ini

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route test
app.get('/', (req, res) => {
  res.json({ message: 'FieldTask API is running 🚀' });
});

// Daftarin Routes
app.use('/api/auth', authRoutes); // <-- Tambahin ini

// Start server
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});