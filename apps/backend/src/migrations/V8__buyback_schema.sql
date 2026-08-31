-- V8__buyback_schema.sql
-- Westos Jeans Buyback & Circular Fashion Program tables

-- Serialized products (must be created first)
CREATE TABLE serialized_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_code VARCHAR(100) NOT NULL UNIQUE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    sold_at TIMESTAMPTZ,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'returned', 'bought_back')),
    buyback_eligible BOOLEAN DEFAULT FALSE,
    buyback_eligible_until TIMESTAMPTZ,
    buyback_used BOOLEAN DEFAULT FALSE,
    buyback_used_at TIMESTAMPTZ,
    buyback_order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_serialized_products_serial_code ON serialized_products(serial_code);
CREATE INDEX idx_serialized_products_variant_id ON serialized_products(variant_id);
CREATE INDEX idx_serialized_products_customer_id ON serialized_products(customer_id);
CREATE INDEX idx_serialized_products_buyback_eligible ON serialized_products(buyback_eligible);
CREATE INDEX idx_serialized_products_buyback_until ON serialized_products(buyback_eligible_until);

-- Sale records
CREATE TABLE sale_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    serial_code VARCHAR(100),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    buyback_eligible_until TIMESTAMPTZ,
    buyback_used BOOLEAN DEFAULT FALSE,
    buyback_used_at TIMESTAMPTZ,
    buyback_order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sale_records_order_id ON sale_records(order_id);
CREATE INDEX idx_sale_records_customer_id ON sale_records(customer_id);
CREATE INDEX idx_sale_records_serial_code ON sale_records(serial_code);
CREATE INDEX idx_sale_records_buyback_eligible_until ON sale_records(buyback_eligible_until);
CREATE INDEX idx_sale_records_buyback_used ON sale_records(buyback_used);

-- Buyback configuration
CREATE TABLE buyback_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    benefit_amount INTEGER NOT NULL DEFAULT 150,
    promotional_benefit_amount INTEGER NOT NULL DEFAULT 200,
    promotional_min_order_amount NUMERIC(12,2) DEFAULT 999.00,
    eligibility_window_days INTEGER NOT NULL DEFAULT 180,
    enabled BOOLEAN DEFAULT TRUE,
    eligible_categories TEXT[] DEFAULT ARRAY['jeans'],
    verification_mode VARCHAR(50) DEFAULT 'delivery_time' CHECK (verification_mode IN ('delivery_time', 'drop_off')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO buyback_config (benefit_amount, promotional_benefit_amount, promotional_min_order_amount, eligibility_window_days, enabled, eligible_categories, verification_mode)
VALUES (150, 200, 999.00, 180, TRUE, ARRAY['jeans'], 'delivery_time')
ON CONFLICT DO NOTHING;

-- Buyback transactions
CREATE TABLE buyback_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    original_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    new_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    serial_code VARCHAR(100) NOT NULL,
    benefit_amount INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed', 'rejected')),
    verified_at TIMESTAMPTZ,
    delivery_partner_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buyback_transactions_customer_id ON buyback_transactions(customer_id);
CREATE INDEX idx_buyback_transactions_serial_code ON buyback_transactions(serial_code);
CREATE INDEX idx_buyback_transactions_status ON buyback_transactions(status);
CREATE INDEX idx_buyback_transactions_new_order_id ON buyback_transactions(new_order_id);

-- Delivery verifications
CREATE TABLE delivery_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyback_transaction_id UUID NOT NULL REFERENCES buyback_transactions(id) ON DELETE CASCADE,
    delivery_partner_id UUID,
    partner_name VARCHAR(255),
    verification_status VARCHAR(30) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'disputed')),
    verified_serial_code VARCHAR(100),
    verification_notes TEXT,
    photo_evidence_urls TEXT[],
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_verifications_buyback_id ON delivery_verifications(buyback_transaction_id);
CREATE INDEX idx_delivery_verifications_status ON delivery_verifications(verification_status);

-- Buyback reporting view
CREATE VIEW buyback_report AS
SELECT
    DATE_TRUNC('month', bt.created_at) AS month,
    COUNT(bt.id) AS total_buybacks,
    SUM(bt.benefit_amount) AS total_benefit_amount,
    COUNT(DISTINCT bt.customer_id) AS unique_customers,
    COUNT(DISTINCT bt.original_order_id) AS original_orders,
    COUNT(CASE WHEN bt.status = 'completed' THEN 1 END) AS completed_buybacks,
    AVG(bt.benefit_amount) AS avg_benefit_amount
FROM buyback_transactions bt
GROUP BY DATE_TRUNC('month', bt.created_at)
ORDER BY month DESC;

-- Buyback fraud detection view
CREATE VIEW buyback_fraud_detection AS
SELECT
    bt.serial_code,
    bt.customer_id,
    u.email,
    bt.original_order_id,
    bt.new_order_id,
    bt.benefit_amount,
    bt.status,
    bt.created_at,
    sr.buyback_eligible_until,
    sr.buyback_used,
    sr.buyback_used_at,
    CASE
        WHEN bt.status = 'completed' AND sr.buyback_used = FALSE THEN 'POTENTIAL_FRAUD'
        WHEN bt.status = 'completed' AND sr.buyback_eligible_until < bt.created_at THEN 'EXPIRED_ELIGIBILITY'
        WHEN bt.status = 'completed' AND sr.buyback_used = TRUE AND sr.buyback_order_id != bt.new_order_id THEN 'DUPLICATE_USE'
        ELSE 'OK'
    END AS fraud_flag
FROM buyback_transactions bt
JOIN users u ON bt.customer_id = u.id
LEFT JOIN serialized_products sr ON bt.serial_code = sr.serial_code
WHERE bt.status IN ('completed', 'verified');
