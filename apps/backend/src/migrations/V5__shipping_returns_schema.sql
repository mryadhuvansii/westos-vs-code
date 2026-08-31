-- V5__shipping_returns_schema.sql
-- Shipping, returns, refunds tables (Part 1)

-- Carriers (must be created first as shipments references it)
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    api_config JSONB,
    supported_services TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping methods
CREATE TABLE shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
    service_code VARCHAR(50) NOT NULL,
    zones JSONB NOT NULL,
    rates JSONB NOT NULL,
    estimated_days INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipping_methods_carrier_id ON shipping_methods(carrier_id);

-- Boxes
CREATE TABLE boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    length NUMERIC(10,3) NOT NULL,
    width NUMERIC(10,3) NOT NULL,
    height NUMERIC(10,3) NOT NULL,
    max_weight NUMERIC(10,3),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manifests (must be before shipments)
CREATE TABLE manifests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE RESTRICT,
    manifest_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'accepted', 'cancelled')),
    shipment_count INTEGER DEFAULT 0,
    total_weight NUMERIC(10,3),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manifests_warehouse_id ON manifests(warehouse_id);
CREATE INDEX idx_manifests_carrier_id ON manifests(carrier_id);

-- Shipments
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    tracking_url VARCHAR(500),
    status VARCHAR(30) DEFAULT 'created' CHECK (status IN ('created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed_delivery', 'rto_initiated', 'rto_delivered', 'cancelled')),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    label_url VARCHAR(500),
    manifest_id UUID REFERENCES manifests(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_warehouse_id ON shipments(warehouse_id);

-- Shipment items
CREATE TABLE shipment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipment_items_shipment_id ON shipment_items(shipment_id);

-- Tracking events
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(20) DEFAULT 'carrier' CHECK (source IN ('carrier', 'manual')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX idx_tracking_events_timestamp ON tracking_events(timestamp);

-- Pick lists
CREATE TABLE pick_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    batch_id UUID,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pick_lists_warehouse_id ON pick_lists(warehouse_id);

-- Pick list items
CREATE TABLE pick_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pick_list_id UUID NOT NULL REFERENCES pick_lists(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    picked_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'picked', 'partial', 'not_found')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pick_list_items_pick_list_id ON pick_list_items(pick_list_id);

-- Packing
CREATE TABLE packing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    box_id UUID REFERENCES boxes(id) ON DELETE SET NULL,
    packed_by UUID REFERENCES admin_users(id),
    weight NUMERIC(10,3),
    dimensions JSONB,
    packed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RMA (Return Merchandise Authorization)
CREATE TABLE rma_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rma_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'shipped', 'received', 'inspected', 'completed', 'cancelled')),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('defective', 'wrong_item', 'size_issue', 'changed_mind', 'damaged_shipping', 'quality_issue', 'other')),
    notes TEXT,
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rma_requests_order_id ON rma_requests(order_id);
CREATE INDEX idx_rma_requests_user_id ON rma_requests(user_id);
CREATE INDEX idx_rma_requests_status ON rma_requests(status);

-- RMA items
CREATE TABLE rma_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rma_request_id UUID NOT NULL REFERENCES rma_requests(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'damaged', 'missing_tags')),
    disposition VARCHAR(20) CHECK (disposition IN ('restock', 'write_off', 'quality_hold', 'repair')),
    restock_warehouse_id UUID REFERENCES warehouses(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rma_items_rma_request_id ON rma_items(rma_request_id);

-- Return requests
CREATE TABLE return_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    return_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'label_generated', 'shipped', 'received', 'inspected', 'completed', 'cancelled')),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('defective', 'wrong_item', 'size_issue', 'changed_mind', 'damaged_shipping', 'quality_issue', 'other')),
    notes TEXT,
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMPTZ,
    label_url VARCHAR(500),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX idx_return_requests_status ON return_requests(status);

-- Return items
CREATE TABLE return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_request_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'damaged', 'missing_tags')),
    disposition VARCHAR(20) CHECK (disposition IN ('restock', 'write_off', 'quality_hold', 'repair')),
    restock_warehouse_id UUID REFERENCES warehouses(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_return_items_return_request_id ON return_items(return_request_id);

-- Return evidence
CREATE TABLE return_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_request_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video')),
    url VARCHAR(500) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_return_evidence_return_request_id ON return_evidence(return_request_id);

-- Return inspections
CREATE TABLE return_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_request_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    inspected_by UUID REFERENCES admin_users(id),
    condition VARCHAR(20) CHECK (condition IN ('new', 'used', 'damaged', 'missing_tags')),
    disposition VARCHAR(20) CHECK (disposition IN ('restock', 'write_off', 'quality_hold', 'repair')),
    notes TEXT,
    inspected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_return_inspections_return_request_id ON return_inspections(return_request_id);

-- Refunds
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_request_id UUID REFERENCES return_requests(id) ON DELETE SET NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('original_payment', 'store_credit', 'bank_transfer')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMPTZ,
    provider_refund_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refunds_return_request_id ON refunds(return_request_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Refund approvals
CREATE TABLE refund_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_id UUID NOT NULL REFERENCES refunds(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_refund_approvals_refund_id ON refund_approvals(refund_id);

-- Delivery exceptions
CREATE TABLE delivery_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    exception_type VARCHAR(50) NOT NULL,
    description TEXT,
    resolution VARCHAR(50),
    resolved_by UUID REFERENCES admin_users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_exceptions_shipment_id ON delivery_exceptions(shipment_id);
);
