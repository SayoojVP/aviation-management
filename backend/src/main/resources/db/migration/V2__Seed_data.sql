-- Flyway V2: Seed data for development / demo

-- ─── Demo users ───────────────────────────────────────────────────────────────
-- Passwords are BCrypt of "password123"
INSERT INTO users (id, name, email, password, role, certificate_number, medical_class, medical_expiry, avatar_initials)
VALUES
    ('a0000000-0000-0000-0000-000000000001',
     'Alex Thompson',
     'alex.thompson@demo.com',
     '$2a$12$K9FtwvO5T2yyBq577Y0Eqe7Hn6yvD6lV3r2MOdz5k4QST3jTzFZG2',
     'PILOT',
     'ATP-123456',
     'First Class',
     '2026-08-15',
     'AT'),

    ('a0000000-0000-0000-0000-000000000002',
     'Sarah Chen',
     'sarah.chen@demo.com',
     '$2a$12$K9FtwvO5T2yyBq577Y0Eqe7Hn6yvD6lV3r2MOdz5k4QST3jTzFZG2',
     'FLEET_MANAGER',
     NULL,
     NULL,
     NULL,
     'SC');

-- ─── Demo aircraft ────────────────────────────────────────────────────────────
INSERT INTO aircraft (id, tail_number, make, model, year, category, total_airframe_hours, status, engine_count, max_passengers, owner_id)
VALUES
    ('b0000000-0000-0000-0000-000000000001',
     'N12345', 'Cessna', '172 Skyhawk', 2018,
     'SINGLE_ENGINE_LAND', 1240.5, 'AIRWORTHY', 1, 3,
     'a0000000-0000-0000-0000-000000000002'),

    ('b0000000-0000-0000-0000-000000000002',
     'N67890', 'Piper', 'PA-44 Seminole', 2020,
     'MULTI_ENGINE_LAND', 845.0, 'AIRWORTHY', 2, 3,
     'a0000000-0000-0000-0000-000000000002'),

    ('b0000000-0000-0000-0000-000000000003',
     'N11111', 'Beechcraft', 'King Air 350', 2019,
     'TURBOPROP', 3120.0, 'MAINTENANCE', 2, 9,
     'a0000000-0000-0000-0000-000000000002');

-- ─── Demo flight logs ─────────────────────────────────────────────────────────
INSERT INTO flight_log_entries
    (id, pilot_id, aircraft_id, date, departure_airport, arrival_airport,
     total_flight_time, pic_time, sic_time, dual_received_time, solo_time,
     night_time, ifr_time, cross_country_time, day_landings, night_landings,
     weather_condition, flight_rule, remarks)
VALUES
    ('c0000000-0000-0000-0000-000000000001',
     'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     CURRENT_DATE - 5,
     'KLAX', 'KSFO', 1.2, 1.2, 0, 0, 0, 0, 0, 1.2, 1, 0, 'VMC', 'VFR',
     'Smooth flight, good visibility'),

    ('c0000000-0000-0000-0000-000000000002',
     'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     CURRENT_DATE - 12,
     'KSFO', 'KOAK', 0.5, 0.5, 0, 0, 0, 0, 0, 0, 1, 0, 'VMC', 'VFR',
     'Local pattern work'),

    ('c0000000-0000-0000-0000-000000000003',
     'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002',
     CURRENT_DATE - 20,
     'KORD', 'KMDW', 0.4, 0.4, 0, 0, 0, 0.4, 0.4, 0, 2, 0, 'IMC', 'IFR',
     'ILS approach, low IMC');

-- ─── Demo maintenance records ─────────────────────────────────────────────────
INSERT INTO maintenance_records
    (id, aircraft_id, check_type, status, scheduled_date, hours_at_check,
     next_due_hours, next_due_date, technician, notes)
VALUES
    ('d0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     'ANNUAL', 'DUE',
     CURRENT_DATE + 25,
     1240.5, 1340.5,
     CURRENT_DATE + 25,
     'John Smith A&P',
     'Annual inspection due'),

    ('d0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000003',
     'HUNDRED_HOUR', 'OVERDUE',
     CURRENT_DATE - 10,
     3120.0, 3220.0,
     CURRENT_DATE - 5,
     NULL,
     'King Air 100hr overdue — grounded for inspection'),

    ('d0000000-0000-0000-0000-000000000003',
     'b0000000-0000-0000-0000-000000000002',
     'FIFTY_HOUR', 'COMPLETED',
     CURRENT_DATE - 30,
     800.0, 850.0,
     CURRENT_DATE + 60,
     'Maria Garcia A&P',
     '50-hour completed without squawks');
