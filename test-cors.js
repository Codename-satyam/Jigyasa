// Quick CORS test
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCORS() {
  console.log('Testing CORS configuration...\n');
  
  const origins = ['http://localhost:3000', 'http://localhost:4001'];
  
  for (const origin of origins) {
    try {
      console.log(`Testing origin: ${origin}`);
      const response = await fetch('http://localhost:4000/api/users/me', {
        method: 'GET',
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        }
      });
      
      const allowOrigin = response.headers.get('access-control-allow-origin');
      console.log(`  Response: ${response.status}`);
      console.log(`  Access-Control-Allow-Origin: ${allowOrigin || 'NOT SET'}`);
      
      if (allowOrigin === origin || allowOrigin === '*') {
        console.log(`  ✅ CORS is allowing ${origin}\n`);
      } else {
        console.log(`  ❌ CORS is NOT allowing ${origin}\n`);
      }
    } catch (err) {
      console.error(`  ❌ Error:`, err.message, '\n');
    }
  }
}

testCORS();
