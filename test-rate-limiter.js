/**
 * Simple script to test the rate limiter
 * Run with: node test-rate-limiter.js
 */

const axios = require('axios');

// Number of requests to make
const NUM_REQUESTS = 10;

// Function to make a single request
async function makeRequest(index) {
  try {
    const response = await axios.get('http://localhost:8080/api/products', {
      timeout: 5000 // 5 second timeout
    });
    console.log(`Request ${index + 1}: Status ${response.status} - Success`);
    return response.status;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(`Request ${index + 1}: Status ${error.response.status}`);
      if (error.response.status === 429) {
        console.log(`  Message: ${error.response.data.message}`);
      }
      return error.response.status;
    } else if (error.request) {
      // The request was made but no response was received
      console.log(`Request ${index + 1}: No response received - ${error.message}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(`Request ${index + 1}: Error - ${error.message}`);
    }
    return null;
  }
}

// Make requests sequentially to clearly see the rate limiting in action
async function runTest() {
  console.log(`Making ${NUM_REQUESTS} requests to test rate limiting...`);
  console.log('Expected behavior: First 5 requests should succeed, then requests should be blocked with increasing timeouts');
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    await makeRequest(i);
    // Small delay between requests to make logs more readable
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\nTest completed. To see exponential backoff in action, run this script again before the block period expires.');
}

// Run the test
runTest();