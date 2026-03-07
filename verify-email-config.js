// Verify email configuration for development mode
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Email Configuration Verification\n');

// Check environment
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check SMTP configuration
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? '***configured***' : 'missing',
  fromEmail: process.env.FROM_EMAIL,
  fromName: process.env.FROM_NAME
};

console.log('\n📧 SMTP Configuration:');
Object.entries(smtpConfig).forEach(([key, value]) => {
  const status = value && value !== 'missing' ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value}`);
});

// Determine what will happen
const hasValidConfig = smtpConfig.host && smtpConfig.user && smtpConfig.pass !== 'missing';

console.log('\n🎯 Email Sending Behavior:');
if (hasValidConfig) {
  console.log('  ✅ Real emails will be sent to actual users');
  console.log('  ✅ Using SMTP:', smtpConfig.host);
  console.log('  ✅ From:', `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`);
} else {
  console.log('  ❌ Emails will be logged to console only');
  console.log('  ❌ Missing SMTP configuration');
}

console.log('\n📋 Component Display Message:');
if (process.env.NODE_ENV === 'development') {
  if (hasValidConfig) {
    console.log('  🔧 Development Mode - Real Email Sending');
    console.log('  ✅ Real email sending enabled via', smtpConfig.host);
    console.log('  ✅ Emails will be sent to actual users');
  } else {
    console.log('  🔧 Development Mode');
    console.log('  ❌ SMTP configuration missing');
    console.log('  ❌ Emails will be logged to console');
  }
} else {
  console.log('  🚀 Production Mode');
  console.log(hasValidConfig ? '  ✅ Real email sending' : '  ❌ No email configuration');
}
