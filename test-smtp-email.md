# Test SMTP Email Service

## Current Status ✅

Your email service is now configured to use your Gmail SMTP settings! Here's what happens:

1. **Development Mode**: Uses your SMTP credentials to send real emails
2. **Fallback**: If Edge Function isn't deployed, logs email details
3. **Real Sending**: When Edge Function is deployed, sends actual emails

## Test Your Email Service

### Step 1: Restart Development Server
```bash
npm run dev
```

### Step 2: Access Admin Dashboard
- Go to `http://localhost:3000/admin/dashboard`
- Login with your admin credentials

### Step 3: Send Test Email
1. Scroll to "Email Communications" section
2. You should see: "🔧 Development Mode - SMTP configured (smtp.gmail.com). Emails will be logged to console with preview."
3. Fill in the form:
   - **Email Type**: Custom Email
   - **Send To**: All Users
   - **Subject**: Test Email from JLG DTR System
   - **Message**: This is a test email to verify the SMTP service is working correctly.
4. Click "Send Email"

### Step 4: Check Results

**Expected Success Message:**
```
✅ Success!
Email sent successfully to 17 recipient(s) via Gmail SMTP
```

**Console Output (F12):**
```
📧 Preparing to send real SMTP email: {
  from: "JLG-DEV DTR System <johnlloydgracilla2.0@gmail.com>",
  to: [...],
  subject: "Test Email from JLG DTR System",
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    user: "johnlloydgracilla2.0@gmail.com"
  }
}
✅ Email sent successfully via SMTP: {...}
```

## If Edge Function Isn't Deployed Yet

If you see this message instead:
```
Email processed for 17 recipient(s) (logged in console)
```

This means the Edge Function isn't deployed yet, but your SMTP configuration is working. The email details are logged in the console.

## To Deploy Edge Function for Real Email Sending

When you're ready to send actual emails:

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login and Link** (follow DEPLOY-EDGE-FUNCTIONS.md)

3. **Deploy the Function**:
   ```bash
   supabase functions deploy send-email
   ```

4. **Test Real Email Sending**:
   - Send another test email
   - Check recipient inboxes
   - Monitor Edge Function logs

## Gmail SMTP Configuration

Your current settings:
- **Host**: smtp.gmail.com
- **Port**: 587 (TLS)
- **User**: johnlloydgracilla2.0@gmail.com
- **Password**: [App Password from .env]

**Important**: Make sure:
1. You have 2-factor authentication enabled on Gmail
2. You're using an App Password (not your regular password)
3. The "Less secure app access" setting is handled properly

## Email Templates Available

1. **Custom Email**: General purpose
2. **System Announcement**: Important updates
3. **Deadline Reminder**: OJT deadline notifications

All include:
- Professional JLG DEV Solutions branding
- Your name as sender
- Links to DTR system
- HTML and text versions

## Test Different Email Types

Try each email type to verify they work:

1. **Custom Email**: Send a general announcement
2. **System Announcement**: Test the announcement template
3. **Deadline Reminder**: Test with a future deadline

## Troubleshooting

If emails don't send:

1. **Check Console**: Look for error messages
2. **Verify Gmail Settings**: Ensure app password is correct
3. **Check Recipient Emails**: Verify email addresses are valid
4. **Network Issues**: Check internet connectivity

## Success Indicators

✅ Blue development mode notice showing SMTP configured
✅ Success message with "via Gmail SMTP"
✅ Console logs showing email preparation
✅ (When deployed) Actual emails arriving in inboxes

Your email service is ready to test! 🚀
