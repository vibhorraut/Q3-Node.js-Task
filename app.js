const express = require('express');
const { rateLimiter } = require('./middleware/rateLimiter');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Configure rate limiter for the /api/products route
const apiRateLimiter = rateLimiter({
  maxRequests: 5,         // 5 requests per minute
  windowMs: 60 * 1000,    // 1 minute window
  initialBlockDuration: 60 * 1000, // Initial block of 1 minute
  logging: true           // Enable logging
});

// Sample product data
const products = [
  { id: 1, name: 'Laptop', price: 999.99 },
  { id: 2, name: 'Smartphone', price: 699.99 },
  { id: 3, name: 'Headphones', price: 149.99 }
];

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the API. Try accessing /api/products');
});

// Apply rate limiter to the products route
app.get('/api/products', apiRateLimiter, (req, res) => {
  res.json(products);
});

// Individual product route (not rate limited for demonstration)
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Rate limiter configured for /api/products route:`);
  console.log(`- Maximum 5 requests per minute per IP`);
  console.log(`- Exponential backoff for repeated violations`);
  console.log(`- Try accessing http://localhost:${PORT}/api/products repeatedly to test`);
});