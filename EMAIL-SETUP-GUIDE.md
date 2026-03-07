# Email Service Setup Guide

## Issue Resolution

The error "Failed to send a request to the Edge Function" occurs because the email service is not properly configured. This guide will help you set up email functionality.

## Quick Fix for Development

For local development, the email service now includes a fallback mode that logs emails to the console instead of sending them. This allows you to test the functionality without configuring external services.

## Production Email Setup

### Option 1: Using Resend (Recommended)

1. **Create a Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up and verify your domain

2. **Configure Environment Variables**
   Add these to your Supabase Edge Function secrets:
   ```bash
   EMAIL_SERVICE=resend
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=JLG DTR System
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy send-email
   ```

### Option 2: Using Brevo (Sendinblue)

1. **Create a Brevo Account**
   - Go to [brevo.com](https://www.brevo.com)
   - Sign up and get your API key

2. **Configure Environment Variables**
   ```bash
   EMAIL_SERVICE=brevo
   BREVO_API_KEY=your_brevo_api_key
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=JLG DTR System
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy send-email
   ```

### Option 3: Using SMTP

1. **Configure SMTP Environment Variables**
   ```bash
   EMAIL_SERVICE=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=your_email@gmail.com
   FROM_NAME=JLG DTR System
   ```

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy send-email
   ```

## Setting Environment Variables in Supabase

### Using Supabase CLI
```bash
supabase secrets set EMAIL_SERVICE=resend
supabase secrets set RESEND_API_KEY=your_api_key
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set FROM_NAME=JLG DTR System
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Settings → Edge Functions
3. Add your environment variables under "Secrets"

## Testing the Email Service

### Development Mode
In development, emails will be logged to the console. Check the browser console for email details.

### Production Mode
1. Deploy the Edge Functions
2. Test by sending an email from the admin dashboard
3. Check the recipient's inbox

## Troubleshooting

### Common Issues

1. **"Failed to send a request to the Edge Function"**
   - Ensure Edge Functions are deployed
   - Check your Supabase URL and keys
   - Verify network connectivity

2. **"Email service not configured"**
   - Set the required environment variables
   - Ensure your email service API keys are valid

3. **Domain Verification Issues**
   - Verify your domain in the email service provider
   - Check DNS settings (SPF, DKIM, DMARC)

4. **Rate Limiting**
   - Check your email service provider's limits
   - Implement rate limiting in your application

### Debug Steps

1. **Check Edge Function Logs**
   ```bash
   supabase functions logs send-email
   ```

2. **Test Edge Function Directly**
   ```bash
   curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<h1>Test</h1>"
     }'
   ```

3. **Check Environment Variables**
   ```bash
   supabase secrets list
   ```

## Security Considerations

1. **Never commit API keys to version control**
2. **Use environment-specific configurations**
3. **Implement proper email validation**
4. **Set up rate limiting to prevent abuse**
5. **Monitor email sending activity**

## Email Templates

The system includes three email templates:
- **Custom Email**: For general communications
- **System Announcements**: For important system updates
- **Deadline Reminders**: For OJT deadline notifications

All templates include:
- Professional JLG DEV Solutions branding
- Sender information
- Links to the DTR system
- HTML and text versions

## Next Steps

1. Choose your email service provider
2. Configure the environment variables
3. Deploy the Edge Functions
4. Test email functionality
5. Monitor email delivery rates

For additional support, check the Supabase documentation on Edge Functions and your email service provider's API documentation.
