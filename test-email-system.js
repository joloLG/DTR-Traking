// Simple test script to verify email system configuration
require('dotenv').config();

const nodemailer = require('nodemailer');

async function testEmailConfig() {
  console.log('🧪 Testing Email System Configuration...\n');
  
  // Check environment variables
  const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS',
    'FROM_EMAIL',
    'FROM_NAME'
  ];
  
  console.log('📋 Environment Variables Check:');
  let configValid = true;
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const display = varName.includes('PASS') ? '***' : (value || 'MISSING');
    console.log(`  ${status} ${varName}: ${display}`);
    if (!value) configValid = false;
  });
  
  if (!configValid) {
    console.log('\n❌ Configuration incomplete. Please check your .env file.');
    return;
  }
  
  console.log('\n🔧 Testing SMTP Connection...');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 14,
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Test email (optional - uncomment to send test email)
    /*
    console.log('\n📧 Sending test email...');
    const testMail = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: '🧪 Test Email - JLG DTR System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from the JLG DTR System.</p>
        <p>If you receive this, the email system is working correctly!</p>
        <br>
        <p>Best regards,<br>JLG DEV Solutions</p>
      `,
      text: `Test Email\n\nThis is a test email from the JLG DTR System.\nIf you receive this, the email system is working correctly!\n\nBest regards,\nJLG DEV Solutions`
    };
    
    const result = await transporter.sendMail(testMail);
    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${result.messageId}`);
    */
    
    console.log('\n🎉 Email system is ready to use!');
    console.log('\n📝 Features Available:');
    console.log('  • Bulk email sending with progress tracking');
    console.log('  • SMTP connection pooling');
    console.log('  • Automatic retry on failed emails');
    console.log('  • Rate limiting protection');
    console.log('  • Multiple email templates (Custom, Announcement, Deadline, Newsletter)');
    console.log('  • Real-time progress monitoring');
    
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check your SMTP credentials');
    console.log('  2. Verify SMTP host and port');
    console.log('  3. Check if less secure apps are enabled (for Gmail)');
    console.log('  4. Try using an App Password instead of regular password');
  }
}

// Run the test
testEmailConfig().catch(console.error);
