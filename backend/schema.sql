-- ==========================================================
-- AEROINDEX DATABASE SCHEMA (PostgreSQL 15+)
-- Ministry of Civil Aviation / SIH 2026 Reference Architecture
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AIRLINES
CREATE TABLE IF NOT EXISTS airlines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g. 6E, AI, UK, SG
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AIRPORTS
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- IATA Code: DEL, BOM, BLR, etc.
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    tier VARCHAR(20) DEFAULT 'Tier-1', -- Metro, Tier-1, Tier-2, Regional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROUTES
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    origin_id INTEGER REFERENCES airports(id) ON DELETE CASCADE,
    destination_id INTEGER REFERENCES airports(id) ON DELETE CASCADE,
    distance_km INTEGER NOT NULL,
    corridor_type VARCHAR(30) DEFAULT 'METRO_TRUNK', -- METRO_TRUNK, TIER1_TIER2, REGIONAL_UDAN
    weight NUMERIC(5, 4) NOT NULL DEFAULT 0.5500, -- Laspeyres capacity basket weight (0.55, 0.30, 0.15)
    base_price_p0 NUMERIC(10, 2) DEFAULT 4500.00, -- P0 baseline fare (Jan 15, 2024 anchor)
    base_capacity_q0 INTEGER DEFAULT 10000, -- Q0 base passenger capacity
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_route UNIQUE(origin_id, destination_id)
);

-- 4. SCRAPE JOBS
CREATE TABLE IF NOT EXISTS scrape_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(80) NOT NULL, -- e.g. 'IndiGo Direct', 'Air India GDS', 'MakeMyTrip'
    status VARCHAR(30) NOT NULL, -- 'RUNNING', 'COMPLETED', 'FAILED_429', 'THROTTLED'
    extraction_method VARCHAR(50) DEFAULT 'HEADLESS_CHROMIUM',
    records_found INTEGER DEFAULT 0,
    records_valid INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. AIRFARE SNAPSHOTS (Time-series Partitioned by travel_date / collection_time)
CREATE TABLE IF NOT EXISTS airfare_snapshots (
    id BIGSERIAL PRIMARY KEY,
    scrape_job_id UUID REFERENCES scrape_jobs(id) ON DELETE SET NULL,
    airline_id INTEGER REFERENCES airlines(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    flight_number VARCHAR(20) NOT NULL,
    collection_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE NOT NULL,
    booking_window VARCHAR(10) NOT NULL, -- 'T+1', 'T+7', 'T+15', 'T+30', 'T+45'
    lead_days INTEGER NOT NULL,
    cabin_class VARCHAR(20) DEFAULT 'ECONOMY',
    base_fare NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    udf NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- User Development Fee
    convenience_fee NUMERIC(10, 2) NOT NULL DEFAULT 350.00,
    total_fare NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'NORMAL', -- 'NORMAL', 'SUSPICIOUS', 'INVALID'
    z_score NUMERIC(5, 2),
    outlier_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR LOW-LATENCY AGGREGATIONS & LASPEYRES CALCULATION
CREATE INDEX IF NOT EXISTS idx_snapshots_route_date ON airfare_snapshots(route_id, travel_date);
CREATE INDEX IF NOT EXISTS idx_snapshots_window ON airfare_snapshots(booking_window);
CREATE INDEX IF NOT EXISTS idx_snapshots_airline ON airfare_snapshots(airline_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_collection ON airfare_snapshots(collection_time DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_status ON airfare_snapshots(status);

-- SAMPLE SEED DATA
INSERT INTO airlines (id, name, code, active) VALUES
(1, 'IndiGo', '6E', TRUE),
(2, 'Air India', 'AI', TRUE),
(3, 'Vistara', 'UK', TRUE),
(4, 'SpiceJet', 'SG', TRUE),
(5, 'Akasa Air', 'QP', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO airports (id, code, name, city, state, tier) VALUES
(1, 'DEL', 'Indira Gandhi International Airport', 'New Delhi', 'Delhi', 'Metro'),
(2, 'BOM', 'Chhatrapati Shivaji Maharaj International', 'Mumbai', 'Maharashtra', 'Metro'),
(3, 'BLR', 'Kempegowda International Airport', 'Bengaluru', 'Karnataka', 'Metro'),
(4, 'HYD', 'Rajiv Gandhi International Airport', 'Hyderabad', 'Telangana', 'Metro'),
(5, 'CCU', 'Netaji Subhash Chandra Bose Airport', 'Kolkata', 'West Bengal', 'Metro'),
(6, 'MAA', 'Chennai International Airport', 'Chennai', 'Tamil Nadu', 'Metro'),
(7, 'GOI', 'Dabolim Airport', 'Goa', 'Goa', 'Tier-1'),
(8, 'AMD', 'Sardar Vallabhbhai Patel Airport', 'Ahmedabad', 'Gujarat', 'Tier-1'),
(9, 'PNQ', 'Pune Airport', 'Pune', 'Maharashtra', 'Tier-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO routes (id, origin_id, destination_id, distance_km, corridor_type, weight, base_price_p0, base_capacity_q0) VALUES
(1, 1, 2, 1148, 'METRO_TRUNK', 0.28, 4850.00, 25000), -- DEL-BOM
(2, 1, 3, 1740, 'METRO_TRUNK', 0.27, 5200.00, 22000), -- DEL-BLR
(3, 2, 3, 842,  'METRO_TRUNK', 0.15, 3800.00, 18000), -- BOM-BLR
(4, 1, 4, 1260, 'TIER1_TIER2', 0.15, 4400.00, 15000), -- DEL-HYD
(5, 2, 7, 435,  'TIER1_TIER2', 0.08, 3200.00, 12000), -- BOM-GOI
(6, 4, 1, 1260, 'REGIONAL_UDAN', 0.07, 4200.00, 9000) -- HYD-DEL
ON CONFLICT (id) DO NOTHING;
