-- Add role column to users table
ALTER TABLE users 
ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Add constraint to ensure only valid roles
ALTER TABLE users 
ADD CONSTRAINT check_user_role 
CHECK (role IN ('admin', 'user'));

-- Create index for role column for better performance
CREATE INDEX idx_users_role ON users(role);

-- Update existing users to have 'user' role by default (this should match the default)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN (
        SELECT role FROM users 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
