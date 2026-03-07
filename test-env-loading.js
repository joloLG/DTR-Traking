// Test environment variable loading in Next.js context
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Environment Variable Loading\n');

// Test all required variables
const requiredVars = [
  'SMTP_HOST',
  'SMTP_USER', 
  'SMTP_PASS',
  'FROM_EMAIL',
  'FROM_NAME'
];

console.log('📋 Required Environment Variables:');
let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = varName.includes('PASS') ? (value ? '***configured***' : 'missing') : (value || 'missing');
  console.log(`  ${status} ${varName}: ${display}`);
  if (!value) allConfigured = false;
});

console.log('\n🎯 Component Check Result:');
console.log(`  ${allConfigured ? '✅' : '❌'} Component will show: ${allConfigured ? 'Real email sending' : 'SMTP configuration missing'}`);

console.log('\n📱 What to do:');
if (allConfigured) {
  console.log('  ✅ Configuration is complete!');
  console.log('  ✅ Restart dev server: npm run dev');
  console.log('  ✅ Check admin dashboard for correct message');
} else {
  console.log('  ❌ Some variables are missing');
  console.log('  ❌ Check your .env.local file');
}

// Show current values for debugging
console.log('\n🔧 Current Values (debug):');
console.log('  SMTP_HOST:', process.env.SMTP_HOST);
console.log('  SMTP_USER:', process.env.SMTP_USER);
console.log('  SMTP_PASS exists:', !!process.env.SMTP_PASS);
console.log('  FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('  FROM_NAME:', process.env.FROM_NAME);
