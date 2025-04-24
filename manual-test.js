/**
 * Manual test for the rate limiter middleware
 * This test manually demonstrates the rate limiter functionality
 */

const { rateLimiter } = require('./middleware/rateLimiter');

// Create a mock request and response
const mockReq = { ip: '127.0.0.1', connection: { remoteAddress: '127.0.0.1' } };

function createMockRes() {
  return {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    }
  };
}

// Create a rate limiter with a small window for testing
const limiter = rateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000,
  initialBlockDuration: 5 * 1000, // 5 seconds initial block
  logging: true
});

// Manually test the rate limiter
console.log('Manual test of rate limiter with exponential backoff\n');

// First 3 requests should be allowed
console.log('First 3 requests (should be allowed):');
for (let i = 0; i < 3; i++) {
  const res = createMockRes();
  let nextCalled = false;
  
  limiter(mockReq, res, () => { nextCalled = true; });
  
  console.log(`Request ${i + 1}: ${nextCalled ? 'Allowed' : 'Blocked'}`);
}

// 4th request should be blocked with initial block time
console.log('\n4th request (should be blocked with initial block time):');
const res1 = createMockRes();
limiter(mockReq, res1, () => {});
console.log(`Status: ${res1.statusCode}`);
console.log(`Message: ${res1.data ? res1.data.message : 'No message'}`);

// 5th request should be blocked with doubled block time
console.log('\n5th request (should be blocked with doubled block time):');
const res2 = createMockRes();
limiter(mockReq, res2, () => {});
console.log(`Status: ${res2.statusCode}`);
console.log(`Message: ${res2.data ? res2.data.message : 'No message'}`);

console.log('\nTest completed.');
console.log('Notice how the block time increases with each violation (exponential backoff).');
console.log('In a real application, the block time would increase as: 5s → 10s → 20s → 40s → etc.');