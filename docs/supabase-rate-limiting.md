# Supabase Rate Limiting Configuration

## Problem
The default Supabase authentication endpoints have rate limiting that can cause 429 "Too Many Requests" errors during user registration.

## Solutions Implemented

### 1. Client-Side Rate Limiting
- Added `useRateLimit` hook to prevent excessive registration attempts
- Limits to 3 attempts per minute per user session
- Shows countdown timer when rate limited
- Automatically resets after successful registration

### 2. Enhanced Error Handling
- Detects rate limit errors (429 status)
- Provides clear user feedback
- Prevents further attempts during cooldown

## Recommended Supabase Dashboard Settings

### Increase Rate Limits (Pro Plan Required)
1. Go to Supabase Dashboard → Authentication → Settings
2. Adjust these settings:
   - **Rate Limiting**: Increase from default 30 requests/minute
   - **Email Rate Limit**: Increase from default 3 emails/minute
   - **OTP Rate Limit**: Increase from default 5 attempts/minute

### Alternative: Disable Email Confirmation (Development Only)
```sql
-- In Supabase SQL Editor
UPDATE auth.config SET 
  disable_signup = false,
  enable_email_confirmations = false;
```

### Production Recommendations
1. **Upgrade to Pro Plan**: Higher rate limits and better support
2. **Implement Custom Email Service**: Use Resend, SendGrid, or similar
3. **Add CAPTCHA**: Prevent bot registrations
4. **Monitor Usage**: Set up alerts for high registration volumes

## Code Implementation

### Rate Limit Hook Usage
```typescript
import { useRateLimit } from '@/hooks/use-rate-limit'

const rateLimit = useRateLimit(3, 60000) // 3 attempts per minute

// Check before API call
const { allowed, waitTime } = rateLimit.checkRateLimit()
if (!allowed) {
  // Show wait message
  return
}

// Record attempt
rateLimit.recordAttempt()

// Reset on success
rateLimit.reset()
```

### Error Handling
```typescript
if (error?.message?.includes('rate limit') || error?.message?.includes('429')) {
  setError('Too many attempts. Please wait before trying again.')
}
```

## Testing
1. Test rapid registration attempts
2. Verify rate limiting messages appear
3. Confirm successful registration resets limits
4. Check error handling for various scenarios
