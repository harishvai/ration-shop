-- Smart Ration PostgreSQL Schema

-- 1. Users Table (Authentication & High-level Role)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PUBLIC', 'SALESMAN', 'HEAD')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ration Shops Table
CREATE TABLE IF NOT EXISTS ration_shops (
    shop_id VARCHAR(50) PRIMARY KEY,
    shop_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    contact_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    aadhaar_last4 VARCHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ration Cards Table
CREATE TABLE IF NOT EXISTS ration_cards (
    card_id SERIAL PRIMARY KEY,
    card_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(customer_id) ON DELETE CASCADE,
    assigned_shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    card_type VARCHAR(50) NOT NULL DEFAULT 'PHH' CHECK (card_type IN ('AAY', 'PHH', 'NPHH')),
    family_members_count INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shop Employees Table
CREATE TABLE IF NOT EXISTS shop_employees (
    employee_id VARCHAR(50) PRIMARY KEY,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    designation VARCHAR(100) DEFAULT 'Ration Distribution Officer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Ration Items Table
CREATE TABLE IF NOT EXISTS ration_items (
    item_id SERIAL PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    subsidized_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    market_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    image_icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Ration Entitlements Table (Monthly allocation per ration card)
CREATE TABLE IF NOT EXISTS ration_entitlements (
    entitlement_id SERIAL PRIMARY KEY,
    card_id INT NOT NULL REFERENCES ration_cards(card_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES ration_items(item_id) ON DELETE RESTRICT,
    month_year VARCHAR(7) NOT NULL,
    allocated_qty NUMERIC(10,2) NOT NULL,
    claimed_qty NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_card_item_month UNIQUE(card_id, item_id, month_year)
);

-- 8. Shop Inventory Table
-- Current Stock = opening_stock + received_stock - distributed_stock
CREATE TABLE IF NOT EXISTS shop_inventory (
    inventory_id SERIAL PRIMARY KEY,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    item_id INT NOT NULL REFERENCES ration_items(item_id) ON DELETE RESTRICT,
    opening_stock NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    received_stock NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    distributed_stock NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    min_threshold NUMERIC(10,2) NOT NULL DEFAULT 50.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_shop_item UNIQUE(shop_id, item_id)
);

-- 9. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    card_id INT NOT NULL REFERENCES ration_cards(card_id) ON DELETE RESTRICT,
    order_status VARCHAR(50) NOT NULL DEFAULT 'READY' CHECK (order_status IN ('PENDING', 'READY', 'DELIVERED', 'CANCELLED')),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    item_id INT NOT NULL REFERENCES ration_items(item_id) ON DELETE RESTRICT,
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('UPI', 'CARD', 'PAY_AT_SHOP')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED' CHECK (payment_status IN ('COMPLETED', 'PENDING', 'FAILED')),
    transaction_ref VARCHAR(100) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tokens Table
CREATE TABLE IF NOT EXISTS tokens (
    token_id SERIAL PRIMARY KEY,
    token_number VARCHAR(100) UNIQUE NOT NULL,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'READY' CHECK (status IN ('READY', 'DELIVERED', 'EXPIRED')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 13. Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id SERIAL PRIMARY KEY,
    order_id INT UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE RESTRICT,
    token_id INT UNIQUE NOT NULL REFERENCES tokens(token_id) ON DELETE RESTRICT,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    delivered_by_employee_id VARCHAR(50) NOT NULL REFERENCES shop_employees(employee_id) ON DELETE RESTRICT,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);

-- 14. Stock Transactions Table
CREATE TABLE IF NOT EXISTS stock_transactions (
    transaction_id SERIAL PRIMARY KEY,
    shop_id VARCHAR(50) NOT NULL REFERENCES ration_shops(shop_id) ON DELETE RESTRICT,
    item_id INT NOT NULL REFERENCES ration_items(item_id) ON DELETE RESTRICT,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('OPENING_BALANCE', 'RESTOCK_RECEIVED', 'DISPATCH_DELIVERY', 'ADJUSTMENT')),
    quantity NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NOT NULL,
    reference_id VARCHAR(100),
    employee_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance and Security Indexes
CREATE INDEX IF NOT EXISTS idx_ration_cards_shop ON ration_cards(assigned_shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_card ON orders(card_id);
CREATE INDEX IF NOT EXISTS idx_tokens_shop ON tokens(shop_id);
CREATE INDEX IF NOT EXISTS idx_tokens_number ON tokens(token_number);
CREATE INDEX IF NOT EXISTS idx_inventory_shop ON shop_inventory(shop_id);
CREATE INDEX IF NOT EXISTS idx_stock_trans_shop ON stock_transactions(shop_id);
