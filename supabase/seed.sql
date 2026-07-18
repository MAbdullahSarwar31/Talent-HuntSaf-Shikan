-- SAF SHIKAN Mission Profitability - Seed Data
-- 5 Drones, 8 Pakistani Operators, 25 Missions with Costs, Payments, and Scoring Rules

-- Clear existing data (if any during local seed)
TRUNCATE TABLE profitability_scores, costs, payments, missions, maintenance_logs, scoring_rules, operators, drones CASCADE;

-- 1. Insert 5 Drones (3 Strong, 2 Weak/Maintenance-heavy)
INSERT INTO drones (id, serial_number, model, status, total_flight_hours, maintenance_burden_hours, hourly_depreciation_cost_pkr) VALUES
('11111111-1111-1111-1111-111111111101', 'SS-AGRAS-T40-01', 'Agras T40 Pro', 'active', 420.50, 12.00, 4800.00),
('11111111-1111-1111-1111-111111111102', 'SS-AGRAS-T40-02', 'Agras T40 Pro', 'active', 385.20, 8.50, 4800.00),
('11111111-1111-1111-1111-111111111103', 'SS-AGRAS-T20P-03', 'Agras T20P Plus', 'active', 290.00, 6.00, 3600.00),
('11111111-1111-1111-1111-111111111104', 'SS-FALCON-X-04', 'SS-Falcon Heavy', 'maintenance', 510.80, 145.20, 6500.00), -- Weak / high maintenance
('11111111-1111-1111-1111-111111111105', 'SS-FALCON-X-05', 'SS-Falcon Heavy', 'active', 480.10, 112.00, 6500.00);  -- Weak / high maintenance

-- 2. Insert 8 Pakistani Operators (2 with high retry rates)
INSERT INTO operators (id, full_name, cnic, location, province, experience_years, hourly_rate_pkr, total_missions, retry_rate_percentage) VALUES
('22222222-2222-2222-2222-222222222201', 'Tariq Mehmood', '36302-1234567-1', 'Multan', 'Punjab', 5, 3200.00, 85, 2.40),
('22222222-2222-2222-2222-222222222202', 'Bilal Ahmed', '35202-7654321-3', 'Lahore', 'Punjab', 4, 3000.00, 64, 4.10),
('22222222-2222-2222-2222-222222222203', 'Usman Khan', '31303-9876543-5', 'Rahim Yar Khan', 'Punjab', 3, 2800.00, 52, 3.80),
('22222222-2222-2222-2222-222222222204', 'Shahzad Ali', '45204-1122334-7', 'Sukkur', 'Sindh', 4, 3100.00, 48, 5.20),
('22222222-2222-2222-2222-222222222205', 'Imran Qureshi', '41304-5566778-9', 'Hyderabad', 'Sindh', 3, 2900.00, 41, 4.90),
('22222222-2222-2222-2222-222222222206', 'Asif Zardari', '45302-9988776-1', 'Nawabshah', 'Sindh', 2, 2600.00, 30, 6.00),
('22222222-2222-2222-2222-222222222207', 'Hamza Tariq', '36301-4433221-3', 'Faisalabad', 'Punjab', 1, 2400.00, 22, 28.50), -- High retry operator
('22222222-2222-2222-2222-222222222208', 'Rashid Minhas', '33100-6655443-5', 'Sahiwal', 'Punjab', 1, 2400.00, 18, 32.10);  -- High retry operator

-- 3. Insert Scoring Rules
INSERT INTO scoring_rules (id, name, weight, threshold_good, threshold_poor, description) VALUES
('33333333-3333-3333-3333-333333333301', 'Net Profit Margin Ratio', 50.00, 35.00, 15.00, 'Primary weight: net profit percentage over total mission revenue.'),
('33333333-3333-3333-3333-333333333302', 'Travel Cost Leakage Penalty', 20.00, 15.00, 30.00, 'Penalty when travel/transport costs exceed threshold % of total revenue.'),
('33333333-3333-3333-3333-333333333303', 'Retry Friction Penalty', 15.00, 1.00, 3.00, 'Heavy penalty for multiple spraying retries due to operator error or equipment stalls.'),
('33333333-3333-3333-3333-333333333304', 'Idle & Delay Overhead', 15.00, 30.00, 90.00, 'Penalty when field delay or idle battery waiting time exceeds thresholds.');

