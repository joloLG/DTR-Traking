# Deploy Edge Functions for Email Service

## Current Status ✅

Your email service is now working in **development mode** with SMTP configuration. The system will:
- Log emails to console with full details
- Show email content preview
- Use your SMTP settings for configuration testing
- Return success messages for testing

## When Ready for Production 🚀

To send real emails, you need to deploy the Edge Functions to Supabase:

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref ptkacbtnbzrfliqqzmhq
```

### Step 4: Set Environment Variables
```bash
supabase secrets set EMAIL_SERVICE=smtp
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=johnlloydgracilla2.0@gmail.com
supabase secrets set SMTP_PASS=iuvx jatr bylc gqjp
supabase secrets set FROM_EMAIL=johnlloydgracilla2.0@gmail.com
supabase secrets set FROM_NAME=JLG-DEV DTR System
```

### Step 5: Deploy the Function
```bash
supabase functions deploy send-email
```

### Step 6: Verify Deployment
```bash
supabase functions list
```

## Testing Production Deployment

After deployment, test the email service:

1. Go to admin dashboard
2. Send a test email
3. Check the recipient's inbox
4. Monitor Edge Function logs:
   ```bash
   supabase functions logs send-email
   ```

## Troubleshooting

### Permission Issues
If you get "Forbidden resource" error:
- Ensure you're logged in to the correct Supabase account
- Check that you have access to the project `ptkacbtnbzrfliqqzmhq`
- Verify project exists in your Supabase dashboard

### Function Not Found
If deployment fails:
- Check that `supabase/functions/send-email/index.ts` exists
- Verify the file syntax is correct
- Ensure you're in the project root directory

### Email Not Sending
If emails don't work after deployment:
- Check Edge Function logs for errors
- Verify environment variables are set correctly
- Test SMTP credentials manually
- Check Gmail app password settings

## Gmail SMTP Setup

For Gmail SMTP to work properly:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
   - Use this password in `SMTP_PASS`

3. **Check Gmail Settings**:
   - Ensure "Less secure app access" is handled properly
   - Verify the app password is correct

## Current Development Mode Benefits

- ✅ No Edge Function deployment needed
- ✅ Full email content logging
- ✅ SMTP configuration validation
- ✅ Immediate testing capability
- ✅ No external dependencies

## Next Steps

1. **Test thoroughly** in development mode
2. **Verify email content** looks correct
3. **Deploy Edge Functions** when ready for production
4. **Monitor email delivery** in production

The system is ready to use immediately in development mode!
