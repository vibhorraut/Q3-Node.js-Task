/**
 * Direct test for the rate limiter middleware
 * This test doesn't require a running server
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
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  initialBlockDuration: 2 * 1000, // 2 seconds for faster testing
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

// Run a single test batch
async function runTestBatch(batchNumber) {
  console.log(`\n--- Test Batch ${batchNumber} ---`);
  
  const numRequests = 7; // Increased to show more blocked requests
  
  for (let i = 0; i < numRequests; i++) {
    const res = await simulateRequest();
    
    if (res.statusCode === 200) {
      console.log(`Request ${i + 1}: Allowed (Status 200)`);
    } else if (res.statusCode === 429) {
      console.log(`Request ${i + 1}: Blocked (Status 429)`);
      console.log(`  Message: ${res.data.message}`);
    } else {
      console.log(`Request ${i + 1}: Unexpected status ${res.statusCode}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Run multiple test batches to demonstrate exponential backoff
async function runTests() {
  console.log('Testing rate limiter middleware directly...');
  console.log('Expected behavior: First 5 requests allowed, then blocked with increasing timeouts');
  console.log('Running multiple test batches to demonstrate exponential backoff\n');
  
  // Run first batch
  await runTestBatch(1);
  
  // Wait a short time and run second batch to show increased block time
  console.log('\nWaiting 1 second before next batch...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Run second batch
  await runTestBatch(2);
  
  // Wait a short time and run third batch to show further increased block time
  console.log('\nWaiting 1 second before next batch...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Run third batch
  await runTestBatch(3);
  
  console.log('\nTest completed.');
  console.log('Notice how the block time increases with each violation (exponential backoff).');
}

// Run the tests
runTests();