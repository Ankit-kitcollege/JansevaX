-- =========================================================
-- CivicPulse PostgreSQL + PostGIS Database Schema
-- =========================================================

-- Enable PostGIS extension for spatial GIS queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    contact_email VARCHAR(255),
    description TEXT
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN',
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Problem Clusters Table
CREATE TABLE IF NOT EXISTS problem_clusters (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    center_point GEOMETRY(Point, 4326),
    report_count INT NOT NULL DEFAULT 1,
    severity VARCHAR(50),
    priority_score INT DEFAULT 50,
    status VARCHAR(50) DEFAULT 'UNDER_REVIEW',
    affected_area_meters DOUBLE PRECISION DEFAULT 150.0,
    first_reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_point GEOMETRY(Point, 4326),
    address VARCHAR(500),
    landmark VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    priority_score INT NOT NULL DEFAULT 35,
    support_count INT DEFAULT 0,
    recurrence_count INT DEFAULT 0,
    cluster_id BIGINT REFERENCES problem_clusters(id) ON DELETE SET NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Indexes for PostGIS high performance queries
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_clusters_location ON problem_clusters USING GIST(center_point);

-- 5. Status History Table
CREATE TABLE IF NOT EXISTS status_history (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_name VARCHAR(255),
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Supports Table
CREATE TABLE IF NOT EXISTS supports (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, user_id)
);

-- 7. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    officer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_name VARCHAR(255),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 8. Progress Updates Table
CREATE TABLE IF NOT EXISTS progress_updates (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    officer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    before_image_url VARCHAR(500),
    after_image_url VARCHAR(500),
    status_change VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Resolution Verifications Table
CREATE TABLE IF NOT EXISTS resolution_verifications (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    citizen_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    result VARCHAR(50) NOT NULL, -- YES_RESOLVED or NO_REOPENED
    feedback TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Recurring Problems Table
CREATE TABLE IF NOT EXISTS recurring_problems (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_point GEOMETRY(Point, 4326),
    address VARCHAR(500),
    occurrence_count INT NOT NULL DEFAULT 2,
    first_reported_at TIMESTAMP WITH TIME ZONE,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    avg_recurrence_days INT DEFAULT 30
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    related_report_id BIGINT,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
