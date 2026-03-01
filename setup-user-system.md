# User Account System Setup Guide

This guide will help you set up the complete user account creation system for your DTR Tracker application.

## 🚀 Quick Setup

### 1. Run SQL Functions
Execute the SQL file in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of create-user-function.sql
-- This will create all the necessary database functions
```

### 2. Add Environment Variables
Add these to your `.env` file:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add this for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Test the System
Visit `/admin/users` in your application to access the user management interface.

## 📋 Features Included

### ✅ Database Functions
- `create_user_account()` - Creates standard users
- `create_admin_user()` - Creates admin users
- `create_bulk_users()` - Creates multiple users at once
- `validate_user_data()` - Validates user input

### ✅ API Endpoints
- `POST /api/users` - Handle user creation requests
- `GET /api/users?action=health` - Health check

### ✅ Admin Interface
- Single user creation form
- Bulk user creation (CSV format)
- Admin user creation
- Real-time feedback and error handling

### ✅ Client Services
- TypeScript interfaces for type safety
- Validation functions
- Error handling
- Bulk operations support

## 🔧 Usage Examples

### Create a Single User
```typescript
import { registerUser } from '@/lib/user-service'

const result = await registerUser({
  email: 'john.doe@example.com',
  full_name: 'John Doe',
  password: 'SecurePassword123!',
  ojt_hours_required: 300.00
})
```

### Create Bulk Users
```typescript
import { createBulkUsers, prepareBulkUsers } from '@/lib/user-service'

const users = prepareBulkUsers([
  { email: 'user1@example.com', full_name: 'User One', ojt_hours_required: 200.00 },
  { email: 'user2@example.com', full_name: 'User Two', ojt_hours_required: 250.00 }
])

const result = await createBulkUsers(users)
```

### Create Admin User
```typescript
import { createAdminUser } from '@/lib/user-service'

const result = await createAdminUser({
  email: 'admin@example.com',
  full_name: 'System Admin',
  password: 'AdminPassword123!',
  ojt_hours_required: 0.00
}, true)
```

## 🎯 Bulk User Creation Format

For bulk creation, use this CSV format:
```
email@example.com, John Doe, 300.00
jane@example.com, Jane Smith, 250.00
admin@example.com, Admin User, 0.00
```

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only see their own data
- Service role can create users
- Admin users have elevated privileges

### Input Validation
- Email format validation
- Password strength requirements
- Duplicate email detection
- OJT hours validation

### Rate Limiting
- Client-side rate limiting (3 attempts/minute)
- Server-side validation
- Error handling for excessive requests

## 🛠️ Advanced Configuration

### Custom Password Generation
```typescript
import { generateRandomPassword } from '@/lib/user-service'

const password = generateRandomPassword(16) // 16-character password
```

### Custom Validation Rules
Modify the `validate_user_data` function in SQL to add custom validation rules.

### Email Templates
Configure Supabase email templates for user confirmation and password reset.

## 📊 Monitoring

### Health Check
```bash
curl "http://localhost:3000/api/users?action=health"
```

### User Statistics
```sql
-- Get user count by role
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN raw_user_meta_data->>'is_admin' = 'true' THEN 1 END) as admin_users
FROM auth.users;
```

## 🚨 Troubleshooting

### Common Issues

1. **"Service role required" error**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
   - Check that the key is valid and not expired

2. **"Function not found" error**
   - Run the SQL setup script in Supabase SQL Editor
   - Check that functions were created successfully

3. **Permission denied**
   - Verify RLS policies are correctly set
   - Check that service role has proper permissions

4. **Rate limiting errors**
   - Wait for the rate limit to reset
   - Check client-side rate limiting implementation

### Debug Mode
Add this to your `.env` for debugging:
```env
DEBUG=true
```

## 📈 Performance Tips

1. **Index Optimization**
   - The schema includes optimized indexes for email lookups
   - Consider adding indexes for frequently queried fields

2. **Bulk Operations**
   - Use bulk creation for multiple users
   - Batch operations to reduce API calls

3. **Caching**
   - Implement caching for user validation
   - Cache frequently accessed user data

## 🔄 Maintenance

### Regular Tasks
- Monitor user creation rates
- Clean up failed registration attempts
- Update password policies as needed
- Review admin user permissions

### Backup Strategy
- Regular database backups
- Export user data periodically
- Document admin user credentials securely

## 📞 Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure SQL functions were created successfully
4. Test with the health check endpoint

The system is now ready for production use! 🎉
