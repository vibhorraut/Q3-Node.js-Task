/**
 * Simple test for the rate limiter middleware
 */

const { rateLimiter } = require('./middleware/rateLimiter');

// Create a mock Express request and response
function createMockReq(ip = '127.0.0.1') {
  return {
    ip: ip,
    connection: { remoteAddress: ip }
  };
}

function createMockRes() {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    },
    send: function(data) {
      this.data = data;
      return this;
    }
  };
  return res;
}

// Create the rate limiter with a small window for testing
const limiter = rateLimiter({
  maxRequests: 3,  // Small number for quick testing
  windowMs: 10000, // 10 seconds
  initialBlockDuration: 2000, // 2 seconds initial block
  logging: true
});

// Function to simulate a request
function simulateRequest(ip = '127.0.0.1') {
  return new Promise((resolve) => {
    const req = createMockReq(ip);
    const res = createMockRes();
    
    // Mock next function
    const next = () => {
      res.statusCode = 200;
      res.data = { success: true };
      resolve(res);
    };
    
    // Call the middleware
    limiter(req, res, next);
    
    // If the middleware doesn't call next, resolve with the response
    if (!res.statusCode) {
      resolve(res);
    }
  });
}

// Make a series of requests to demonstrate rate limiting
async function runTest() {
  console.log('Testing rate limiter with exponential backoff...\n');
  
  // Make 5 requests in quick succession
  for (let i = 0; i < 5; i++) {
    const res = await simulateRequest();
    
    if (res.statusCode === 200) {
      console.log(`Request ${i + 1}: Allowed (Status 200)`);
    } else if (res.statusCode === 429) {
      console.log(`Request ${i + 1}: Blocked (Status 429)`);
      console.log(`  Message: ${res.data.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Wait a moment and make another request to show increased block time
  console.log('\nWaiting 1 second...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Make another request (should be blocked with increased time)
  const res = await simulateRequest();
  if (res.statusCode === 429) {
    console.log(`Additional request: Blocked (Status 429)`);
    console.log(`  Message: ${res.data.message}`);
  }
  
  console.log('\nTest completed.');
  console.log('Notice how the block time increases with each violation (exponential backoff).');
}

// Run the test
runTest();