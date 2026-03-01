-- =====================================================
-- USER ACCOUNT CREATION SQL FUNCTION
-- =====================================================
-- This function creates user accounts in the Supabase database
-- and handles the complete user setup process
-- =====================================================

-- =====================================================
-- 1. MAIN USER CREATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_account(
    p_email VARCHAR(255),
    p_full_name VARCHAR(255),
    p_password TEXT,
    p_ojt_hours_required DECIMAL(10,2) DEFAULT 0.00
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result JSON;
    v_error_message TEXT;
BEGIN
    -- Validate input parameters
    IF p_email IS NULL OR p_email = '' THEN
        RETURN json_build_object('success', false, 'error', 'Email is required');
    END IF;
    
    IF p_full_name IS NULL OR p_full_name = '' THEN
        RETURN json_build_object('success', false, 'error', 'Full name is required');
    END IF;
    
    IF p_password IS NULL OR LENGTH(p_password) < 6 THEN
        RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters long');
    END IF;
    
    IF p_ojt_hours_required IS NULL OR p_ojt_hours_required < 0 THEN
        RETURN json_build_object('success', false, 'error', 'OJT hours required must be a positive number');
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        RETURN json_build_object('success', false, 'error', 'Email already registered');
    END IF;

    -- Begin transaction for atomic operation
    BEGIN
        -- Create user in auth.users table
        INSERT INTO auth.users (
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            p_email,
            crypt(p_password, gen_salt('bf')),
            NOW(), -- Auto-confirm email (set to NULL for email verification)
            NOW(),
            NOW(),
            json_build_object('full_name', p_full_name)
        ) RETURNING id INTO v_user_id;

        -- Create user profile in users table
        INSERT INTO users (
            id,
            email,
            full_name,
            ojt_hours_required,
            ojt_hours_completed
        ) VALUES (
            v_user_id,
            p_email,
            p_full_name,
            p_ojt_hours_required,
            0.00
        );

        -- Return success response
        v_result := json_build_object(
            'success', true,
            'user_id', v_user_id,
            'email', p_email,
            'full_name', p_full_name,
            'ojt_hours_required', p_ojt_hours_required,
            'message', 'User account created successfully'
        );

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback and return error
            v_error_message := SQLERRM;
            v_result := json_build_object(
                'success', false,
                'error', 'Failed to create user account: ' || v_error_message
            );
    END;

    RETURN v_result;
END;
$$;

-- =====================================================
-- 2. ADMIN USER CREATION FUNCTION (Service Role Only)
-- =====================================================

CREATE OR REPLACE FUNCTION create_admin_user(
    p_email VARCHAR(255),
    p_full_name VARCHAR(255),
    p_password TEXT,
    p_ojt_hours_required DECIMAL(10,2) DEFAULT 0.00,
    p_is_admin BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result JSON;
BEGIN
    -- Only allow service role to create admin users
    IF auth.role() != 'service_role' THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Service role required');
    END IF;

    -- Call the main user creation function
    v_result := create_user_account(p_email, p_full_name, p_password, p_ojt_hours_required);
    
    -- If user creation was successful and admin flag is set
    IF (v_result->>'success')::boolean AND p_is_admin THEN
        v_user_id := (v_result->>'user_id')::UUID;
        
        -- Add admin role in user metadata
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || json_build_object('is_admin', true)
        WHERE id = v_user_id;
        
        -- Update result to include admin status
        v_result := v_result || json_build_object('is_admin', true);
    END IF;
    
    RETURN v_result;
END;
$$;

-- =====================================================
-- 3. BULK USER CREATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_bulk_users(
    p_users JSON -- Array of user objects with email, full_name, password, ojt_hours_required
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_record JSON;
    v_result JSON;
    v_results JSON[] := '{}';
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
BEGIN
    -- Only allow service role for bulk operations
    IF auth.role() != 'service_role' THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Service role required');
    END IF;

    -- Process each user
    FOR v_user_record IN SELECT * FROM json_array_elements(p_users)
    LOOP
        -- Create individual user
        v_result := create_user_account(
            v_user_record->>'email',
            v_user_record->>'full_name',
            v_user_record->>'password',
            COALESCE((v_user_record->>'ojt_hours_required')::DECIMAL, 0.00)
        );
        
        -- Add to results array
        v_results := v_results || v_result;
        
        -- Count successes and errors
        IF (v_result->>'success')::boolean THEN
            v_success_count := v_success_count + 1;
        ELSE
            v_error_count := v_error_count + 1;
        END IF;
    END LOOP;
    
    -- Return summary results
    RETURN json_build_object(
        'success', true,
        'total_users', json_array_length(p_users),
        'success_count', v_success_count,
        'error_count', v_error_count,
        'results', v_results
    );
END;
$$;

-- =====================================================
-- 4. USER VALIDATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION validate_user_data(
    p_email VARCHAR(255),
    p_full_name VARCHAR(255),
    p_password TEXT,
    p_ojt_hours_required DECIMAL(10,2) DEFAULT 0.00
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_errors TEXT[] := '{}';
    v_result JSON;
BEGIN
    -- Email validation
    IF p_email IS NULL OR p_email = '' THEN
        v_errors := v_errors || 'Email is required';
    ELSIF NOT p_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        v_errors := v_errors || 'Invalid email format';
    ELSIF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        v_errors := v_errors || 'Email already registered';
    END IF;
    
    -- Name validation
    IF p_full_name IS NULL OR p_full_name = '' THEN
        v_errors := v_errors || 'Full name is required';
    ELSIF LENGTH(p_full_name) < 2 THEN
        v_errors := v_errors || 'Full name must be at least 2 characters';
    END IF;
    
    -- Password validation
    IF p_password IS NULL OR p_password = '' THEN
        v_errors := v_errors || 'Password is required';
    ELSIF LENGTH(p_password) < 6 THEN
        v_errors := v_errors || 'Password must be at least 6 characters long';
    ELSIF p_password = p_email THEN
        v_errors := v_errors || 'Password cannot be the same as email';
    END IF;
    
    -- OJT hours validation
    IF p_ojt_hours_required IS NULL THEN
        v_errors := v_errors || 'OJT hours required is required';
    ELSIF p_ojt_hours_required < 0 THEN
        v_errors := v_errors || 'OJT hours required must be positive';
    ELSIF p_ojt_hours_required > 10000 THEN
        v_errors := v_errors || 'OJT hours required seems too high';
    END IF;
    
    -- Return validation result
    IF array_length(v_errors, 1) > 0 THEN
        v_result := json_build_object(
            'valid', false,
            'errors', v_errors
        );
    ELSE
        v_result := json_build_object(
            'valid', true,
            'message', 'User data is valid'
        );
    END IF;
    
    RETURN v_result;
END;
$$;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users for validation
GRANT EXECUTE ON FUNCTION validate_user_data TO authenticated;
GRANT EXECUTE ON FUNCTION validate_user_data TO anon;

-- Grant execute permissions to service role for user creation
GRANT EXECUTE ON FUNCTION create_user_account TO service_role;
GRANT EXECUTE ON FUNCTION create_admin_user TO service_role;
GRANT EXECUTE ON FUNCTION create_bulk_users TO service_role;

-- =====================================================
-- 6. USAGE EXAMPLES
-- =====================================================

/*
-- Example 1: Create a single user (requires service role)
SELECT create_user_account(
    'john.doe@example.com',
    'John Doe',
    'securepassword123',
    300.00
);

-- Example 2: Validate user data (can be called from client)
SELECT validate_user_data(
    'jane.smith@example.com',
    'Jane Smith',
    'password123',
    250.00
);

-- Example 3: Create admin user (requires service role)
SELECT create_admin_user(
    'admin@example.com',
    'System Admin',
    'adminpassword123',
    0.00,
    true
);

-- Example 4: Create bulk users (requires service role)
SELECT create_bulk_users(
    '[
        {
            "email": "user1@example.com",
            "full_name": "User One",
            "password": "password123",
            "ojt_hours_required": 200.00
        },
        {
            "email": "user2@example.com", 
            "full_name": "User Two",
            "password": "password456",
            "ojt_hours_required": 150.00
        }
    ]'::json
);

-- Example 5: Check if function exists and test
SELECT 
    proname as function_name,
    prosrc as source_code_preview
FROM pg_proc 
WHERE proname IN ('create_user_account', 'validate_user_data')
LIMIT 1;
*/

-- =====================================================
-- 7. SETUP VERIFICATION
-- =====================================================

-- Verify functions were created successfully
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_account') THEN
        RAISE EXCEPTION 'create_user_account function was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_user_data') THEN
        RAISE EXCEPTION 'validate_user_data function was not created';
    END IF;
    
    RAISE NOTICE 'All user creation functions have been successfully created!';
END $$;
