![Screenshot 2025-04-24 164721](https://github.com/user-attachments/assets/0e0ea07f-4a86-4a58-bf4e-ac0880b5db4b)

![Screenshot 2025-04-24 164825](https://github.com/user-attachments/assets/d6291ab6-2f66-44b7-a8d7-9c6002df3273)


# Express.js Custom Rate Limiter

A custom rate limiting middleware for Express.js applications that protects API endpoints from abuse by limiting requests per IP address and implementing exponential backoff for repeated violations.

## Features

- **IP-based rate limiting**: Limits requests to 5 per minute per IP address (configurable)
- **Exponential backoff**: Block time increases with each violation (1min → 2min → 4min → etc.)
- **Configurable parameters**: Customize max requests, time window, and block duration
- **Logging**: Logs blocked IPs and timestamps for debugging and audit trails
- **Storage options**: 
  - In-memory storage (included)
  - Redis-based storage (commented implementation included)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

## Usage

### Basic Usage

The middleware is applied to the `/api/products` route in the example application:

```javascript
const { rateLimiter } = require('./middleware/rateLimiter');

// Configure and apply the rate limiter
const apiRateLimiter = rateLimiter({
  maxRequests: 5,         // 5 requests per minute
  windowMs: 60 * 1000,    // 1 minute window
  initialBlockDuration: 60 * 1000, // Initial block of 1 minute
  logging: true           // Enable logging
});

// Apply to a specific route
app.get('/api/products', apiRateLimiter, (req, res) => {
  res.json(products);
});
```

### Configuration Options

The rate limiter accepts the following configuration options:

- `maxRequests`: Maximum number of requests allowed in the time window (default: 5)
- `windowMs`: Time window in milliseconds (default: 60000 = 1 minute)
- `initialBlockDuration`: Initial block duration in milliseconds (default: 60000 = 1 minute)
- `logging`: Whether to log blocked requests (default: true)

### Redis Implementation

For production use, the Redis-based implementation is recommended. To use it:

1. Uncomment the Redis implementation in `middleware/rateLimiter.js`
2. Install the Redis package: `npm install redis`
3. Configure your Redis connection in the options:

```javascript
const { redisRateLimiter } = require('./middleware/rateLimiter');

const apiRateLimiter = redisRateLimiter({
  // ... other options
  redisOptions: { 
    host: 'your-redis-host', 
    port: 6379 
  }
});
```

## Testing the Rate Limiter

To test the rate limiter:

1. Start the server: `npm start`
2. Make repeated requests to `http://localhost:3000/api/products`
3. After 5 requests within a minute, you'll receive a 429 Too Many Requests response
4. Each subsequent violation will double the block time
