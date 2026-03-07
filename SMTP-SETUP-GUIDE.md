# SMTP Environment Variables Setup Guide

## 🚀 Quick Setup Steps

### 1. Update Your .env.local File

I've created `.env.local` file for you. Now you need to update it with your actual SMTP credentials.

### 2. Choose Your Email Provider

#### Option A: Gmail (Recommended for Testing)
**Steps:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings > Security
3. Select "App passwords"
4. Generate a new app password
5. Use this app password in your environment variables

**Configuration:**
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=JLG DTR System
```

#### Option B: Outlook/Hotmail
**Steps:**
1. Go to Microsoft Account security settings
2. Enable "Two-step verification"
3. Generate an "App password"
4. Use the app password

**Configuration:**
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@outlook.com
FROM_NAME=JLG DTR System
```

#### Option C: Yahoo Mail
**Steps:**
1. Go to Yahoo Account security settings
2. Enable "Two-step verification"
3. Generate an "App password"
4. Use the app password

**Configuration:**
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@yahoo.com
FROM_NAME=JLG DTR System
```

#### Option D: Custom SMTP Server
If you have your own SMTP server:

**Configuration:**
```env
EMAIL_SERVICE=smtp
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
FROM_EMAIL=your_sender_email@domain.com
FROM_NAME=JLG DTR System
```

### 3. Complete Setup Steps

#### Step 1: Update .env.local
Replace the placeholder values in `.env.local` with your actual credentials:

```env
# Example for Gmail
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jlgdev.solutions@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
FROM_EMAIL=jlgdev.solutions@gmail.com
FROM_NAME=JLG DTR System
```

#### Step 2: Update Supabase Environment Variables
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **Edge Functions**
3. Add these environment variables:
   - `EMAIL_SERVICE=smtp`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your_email@gmail.com`
   - `SMTP_PASS=your_app_password`
   - `FROM_EMAIL=your_email@gmail.com`
   - `FROM_NAME=JLG DTR System`

#### Step 3: Deploy Edge Function
```bash
supabase functions deploy send-email
```

#### Step 4: Test the Configuration
1. Start your development server
2. Login as admin user
3. Go to admin dashboard
4. Try sending a test email

### 4. Gmail App Password Setup (Detailed)

#### Step 1: Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click on **Security**
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process

#### Step 2: Generate App Password
1. Go back to Security settings
2. Click on **App passwords** (under "Signing in to Google")
3. Select "Mail" for the app
4. Select "Other (Custom name)" and enter "JLG DTR System"
5. Click **Generate**
6. Copy the 16-character password (ignore spaces)

#### Step 3: Use in Environment
```env
SMTP_PASS=the_16_character_password_without_spaces
```

### 5. Troubleshooting Common Issues

#### Issue: "Authentication failed"
- **Solution:** Double-check your app password
- **Note:** Use the app password, NOT your regular password

#### Issue: "Connection refused"
- **Solution:** Check SMTP host and port
- **Gmail:** smtp.gmail.com:587
- **Outlook:** smtp-mail.outlook.com:587

#### Issue: "Email not sending"
- **Solution:** Check Edge Function logs in Supabase
- **Command:** `supabase functions logs send-email`

#### Issue: "Environment variables not working"
- **Solution:** Ensure variables are set in both places:
  1. `.env.local` (for local development)
  2. Supabase Edge Functions settings (for production)

### 6. Security Best Practices

#### ✅ Do:
- Use app passwords (not regular passwords)
- Enable 2-factor authentication
- Use environment variables (not hardcoded)
- Test with small groups first

#### ❌ Don't:
- Commit credentials to git
- Share your app password
- Use personal email for production
- Ignore security warnings

### 7. Testing Your Setup

#### Test Email Function:
```javascript
// In browser console (admin dashboard)
fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: ['your_test_email@gmail.com'],
    subject: 'Test Email',
    html: '<p>This is a test email from JLG DTR System</p>'
  })
})
```

#### Expected Response:
```json
{
  "success": true,
  "message": "Email sent via SMTP to 1 recipients"
}
```

### 8. Production Considerations

#### For Production Use:
- Consider using a dedicated email service (Resend, SendGrid)
- Set up proper domain authentication (SPF, DKIM)
- Monitor email deliverability
- Set up rate limiting

#### Email Service Alternatives:
```env
# Resend (Recommended for production)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=JLG DTR System
```

## 🎯 Quick Checklist

- [ ] Enable 2FA on email account
- [ ] Generate app password
- [ ] Update `.env.local` with credentials
- [ ] Add variables to Supabase Edge Functions
- [ ] Deploy Edge function
- [ ] Test with admin dashboard
- [ ] Verify email delivery

## 🆘 Need Help?

If you encounter issues:
1. Check Edge Function logs: `supabase functions logs send-email`
2. Verify environment variables in Supabase dashboard
3. Test SMTP connection with a tool like Telnet
4. Review the full documentation in `README-EMAIL-SYSTEM.md`

---

**Ready to send emails! 📧**
