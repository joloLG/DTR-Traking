import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

// Regular client for validation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface UserData {
  email: string
  full_name: string
  password: string
  ojt_hours_required: number
}

export interface CreateUserResult {
  success: boolean
  user_id?: string
  email?: string
  full_name?: string
  ojt_hours_required?: number
  is_admin?: boolean
  error?: string
  message?: string
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  message?: string
}

export interface BulkUserResult {
  success: boolean
  total_users: number
  success_count: number
  error_count: number
  results: CreateUserResult[]
}

/**
 * Validate user data before creation
 */
export async function validateUserData(userData: UserData): Promise<ValidationResult> {
  try {
    const { data, error } = await supabase.rpc('validate_user_data', {
      p_email: userData.email,
      p_full_name: userData.full_name,
      p_password: userData.password,
      p_ojt_hours_required: userData.ojt_hours_required
    })

    if (error) {
      throw new Error(`Validation failed: ${error.message}`)
    }

    return data as ValidationResult
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error']
    }
  }
}

/**
 * Create a new user account (requires service role)
 */
export async function createUserAccount(userData: UserData): Promise<CreateUserResult> {
  try {
    if (!supabaseService) {
      return {
        success: false,
        error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
      }
    }

    const { data, error } = await supabaseService.rpc('create_user_account', {
      p_email: userData.email,
      p_full_name: userData.full_name,
      p_password: userData.password,
      p_ojt_hours_required: userData.ojt_hours_required
    })

    if (error) {
      throw new Error(`User creation failed: ${error.message}`)
    }

    return data as CreateUserResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Create an admin user account (requires service role)
 */
export async function createAdminUser(
  userData: UserData,
  isAdmin: boolean = false
): Promise<CreateUserResult> {
  try {
    if (!supabaseService) {
      return {
        success: false,
        error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
      }
    }

    const { data, error } = await supabaseService.rpc('create_admin_user', {
      p_email: userData.email,
      p_full_name: userData.full_name,
      p_password: userData.password,
      p_ojt_hours_required: userData.ojt_hours_required,
      p_is_admin: isAdmin
    })

    if (error) {
      throw new Error(`Admin user creation failed: ${error.message}`)
    }

    return data as CreateUserResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Create multiple users in bulk (requires service role)
 */
export async function createBulkUsers(users: UserData[]): Promise<BulkUserResult> {
  try {
    if (!supabaseService) {
      return {
        success: false,
        total_users: users.length,
        success_count: 0,
        error_count: users.length,
        results: users.map(user => ({
          success: false,
          error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
        }))
      }
    }

    const { data, error } = await supabaseService.rpc('create_bulk_users', {
      p_users: JSON.stringify(users)
    })

    if (error) {
      throw new Error(`Bulk user creation failed: ${error.message}`)
    }

    return data as BulkUserResult
  } catch (error) {
    return {
      success: false,
      total_users: users.length,
      success_count: 0,
      error_count: users.length,
      results: users.map(user => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }
}

/**
 * Complete user registration with validation and creation
 */
export async function registerUser(userData: UserData): Promise<CreateUserResult> {
  // Step 1: Validate user data
  const validation = await validateUserData(userData)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors?.join(', ') || 'Validation failed'
    }
  }

  // Step 2: Create user account
  return await createUserAccount(userData)
}

/**
 * Generate random password for bulk user creation
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

/**
 * Prepare bulk users with generated passwords
 */
export function prepareBulkUsers(
  users: Omit<UserData, 'password'>[],
  generatePasswords: boolean = true
): UserData[] {
  return users.map(user => ({
    ...user,
    password: generatePasswords ? generateRandomPassword() : 'tempPassword123!'
  }))
}

// Example usage functions for different scenarios

/**
 * Create a sample user for testing
 */
export async function createSampleUser(): Promise<CreateUserResult> {
  const sampleUser: UserData = {
    email: 'sample.user@example.com',
    full_name: 'Sample User',
    password: 'SamplePassword123!',
    ojt_hours_required: 300.00
  }

  return await registerUser(sampleUser)
}

/**
 * Create an admin account
 */
export async function createSystemAdmin(): Promise<CreateUserResult> {
  const adminUser: UserData = {
    email: 'admin@dtr-system.com',
    full_name: 'System Administrator',
    password: 'AdminPassword123!',
    ojt_hours_required: 0.00
  }

  return await createAdminUser(adminUser, true)
}

/**
 * Setup initial users for the system
 */
export async function setupInitialUsers(): Promise<{
  admin: CreateUserResult
  sample: CreateUserResult
}> {
  const admin = await createSystemAdmin()
  const sample = await createSampleUser()

  return { admin, sample }
}
