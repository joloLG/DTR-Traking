# Email System Quick Setup Guide

## 🚀 Quick Setup Steps

### 1. Database Setup (Already Done)
✅ Role system implemented  
✅ Email service created  
✅ Admin dashboard updated  

### 2. Choose Email Provider

#### Option 1: Resend (Recommended - Easiest)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Set environment variables:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_SERVICE=resend
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=JLG DTR System
```

#### Option 2: Gmail SMTP (Free)
1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Set environment variables:
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
```bash
# From your project root
supabase functions deploy send-email
```

### 4. Configure Supabase Environment
1. Go to your Supabase project dashboard
2. Navigate to Project Settings > Edge Functions
3. Add the environment variables from step 2

### 5. Test the System
1. Login as admin user
2. Go to `/admin/dashboard`
3. Scroll to "Email Communications" section
4. Send a test email to yourself

## 📧 How to Use

### In Admin Dashboard:
1. **Select Email Type:**
   - Custom Email: Flexible messaging
   - System Announcement: Official notifications
   - Deadline Reminder: Important deadlines

2. **Choose Recipients:**
   - All users, regular users only, or admins only

3. **Compose Message:**
   - Add subject/title
   - Write your message
   - Add deadline (for reminders)

4. **Send Email:**
   - Click send button
   - Wait for success confirmation

## 🛠️ Troubleshooting

### Email Not Sending?
1. Check environment variables in Supabase
2. Verify Edge Function is deployed
3. Check Edge Function logs in Supabase

### Permission Issues?
1. Ensure user has admin role
2. Check role-based routing

### Build Errors?
The build should work now. If you see TypeScript errors:
1. Edge Functions are excluded from build
2. Focus on src/ directory errors only

## 📁 Files Created/Modified

### New Files:
- `src/lib/email-service.ts` - Email service and templates
- `src/components/email-composer.tsx` - Email UI component
- `src/components/ui/textarea.tsx` - Textarea component
- `src/components/ui/select.tsx` - Select dropdown
- `src/components/ui/label.tsx` - Label component
- `src/components/ui/radio-group.tsx` - Radio button group
- `supabase/functions/send-email/index.ts` - Edge function
- `README-EMAIL-SYSTEM.md` - Full documentation

### Modified Files:
- `src/app/admin/dashboard/page.tsx` - Added email composer
- `tsconfig.json` - Excluded Edge Functions from build

## 🎯 Next Steps

1. **Set up your email provider** (Step 2 above)
2. **Deploy the Edge Function** (Step 3)
3. **Configure environment variables** (Step 4)
4. **Test with a small user group**
5. **Start sending emails!**

## 💡 Pro Tips

- **Test with yourself first** before sending to all users
- **Use deadline reminders** for important dates
- **System announcements** for official notifications
- **Custom emails** for flexible messaging

## 🆘 Need Help?

Check the full documentation in `README-EMAIL-SYSTEM.md` for detailed setup instructions and troubleshooting.

---

**Ready to send emails! 🎉**
