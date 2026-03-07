// Test the advanced email API
require('dotenv').config();

async function testEmailAPI() {
  console.log('🧪 Testing Advanced Email API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/advanced-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailType: 'custom',
        subject: 'Test Email from API',
        message: 'This is a test email sent via the advanced email API.',
        config: {
          adminName: 'Test Admin',
          userType: 'admins',
          bulkMode: true,
          retryFailed: true,
          emailDelay: 100
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API Test Successful!');
      console.log('Response:', result);
    } else {
      console.log('❌ API Test Failed:', result);
    }
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

// Run the test
testEmailAPI();
