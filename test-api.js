const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing MagicUI API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test login
    console.log('2. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@magicui.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    
    console.log('✅ Login successful');
    console.log('   User:', loginData.user.name);
    console.log('   Token received:', loginData.token ? 'Yes' : 'No');
    console.log('');

    // Test monitors endpoint with token
    console.log('3. Testing monitors endpoint...');
    const monitorsResponse = await fetch(`${API_BASE}/monitors`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const monitorsData = await monitorsResponse.json();
    
    if (!monitorsResponse.ok) {
      throw new Error(`Monitors request failed: ${monitorsData.message}`);
    }
    
    console.log('✅ Monitors endpoint working');
    console.log('   Monitors count:', monitorsData.data ? monitorsData.data.length : 0);
    console.log('');

    // Test creating a monitor
    console.log('4. Testing monitor creation...');
    const testMonitor = {
      name: 'Test Monitor',
      targetUrl: 'https://example.com'
    };
    
    const formData = new FormData();
    formData.append('name', testMonitor.name);
    formData.append('targetUrl', testMonitor.targetUrl);
    
    const createResponse = await fetch(`${API_BASE}/monitors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
      },
      body: formData
    });
    
    const createData = await createResponse.json();
    
    if (!createResponse.ok) {
      throw new Error(`Monitor creation failed: ${createData.message}`);
    }
    
    console.log('✅ Monitor creation successful');
    console.log('   Monitor ID:', createData.data.id);
    console.log('');

    console.log('🎉 All API tests passed!');
    console.log('   The backend is working correctly.');
    console.log('   You can now use the frontend application.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Please check if the backend is running on port 3001');
  }
}

testAPI(); 