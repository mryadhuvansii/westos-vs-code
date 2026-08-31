-- V1 Part 2: Password reset tokens, Roles, Permissions, Admin tables

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    scope VARCHAR(50) DEFAULT 'all',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_permissions_unique ON permissions(resource, action, scope);

-- Role permissions (many-to-many)
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Admin users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_super_admin BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_username ON admin_users(username);

-- Admin 2FA
CREATE TABLE admin_2fa (
    admin_user_id UUID PRIMARY KEY REFERENCES admin_users(id) ON DELETE CASCADE,
    secret VARCHAR(255) NOT NULL,
    backup_codes TEXT[],
    enabled BOOLEAN DEFAULT FALSE,
    enforced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin sessions
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX idx_admin_sessions_refresh_token ON admin_sessions(refresh_token_hash);

-- Admin role assignments
CREATE TABLE admin_role_assignments (
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    warehouse_scope UUID[],
    assigned_by UUID REFERENCES admin_users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (admin_user_id, role_id)
);

-- Session table for customer refresh tokens
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
-- Insert default roles
INSERT INTO roles (name, description, is_system) VALUES
    ('super_admin', 'Super Administrator with full access', TRUE),
    ('admin', 'Administrator with management access', TRUE),
    ('manager', 'Manager with limited management access', TRUE),
    ('operator', 'Operator with operational access', TRUE),
    ('viewer', 'Read-only access', TRUE),
    ('customer', 'Registered customer', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (resource, action, scope, description) VALUES
    ('PRODUCT', 'CREATE', 'ALL', 'Create products'),
    ('PRODUCT', 'READ', 'ALL', 'Read products'),
    ('PRODUCT', 'UPDATE', 'ALL', 'Update products'),
    ('PRODUCT', 'ARCHIVE', 'ALL', 'Archive products'),
    ('PRODUCT', 'CREATE', 'OWN', 'Create own products'),
    ('PRODUCT', 'READ', 'OWN', 'Read own products'),
    ('PRODUCT', 'UPDATE', 'OWN', 'Update own products'),
    ('CATEGORY', 'CREATE', 'ALL', 'Create categories'),
    ('CATEGORY', 'READ', 'ALL', 'Read categories'),
    ('CATEGORY', 'UPDATE', 'ALL', 'Update categories'),
    ('BRAND', 'CREATE', 'ALL', 'Create brands'),
    ('BRAND', 'READ', 'ALL', 'Read brands'),
    ('BRAND', 'UPDATE', 'ALL', 'Update brands'),
    ('INVENTORY', 'READ', 'ALL', 'Read inventory'),
    ('INVENTORY', 'UPDATE', 'ALL', 'Update inventory'),
    ('INVENTORY', 'ADJUST', 'ALL', 'Adjust inventory'),
    ('INVENTORY', 'TRANSFER', 'ALL', 'Transfer inventory'),
    ('ORDER', 'CREATE', 'ALL', 'Create orders'),
    ('ORDER', 'READ', 'ALL', 'Read orders'),
    ('ORDER', 'UPDATE', 'ALL', 'Update orders'),
    ('ORDER', 'CANCEL', 'ALL', 'Cancel orders'),
    ('ORDER', 'READ', 'OWN', 'Read own orders'),
    ('ORDER', 'CREATE', 'OWN', 'Create own orders'),
    ('PAYMENT', 'READ', 'ALL', 'Read payments'),
    ('PAYMENT', 'PROCESS', 'ALL', 'Process payments'),
    ('PAYMENT', 'REFUND', 'ALL', 'Process refunds'),
    ('SHIPPING', 'READ', 'ALL', 'Read shipments'),
    ('SHIPPING', 'CREATE', 'ALL', 'Create shipments'),
    ('SHIPPING', 'UPDATE', 'ALL', 'Update shipments'),
    ('RETURN', 'READ', 'ALL', 'Read returns'),
    ('RETURN', 'PROCESS', 'ALL', 'Process returns'),
    ('REFUND', 'READ', 'ALL', 'Read refunds'),
    ('REFUND', 'PROCESS', 'ALL', 'Process refunds'),
    ('CUSTOMER', 'READ', 'ALL', 'Read customers'),
    ('CUSTOMER', 'UPDATE', 'ALL', 'Update customers'),
    ('CUSTOMER', 'BLOCK', 'ALL', 'Block customers'),
    ('COUPON', 'CREATE', 'ALL', 'Create coupons'),
    ('COUPON', 'READ', 'ALL', 'Read coupons'),
    ('COUPON', 'UPDATE', 'ALL', 'Update coupons'),
    ('DISCOUNT', 'CREATE', 'ALL', 'Create discounts'),
    ('DISCOUNT', 'READ', 'ALL', 'Read discounts'),
    ('DISCOUNT', 'UPDATE', 'ALL', 'Update discounts'),
    ('ANALYTICS', 'READ', 'ALL', 'Read analytics'),
    ('REPORT', 'CREATE', 'ALL', 'Create reports'),
    ('SETTINGS', 'READ', 'ALL', 'Read settings'),
    ('SETTINGS', 'UPDATE', 'ALL', 'Update settings'),
    ('AUDIT', 'READ', 'ALL', 'Read audit logs'),
    ('USER', 'READ', 'ALL', 'Read users'),
    ('USER', 'UPDATE', 'ALL', 'Update users'),
    ('ROLE', 'READ', 'ALL', 'Read roles'),
    ('ROLE', 'ASSIGN', 'ALL', 'Assign roles')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Assign all permissions to super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Assign admin permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.resource IN ('PRODUCT', 'CATEGORY', 'BRAND', 'INVENTORY', 'ORDER', 'PAYMENT', 'SHIPPING', 'RETURN', 'REFUND', 'CUSTOMER', 'COUPON', 'DISCOUNT', 'ANALYTICS', 'REPORT', 'SETTINGS', 'CUSTOMER', 'USER')
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_consents_updated_at BEFORE UPDATE ON user_consents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_2fa_updated_at BEFORE UPDATE ON admin_2fa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
