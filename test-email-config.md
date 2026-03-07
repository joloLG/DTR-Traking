# Test Email Configuration

## Quick Test to Verify Environment Variables

### Step 1: Check Current Configuration

Your `.env` file should contain:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=johnlloydgracilla2.0@gmail.com
SMTP_PASS=iuvx jatr bylc gqjp
EMAIL_SERVICE=smtp
FROM_EMAIL=johnlloydgracilla2.0@gmail.com
FROM_NAME=JLG-DEV DTR System
```

### Step 2: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test Email Sending

1. Go to `http://localhost:3000/admin/dashboard`
2. Look for the blue notice: **"🔧 Development Mode - Real email sending enabled (smtp.gmail.com). Emails will be sent via nodemailer."**
3. If you see this, the system is configured correctly!
4. Send a test email

### Step 4: Expected Results

**Success Message:**
```
✅ Success!
Email sent successfully to 17 recipient(s) via Gmail SMTP
```

**Console Logs (F12):**
```
📧 Using direct email service with SMTP configuration
📧 Direct email service - attempting to send: {...}
📧 Sending via local API route...
📧 API Route: Processing email request: {...}
📧 Creating email transporter with SMTP: {...}
📨 Sending email with options: {...}
✅ Email sent successfully: <message-id>
```

**Server Console:**
```
📧 API Route: Processing email request: {...}
✅ Email sent successfully: <message-id>
```

### Step 5: Check Email Inboxes

- **Check your Gmail sent folder** for the sent email
- **Check recipient inboxes** for the test email
- **Look in Spam/Promotions** if not in main inbox

## Troubleshooting

### If Still Shows "Mock Service":

1. **Check .env file**: Ensure all SMTP variables are present
2. **Restart server**: Environment variables only load on server start
3. **Check file location**: `.env` should be in project root
4. **No extra spaces**: Ensure no trailing spaces in .env values

### If Email Doesn't Send:

1. **Check Gmail App Password**: Ensure it's correct
2. **Check 2FA**: Must be enabled on Gmail account
3. **Check network**: Ensure internet connection is working
4. **Check Gmail limits**: Gmail has daily sending limits

## Environment Variable Debug

Add this temporary debug code to see what's being loaded:

```javascript
// In any component, temporarily add:
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'NOT SET'
})
```

## Success Indicators

✅ Blue notice shows "Real email sending enabled"
✅ Success message mentions "via Gmail SMTP"
✅ Console shows "Using direct email service with SMTP configuration"
✅ Server logs show nodemailer transporter creation
✅ **Real emails arrive in inboxes!**

If you follow these steps and still see "mock service", the environment variables aren't being loaded properly.
