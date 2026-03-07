# Email Service Test

## Development Mode Test

The email service now includes development mode functionality that logs emails to the console instead of sending them. Here's how to test it:

## Steps to Test

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Access Admin Dashboard**
   - Navigate to `http://localhost:3000/admin/dashboard`
   - Login with admin credentials

3. **Test Email Sending**
   - Scroll down to the "Email Communications" section
   - Fill in the email form:
     - Select email type (Custom Email, System Announcement, or Deadline Reminder)
     - Choose recipient type (All Users, Regular Users Only, or Admins Only)
     - Enter subject and message
   - Click "Send Email"

4. **Check Results**
   - In development mode, you should see:
     - Blue notice: "🔧 Development Mode - Emails will be logged to console"
     - Success message: "Email sent successfully to X recipient(s) (development mode)"
   - Open browser console (F12) to see the logged email details

## Expected Console Output

You should see something like:
```
📧 Mock email service (development mode): {
  to: ["user@example.com", "admin@example.com"],
  subject: "Test Email",
  htmlLength: 1234,
  textLength: 567
}
```

## Production Setup

When you're ready to send real emails:

1. **Choose an Email Service** (Resend recommended)
2. **Configure Environment Variables** (see EMAIL-SETUP-GUIDE.md)
3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy send-email
   ```

## Troubleshooting

If you still see the "Failed to send a request to the Edge Function" error:

1. **Check Environment Variables**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is set correctly
   - Verify the URL points to a real Supabase project

2. **Verify Edge Function Deployment**
   ```bash
   supabase functions list
   ```

3. **Test Edge Function Directly**
   ```bash
   curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"to": "test@example.com", "subject": "Test", "html": "<h1>Test</h1>"}'
   ```

## Email Templates

The system supports three email types:

1. **Custom Email**: General purpose emails with custom subject and message
2. **System Announcement**: Important system updates with special formatting
3. **Deadline Reminder**: OJT deadline notifications with deadline display

All emails include:
- Professional JLG DEV Solutions branding
- Sender information (admin name)
- Links to the DTR system
- Both HTML and text versions

## Next Steps

1. Test the development mode functionality
2. Set up your preferred email service provider
3. Configure production environment variables
4. Deploy and test in production
