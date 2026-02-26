-- Flyway V1: Initial schema for Pilot Logbook

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('PILOT', 'FLEET_MANAGER', 'ADMIN');
CREATE TYPE aircraft_category AS ENUM (
    'SINGLE_ENGINE_LAND', 'MULTI_ENGINE_LAND',
    'SINGLE_ENGINE_SEA', 'MULTI_ENGINE_SEA',
    'HELICOPTER', 'GLIDER', 'TURBOPROP', 'JET'
);
CREATE TYPE aircraft_status AS ENUM ('AIRWORTHY', 'GROUNDED', 'MAINTENANCE');
CREATE TYPE weather_condition AS ENUM ('VMC', 'IMC');
CREATE TYPE flight_rule AS ENUM ('VFR', 'IFR');
CREATE TYPE maintenance_check_type AS ENUM (
    'ANNUAL', 'HUNDRED_HOUR', 'FIFTY_HOUR',
    'PHASE', 'UNSCHEDULED', 'AD_COMPLIANCE'
);
CREATE TYPE maintenance_status AS ENUM ('DUE', 'OVERDUE', 'COMPLETED', 'IN_PROGRESS');

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(120)  NOT NULL,
    email            VARCHAR(255)  NOT NULL UNIQUE,
    password         VARCHAR(255)  NOT NULL,
    role             user_role     NOT NULL,
    certificate_number VARCHAR(50),
    medical_class    VARCHAR(20),
    medical_expiry   VARCHAR(20),
    avatar_initials  VARCHAR(4)    NOT NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── aircraft ─────────────────────────────────────────────────────────────────
CREATE TABLE aircraft (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tail_number           VARCHAR(20)        NOT NULL UNIQUE,
    make                  VARCHAR(100)       NOT NULL,
    model                 VARCHAR(100)       NOT NULL,
    year                  SMALLINT           NOT NULL,
    category              aircraft_category  NOT NULL,
    total_airframe_hours  NUMERIC(10,1)      NOT NULL DEFAULT 0,
    status                aircraft_status    NOT NULL DEFAULT 'AIRWORTHY',
    engine_count          SMALLINT           NOT NULL DEFAULT 1,
    max_passengers        SMALLINT           NOT NULL DEFAULT 1,
    owner_id              UUID               REFERENCES users(id) ON DELETE SET NULL,
    image_url             TEXT,
    created_at            TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ─── flight_log_entries ───────────────────────────────────────────────────────
CREATE TABLE flight_log_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id            UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aircraft_id         UUID            NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
    date                DATE            NOT NULL,
    departure_airport   VARCHAR(10)     NOT NULL,
    arrival_airport     VARCHAR(10)     NOT NULL,
    total_flight_time   NUMERIC(6,1)    NOT NULL DEFAULT 0,
    pic_time            NUMERIC(6,1)    NOT NULL DEFAULT 0,
    sic_time            NUMERIC(6,1)    NOT NULL DEFAULT 0,
    dual_received_time  NUMERIC(6,1)    NOT NULL DEFAULT 0,
    solo_time           NUMERIC(6,1)    NOT NULL DEFAULT 0,
    night_time          NUMERIC(6,1)    NOT NULL DEFAULT 0,
    ifr_time            NUMERIC(6,1)    NOT NULL DEFAULT 0,
    cross_country_time  NUMERIC(6,1)    NOT NULL DEFAULT 0,
    day_landings        SMALLINT        NOT NULL DEFAULT 0,
    night_landings      SMALLINT        NOT NULL DEFAULT 0,
    weather_condition   weather_condition NOT NULL,
    flight_rule         flight_rule     NOT NULL,
    remarks             TEXT,
    simulator_time      NUMERIC(6,1),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── flight_approach_types (ElementCollection) ────────────────────────────────
CREATE TABLE flight_approach_types (
    flight_log_entry_id UUID    NOT NULL REFERENCES flight_log_entries(id) ON DELETE CASCADE,
    approach_type       VARCHAR(50) NOT NULL
);

-- ─── maintenance_records ──────────────────────────────────────────────────────
CREATE TABLE maintenance_records (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aircraft_id      UUID                    NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
    check_type       maintenance_check_type  NOT NULL,
    status           maintenance_status      NOT NULL,
    scheduled_date   DATE                    NOT NULL,
    completed_date   DATE,
    hours_at_check   NUMERIC(10,1)           NOT NULL DEFAULT 0,
    next_due_hours   NUMERIC(10,1),
    next_due_date    DATE,
    technician       VARCHAR(120),
    squawks          TEXT,
    cost             NUMERIC(12,2),
    notes            TEXT,
    created_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_flight_logs_pilot_id   ON flight_log_entries(pilot_id);
CREATE INDEX idx_flight_logs_aircraft_id ON flight_log_entries(aircraft_id);
CREATE INDEX idx_flight_logs_date       ON flight_log_entries(date DESC);
CREATE INDEX idx_maintenance_aircraft   ON maintenance_records(aircraft_id);
CREATE INDEX idx_maintenance_status     ON maintenance_records(status);
