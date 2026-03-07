# User Roles Implementation

## Overview
This implementation adds role-based access control to the DTR Tracker system with two roles:
- **admin**: Full system access and user management
- **user**: Standard DTR tracking functionality

## Database Changes

### 1. Run the Migration
Execute the SQL migration to add the role column to the users table:

```sql
-- Run this in your Supabase SQL Editor
-- File: add-user-roles.sql
```

### 2. What the Migration Does:
- Adds `role` column to `users` table with default value 'user'
- Creates constraint to ensure only 'admin' or 'user' roles
- Adds index for better performance
- Creates helper functions for role checking

## Role-Based Routing

### Automatic Routing
- **Admin users** are automatically redirected to `/admin/dashboard`
- **Regular users** are redirected to `/dashboard`
- Unauthorized access to admin routes is blocked

### Admin Dashboard Features
- **Statistics Overview**: Total users, active users, total hours, today's records
- **User Management**: Quick access to user creation and management
- **System Settings**: Access to system configuration
- **Recent Users Table**: Shows latest 5 users with their roles

## File Structure

```
src/app/
├── admin/
│   ├── dashboard/page.tsx     # Admin dashboard
│   ├── layout.tsx             # Admin layout with role protection
│   └── users/page.tsx         # User management (existing)
├── dashboard/page.tsx         # User dashboard (existing)
└── login/page.tsx             # Login page (existing)
```

## Updated Files

### Database Types
- `src/lib/database.ts`: Added `role` field to User interface

### Authentication
- `src/hooks/use-auth.ts`: Added role-based routing logic

### User Service
- `src/lib/user-service.ts`: Added optional role field for user creation

## Testing the Implementation

### 1. Create an Admin User
```sql
-- Update existing user to admin role
UPDATE users SET role = 'admin' WHERE email = 'your_admin_email@example.com';
```

### 2. Test Login Flow
- Admin login should redirect to `/admin/dashboard`
- User login should redirect to `/dashboard`

### 3. Test Access Control
- Try accessing `/admin/dashboard` as a regular user (should be blocked)
- Try accessing `/admin/dashboard` while logged out (should redirect to login)

## Future Enhancements

### Additional Admin Pages
- `/admin/users` - Enhanced user management
- `/admin/settings` - System configuration
- `/admin/reports` - Report generation

### Role-Based Features
- Granular permissions system
- Role-specific UI components
- Audit logging for admin actions

## Security Notes

- Admin layout includes role verification
- Server-side role checking recommended for API endpoints
- Consider implementing Row Level Security (RLS) policies for data access

## Migration Rollback

If needed, you can rollback the role changes:
```sql
ALTER TABLE users DROP COLUMN role;
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);
```