-- 4. Insert 25 Completed Missions
-- Story: Multan Cotton (High Profit), Sukkur/Hyderabad Sugarcane/Rice (High Leakage/Travel), Lahore Wheat (Moderate)
INSERT INTO missions (id, code, title, date, location, province, crop_type, status, drone_id, operator_id, flight_hours, duration_minutes, delay_minutes, retry_count, idle_time_minutes, area_covered_acres, revenue_pkr) VALUES
-- Multan Cotton (Extremely Profitable, strong drones & operators)
('44444444-4444-4444-4444-444444444401', 'MSN-2026-001', 'Cotton Canopy Spray - Multan Block A', '2026-07-15', 'Multan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 4.5, 310, 0, 0, 20, 180.0, 320000.00),
('44444444-4444-4444-4444-444444444402', 'MSN-2026-002', 'Cotton Pest Control - Multan Block B', '2026-07-14', 'Multan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 3.8, 260, 10, 0, 15, 155.0, 285000.00),
('44444444-4444-4444-4444-444444444403', 'MSN-2026-003', 'Cotton Micronutrient Spray - Shujabad', '2026-07-13', 'Multan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203', 5.2, 360, 15, 0, 30, 210.0, 380000.00),
('44444444-4444-4444-4444-444444444404', 'MSN-2026-004', 'Cotton Insecticide Run - Lodhran Sector 4', '2026-07-12', 'Multan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201', 4.0, 275, 5, 0, 25, 165.0, 295000.00),
('44444444-4444-4444-4444-444444444405', 'MSN-2026-005', 'Cotton Foliar Feed - Khanewal Fields', '2026-07-11', 'Multan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 3.5, 240, 0, 0, 15, 140.0, 260000.00),
('44444444-4444-4444-4444-444444444406', 'MSN-2026-006', 'Cotton Bollworm Defense - Vehari Estate', '2026-07-10', 'Multan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 6.0, 410, 20, 1, 40, 240.0, 430000.00),

-- Sukkur & Hyderabad Sugarcane & Rice (High Margin Leakage due to Travel & Retries)
('44444444-4444-4444-4444-444444444407', 'MSN-2026-007', 'Sugarcane Deep Foliar - Sukkur Barrage Belt', '2026-07-15', 'Sukkur', 'Sindh', 'Sugarcane', 'completed', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222204', 5.5, 450, 90, 4, 120, 190.0, 310000.00), -- Severe retries & travel
('44444444-4444-4444-4444-444444444408', 'MSN-2026-008', 'Sugarcane Rust Treatment - Rohri Sector', '2026-07-14', 'Sukkur', 'Sindh', 'Sugarcane', 'completed', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222207', 4.8, 420, 110, 5, 140, 160.0, 265000.00), -- Hamza Tariq high retries
('44444444-4444-4444-4444-444444444409', 'MSN-2026-009', 'Rice Paddy Blast Spray - Larkana Belt', '2026-07-13', 'Sukkur', 'Sindh', 'Rice', 'completed', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222208', 5.0, 430, 85, 4, 95, 175.0, 280000.00), -- Rashid Minhas high retries
('44444444-4444-4444-4444-444444444410', 'MSN-2026-010', 'Sugarcane Stem Borer Run - Ghotki Fields', '2026-07-12', 'Sukkur', 'Sindh', 'Sugarcane', 'completed', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222204', 6.2, 510, 130, 3, 110, 210.0, 340000.00),
('44444444-4444-4444-4444-444444444411', 'MSN-2026-011', 'Rice Fungal Application - Hyderabad North', '2026-07-15', 'Hyderabad', 'Sindh', 'Rice', 'completed', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222205', 4.2, 340, 45, 2, 60, 150.0, 245000.00),
('44444444-4444-4444-4444-444444444412', 'MSN-2026-012', 'Rice Zinc Boost - Badin Coastal Sector', '2026-07-14', 'Hyderabad', 'Sindh', 'Rice', 'completed', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222206', 4.5, 380, 70, 3, 85, 160.0, 255000.00),
('44444444-4444-4444-4444-444444444413', 'MSN-2026-013', 'Sugarcane Growth Regulator - Tando Allahyar', '2026-07-11', 'Hyderabad', 'Sindh', 'Sugarcane', 'completed', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222207', 5.8, 480, 95, 5, 130, 185.0, 290000.00), -- Hamza Tariq high retries
('44444444-4444-4444-4444-444444444414', 'MSN-2026-014', 'Rice Nitrogen Foliar - Mirpur Khas', '2026-07-10', 'Hyderabad', 'Sindh', 'Rice', 'completed', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222205', 3.9, 310, 30, 1, 45, 140.0, 235000.00),

-- Lahore & Faisalabad Wheat (Moderate Profitability)
('44444444-4444-4444-4444-444444444415', 'MSN-2026-015', 'Wheat Herbicide Run - Kasur Border Zone', '2026-07-15', 'Lahore', 'Punjab', 'Wheat', 'completed', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 3.5, 240, 15, 0, 20, 130.0, 210000.00),
('44444444-4444-4444-4444-444444444416', 'MSN-2026-016', 'Wheat Rust Prevention - Sheikhupura Fields', '2026-07-14', 'Lahore', 'Punjab', 'Wheat', 'completed', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222202', 4.0, 280, 25, 1, 35, 150.0, 240000.00),
('44444444-4444-4444-4444-444444444417', 'MSN-2026-017', 'Wheat Micronutrient Mist - Gujranwala South', '2026-07-13', 'Lahore', 'Punjab', 'Wheat', 'completed', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222202', 3.8, 265, 20, 0, 30, 140.0, 225000.00),
('44444444-4444-4444-4444-444444444418', 'MSN-2026-018', 'Wheat Aphid Control - Faisalabad Agri Sector', '2026-07-15', 'Faisalabad', 'Punjab', 'Wheat', 'completed', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222207', 4.5, 360, 60, 3, 65, 165.0, 260000.00), -- Hamza Tariq retries
('44444444-4444-4444-4444-444444444419', 'MSN-2026-019', 'Wheat Canopy Feed - Jhang Road Sector', '2026-07-12', 'Faisalabad', 'Punjab', 'Wheat', 'completed', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222208', 4.2, 330, 50, 3, 55, 155.0, 245000.00), -- Rashid Minhas retries
('44444444-4444-4444-4444-444444444420', 'MSN-2026-020', 'Wheat Late Season Guard - Toba Tek Singh', '2026-07-11', 'Faisalabad', 'Punjab', 'Wheat', 'completed', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 5.0, 345, 10, 0, 25, 185.0, 295000.00),

-- Additional Mixed & Rahim Yar Khan Cotton / Sugarcane
('44444444-4444-4444-4444-444444444421', 'MSN-2026-021', 'Cotton Early Pest Guard - Sadiqabad Farms', '2026-07-15', 'Rahim Yar Khan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 4.6, 315, 10, 0, 20, 175.0, 315000.00),
('44444444-4444-4444-4444-444444444422', 'MSN-2026-022', 'Sugarcane Root Stimulator - Liaquatpur Block', '2026-07-14', 'Rahim Yar Khan', 'Punjab', 'Sugarcane', 'completed', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222203', 5.2, 390, 40, 2, 50, 180.0, 285000.00),
('44444444-4444-4444-4444-444444444423', 'MSN-2026-023', 'Cotton Whitefly Eradication - Bahawalpur Sector', '2026-07-13', 'Multan', 'Punjab', 'Cotton', 'completed', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 5.5, 370, 0, 0, 15, 210.0, 375000.00),
('44444444-4444-4444-4444-444444444424', 'MSN-2026-024', 'Rice Leaf Folder Defense - Shikarpur Belt', '2026-07-12', 'Sukkur', 'Sindh', 'Rice', 'completed', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222204', 4.4, 350, 50, 2, 60, 155.0, 250000.00),
('44444444-4444-4444-4444-444444444425', 'MSN-2026-025', 'Wheat Harvest Booster - Okara Agricultural Hub', '2026-07-11', 'Lahore', 'Punjab', 'Wheat', 'completed', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 4.0, 270, 15, 0, 20, 145.0, 235000.00);

-- 5. Insert Costs for each Mission
-- We structure costs to clearly highlight travel leakage on Sukkur/Hyderabad & retry leakage on Falcon-X / retry operators
INSERT INTO costs (id, mission_id, category, amount_pkr, notes) VALUES
-- MSN-001 (Multan Cotton - Highly Profitable: Total cost 145k vs Revenue 320k => 54.7% margin)
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444401', 'travel', 15000.00, 'Local van transport within Multan district'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444401', 'battery_wear', 28000.00, 'Standard Agras T40 battery cycle depreciation'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444401', 'chemical_loading', 68000.00, 'High quality canopy insecticide mix'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444401', 'operator_labor', 24000.00, 'Senior operator Tariq fee'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444401', 'maintenance_reserve', 10000.00, 'Routine reserve allocation'),

-- MSN-007 (Sukkur Sugarcane - Severe Leakage: Total cost 292k vs Revenue 310k => 5.8% margin / Critical)
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444407', 'travel', 95000.00, 'Long haul transport 350km + field recovery vehicle'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444407', 'battery_wear', 45000.00, 'Overheated battery degradation on Falcon-X'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444407', 'chemical_loading', 72000.00, 'Deep Sugarcane fungicide formula'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444407', 'operator_labor', 30000.00, 'Extended field delay labor cost'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444407', 'retry_fuel', 35000.00, '4 aborted spray loops due to nozzle clogging'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444407', 'maintenance_reserve', 15000.00, 'Falcon heavy maintenance buffer'),

-- MSN-008 (Sukkur Sugarcane - Loss making: Total cost 285k vs Revenue 265k => -7.5% margin / Loss)
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444408', 'travel', 88000.00, 'Remote inter-district travel & rough terrain accommodation'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444408', 'battery_wear', 42000.00, 'Heavy payload battery stress cycles'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444408', 'chemical_loading', 65000.00, 'Sugarcane rust chemical mix'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444408', 'operator_labor', 28000.00, 'Hamza Tariq extended duration fee'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444408', 'retry_fuel', 46000.00, '5 retries due to operator navigation errors & pump stalls'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444408', 'maintenance_reserve', 16000.00, 'High maintenance allocation'),

-- MSN-002 (Multan Cotton - Good/Excellent)
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444402', 'travel', 14000.00, 'Short transit within district'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444402', 'battery_wear', 24000.00, 'Standard battery wear'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444402', 'chemical_loading', 62000.00, 'Pest control chemical package'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444402', 'operator_labor', 21000.00, 'Standard fee'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444402', 'maintenance_reserve', 9000.00, 'Standard reserve'),

-- MSN-003 (Multan Cotton - Excellent: Total cost 165k vs Revenue 380k => 56.5% margin)
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444403', 'travel', 18000.00, 'Shujabad highway transit'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444403', 'battery_wear', 32000.00, 'High area coverage cycle'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444403', 'chemical_loading', 78000.00, 'Premium micronutrient mix'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444403', 'operator_labor', 26000.00, 'Usman Khan efficiency bonus'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444403', 'maintenance_reserve', 11000.00, 'Reserve allocation'),

-- MSN-015 (Lahore Wheat - Good: Total cost 120k vs Revenue 210k => 42.8% margin)
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444415', 'travel', 22000.00, 'Kasur regional van dispatch'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444415', 'battery_wear', 22000.00, 'Agras T40 standard'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444415', 'chemical_loading', 48000.00, 'Herbicide formulation'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444415', 'operator_labor', 19000.00, 'Bilal Ahmed fee'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444415', 'maintenance_reserve', 9000.00, 'Standard reserve'),

-- MSN-018 (Faisalabad Wheat - Poor/Leakage: Total cost 220k vs Revenue 260k => 15.3% margin)
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444418', 'travel', 52000.00, 'Cross-zone logistics and fuel surge'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444418', 'battery_wear', 30000.00, 'Multiple partial charges'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444418', 'chemical_loading', 68000.00, 'Heavy aphid chemical batch'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444418', 'operator_labor', 28000.00, 'Hamza Tariq field delay fee'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444418', 'retry_fuel', 30000.00, '3 retry loops due to drift'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444418', 'maintenance_reserve', 12000.00, 'Reserve allocation');

-- 6. Insert Maintenance Logs (showing weak Falcon-X drones needing frequent repair)
INSERT INTO maintenance_logs (id, drone_id, date, cost_pkr, hours_down, description) VALUES
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111104', '2026-07-08', 185000.00, 48.0, 'Falcon-X pump manifold replacement & ESC cooling fan repair'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111104', '2026-06-25', 120000.00, 36.0, 'Nozzle arm calibration failure and rotor bearing replacement'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111105', '2026-07-02', 140000.00, 32.0, 'Battery docking port overheating & telemetry transmitter swap'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111101', '2026-06-30', 35000.00, 8.0, 'Routine Agras T40 nozzle cleaning and firmware diagnostic check');
