# SMTP Email System Implementation

## Overview
This implementation adds comprehensive email functionality to the DTR Tracker system, allowing admins to send various types of emails to users.

## Features

### 📧 Email Types
1. **Custom Email** - Flexible custom messages
2. **System Announcements** - Official system notifications
3. **Deadline Reminders** - Important deadline alerts

### 🎯 Targeting Options
- **All Users** - Send to everyone in the system
- **Regular Users Only** - Send to non-admin users
- **Admins Only** - Send to admin users only

### 📨 Email Service Providers
The system supports multiple email providers:
1. **Resend** (Recommended)
2. **Brevo** (Sendinblue)
3. **Direct SMTP** (Custom SMTP server)

## Setup Instructions

### 1. Database Migration
First, ensure the role system is implemented (see README-ROLES.md).

### 2. Email Service Configuration

#### Option A: Resend (Recommended)
```bash
# Set environment variables
RESEND_API_KEY=your_resend_api_key
EMAIL_SERVICE=resend
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=JLG DTR System
```

#### Option B: Brevo
```bash
BREVO_API_KEY=your_brevo_api_key
EMAIL_SERVICE=brevo
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=JLG DTR System
```

#### Option C: Direct SMTP
```bash
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=JLG DTR System
```

### 3. Deploy Edge Function
Deploy the Supabase Edge Function:
```bash
# Navigate to your project
cd your-supabase-project

# Deploy the email function
supabase functions deploy send-email
```

### 4. Update Environment Variables in Supabase
Set the email configuration in your Supabase dashboard:
1. Go to Project Settings > Edge Functions
2. Add the environment variables from step 2

## Usage

### Admin Dashboard Email Composer
1. **Navigate to Admin Dashboard** → `/admin/dashboard`
2. **Scroll to Email Communications section**
3. **Choose Email Type:**
   - Custom Email: Flexible messaging
   - System Announcement: Official notifications
   - Deadline Reminder: Time-sensitive alerts
4. **Select Target Audience:**
   - All users, regular users, or admins only
5. **Compose Message:**
   - Fill in subject/title
   - Add deadline (for reminders)
   - Write your message
6. **Send Email:** Click send to dispatch to all selected users

### Email Templates
All emails include:
- **Professional Branding:** JLG DEV Solutions header and footer
- **Admin Attribution:** Shows sender's name
- **System Links:** Direct link to DTR system
- **Responsive Design:** Works on all devices
- **HTML & Text:** Both formats for compatibility

## API Reference

### Email Service Class
```typescript
import { emailService } from '@/lib/email-service'

// Send custom email
await emailService.sendToAllUsers(
  subject: string,
  message: string,
  adminName: string,
  userType: 'all' | 'users' | 'admins'
)

// Send system announcement
await emailService.sendSystemAnnouncement(
  title: string,
  message: string,
  adminName: string,
  userType: 'all' | 'users' | 'admins'
)

// Send deadline reminder
await emailService.sendDeadlineReminder(
  deadline: string,
  description: string,
  adminName: string,
  userType: 'all' | 'users' | 'admins'
)
```

### Edge Function API
```typescript
// Direct API call
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: ['user@example.com', 'user2@example.com'],
    subject: 'Test Email',
    html: '<p>Test message</p>',
    text: 'Test message'
  })
})
```

## File Structure

```
src/
├── lib/
│   └── email-service.ts          # Email service class and templates
├── components/
│   └── email-composer.tsx        # Email composer UI component
└── app/
    └── admin/
        └── dashboard/
            └── page.tsx          # Admin dashboard with email integration

supabase/
└── functions/
    └── send-email/
        └── index.ts              # Edge function for email sending
```

## Email Templates Examples

### System Announcement
- **Use Case:** System maintenance, new features, policy updates
- **Template:** Professional header, clear message, call-to-action

### Deadline Reminder
- **Use Case:** OJT deadlines, report submissions, important dates
- **Template:** Highlighted deadline box, urgent styling

### Custom Email
- **Use Case:** Special notifications, personalized messages
- **Template:** Flexible content, custom formatting

## Security Considerations

### Rate Limiting
- Consider implementing rate limiting for email sending
- Monitor email usage to prevent abuse

### Permission Control
- Only admin users can access email composer
- Role-based access control enforced in layout

### Content Security
- HTML content is sanitized in templates
- No user-provided scripts in emails

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check environment variables in Supabase
   - Verify API keys are correct
   - Check Edge Function logs

2. **Template Errors**
   - Ensure all required fields are filled
   - Check for HTML syntax errors in custom messages

3. **Permission Denied**
   - Verify user has admin role
   - Check role-based routing

### Debug Mode
Enable debug logging:
```typescript
// In email-service.ts
console.log('Email data:', emailData)
```

## Testing

### Local Testing
1. Set up environment variables locally
2. Test with small user groups first
3. Verify email delivery

### Production Testing
1. Test with actual email provider
2. Verify all email types work
3. Check email rendering on different devices

## Future Enhancements

### Planned Features
- **Email Templates Management** - Save and reuse templates
- **Scheduled Emails** - Send emails at specific times
- **Email Analytics** - Track open rates and engagement
- **Bulk User Management** - Advanced user filtering
- **Email History** - Log all sent emails

### Integration Ideas
- **SMS Notifications** - Add SMS support
- **Push Notifications** - Browser notifications
- **Slack Integration** - Send notifications to Slack
- **Calendar Integration** - Add events to calendars

## Support

For issues with:
- **Email Service Setup:** Check provider documentation
- **Supabase Edge Functions:** Review Supabase docs
- **UI Components:** Check component props and state
- **Database Issues:** Verify role system implementation

## License
© 2026 JLG-Dev Solutions. All rights reserved.
