import type { Drone, Operator, Mission, MissionCost, ScoringRule, MaintenanceLog } from '../types';
import { computeMissionProfitabilityScore } from './scoring';

export const mockDrones: Drone[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    serial_number: 'SS-AGRAS-T40-01',
    model: 'Agras T40 Pro',
    status: 'active',
    total_flight_hours: 420.50,
    maintenance_burden_hours: 12.00,
    hourly_depreciation_cost_pkr: 4800.00,
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    serial_number: 'SS-AGRAS-T40-02',
    model: 'Agras T40 Pro',
    status: 'active',
    total_flight_hours: 385.20,
    maintenance_burden_hours: 8.50,
    hourly_depreciation_cost_pkr: 4800.00,
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    serial_number: 'SS-AGRAS-T20P-03',
    model: 'Agras T20P Plus',
    status: 'active',
    total_flight_hours: 290.00,
    maintenance_burden_hours: 6.00,
    hourly_depreciation_cost_pkr: 3600.00,
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    serial_number: 'SS-FALCON-X-04',
    model: 'SS-Falcon Heavy',
    status: 'maintenance',
    total_flight_hours: 510.80,
    maintenance_burden_hours: 145.20,
    hourly_depreciation_cost_pkr: 6500.00,
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    serial_number: 'SS-FALCON-X-05',
    model: 'SS-Falcon Heavy',
    status: 'active',
    total_flight_hours: 480.10,
    maintenance_burden_hours: 112.00,
    hourly_depreciation_cost_pkr: 6500.00,
  }
];

export const mockOperators: Operator[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    full_name: 'Tariq Mehmood',
    cnic: '36302-1234567-1',
    location: 'Multan',
    province: 'Punjab',
    experience_years: 5,
    hourly_rate_pkr: 3200.00,
    total_missions: 85,
    retry_rate_percentage: 2.40,
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    full_name: 'Bilal Ahmed',
    cnic: '35202-7654321-3',
    location: 'Lahore',
    province: 'Punjab',
    experience_years: 4,
    hourly_rate_pkr: 3000.00,
    total_missions: 64,
    retry_rate_percentage: 4.10,
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    full_name: 'Usman Khan',
    cnic: '31303-9876543-5',
    location: 'Rahim Yar Khan',
    province: 'Punjab',
    experience_years: 3,
    hourly_rate_pkr: 2800.00,
    total_missions: 52,
    retry_rate_percentage: 3.80,
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    full_name: 'Shahzad Ali',
    cnic: '45204-1122334-7',
    location: 'Sukkur',
    province: 'Sindh',
    experience_years: 4,
    hourly_rate_pkr: 3100.00,
    total_missions: 48,
    retry_rate_percentage: 5.20,
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    full_name: 'Imran Qureshi',
    cnic: '41304-5566778-9',
    location: 'Hyderabad',
    province: 'Sindh',
    experience_years: 3,
    hourly_rate_pkr: 2900.00,
    total_missions: 41,
    retry_rate_percentage: 4.90,
  },
  {
    id: '22222222-2222-2222-2222-222222222206',
    full_name: 'Asif Zardari',
    cnic: '45302-9988776-1',
    location: 'Nawabshah',
    province: 'Sindh',
    experience_years: 2,
    hourly_rate_pkr: 2600.00,
    total_missions: 30,
    retry_rate_percentage: 6.00,
  },
  {
    id: '22222222-2222-2222-2222-222222222207',
    full_name: 'Hamza Tariq',
    cnic: '36301-4433221-3',
    location: 'Faisalabad',
    province: 'Punjab',
    experience_years: 1,
    hourly_rate_pkr: 2400.00,
    total_missions: 22,
    retry_rate_percentage: 28.50, // High retry operator
  },
  {
    id: '22222222-2222-2222-2222-222222222208',
    full_name: 'Rashid Minhas',
    cnic: '33100-6655443-5',
    location: 'Sahiwal',
    province: 'Punjab',
    experience_years: 1,
    hourly_rate_pkr: 2400.00,
    total_missions: 18,
    retry_rate_percentage: 32.10, // High retry operator
  }
];

export const mockScoringRules: ScoringRule[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    name: 'Net Profit Margin Ratio',
    weight: 50.00,
    threshold_good: 35.00,
    threshold_poor: 15.00,
    description: 'Primary weight: net profit percentage over total mission revenue.'
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    name: 'Travel Cost Leakage Penalty',
    weight: 20.00,
    threshold_good: 15.00,
    threshold_poor: 30.00,
    description: 'Penalty when travel/transport costs exceed threshold % of total revenue.'
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    name: 'Retry Friction Penalty',
    weight: 15.00,
    threshold_good: 1.00,
    threshold_poor: 3.00,
    description: 'Heavy penalty for multiple spraying retries due to operator error or equipment stalls.'
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    name: 'Idle & Delay Overhead',
    weight: 15.00,
    threshold_good: 30.00,
    threshold_poor: 90.00,
    description: 'Penalty when field delay or idle battery waiting time exceeds thresholds.'
  }
];

// Map itemized costs for representative missions
export const mockCostsByMission: Record<string, MissionCost[]> = {
  '44444444-4444-4444-4444-444444444401': [
    { id: 'c1', mission_id: '44444444-4444-4444-4444-444444444401', category: 'travel', amount_pkr: 15000, notes: 'Local van transport within Multan district' },
    { id: 'c2', mission_id: '44444444-4444-4444-4444-444444444401', category: 'battery_wear', amount_pkr: 28000, notes: 'Standard Agras T40 battery cycle depreciation' },
    { id: 'c3', mission_id: '44444444-4444-4444-4444-444444444401', category: 'chemical_loading', amount_pkr: 68000, notes: 'High quality canopy insecticide mix' },
    { id: 'c4', mission_id: '44444444-4444-4444-4444-444444444401', category: 'operator_labor', amount_pkr: 24000, notes: 'Senior operator Tariq fee' },
    { id: 'c5', mission_id: '44444444-4444-4444-4444-444444444401', category: 'maintenance_reserve', amount_pkr: 10000, notes: 'Routine reserve allocation' }
  ],
  '44444444-4444-4444-4444-444444444407': [
    { id: 'c6', mission_id: '44444444-4444-4444-4444-444444444407', category: 'travel', amount_pkr: 95000, notes: 'Long haul transport 350km + field recovery vehicle' },
    { id: 'c7', mission_id: '44444444-4444-4444-4444-444444444407', category: 'battery_wear', amount_pkr: 45000, notes: 'Overheated battery degradation on Falcon-X' },
    { id: 'c8', mission_id: '44444444-4444-4444-4444-444444444407', category: 'chemical_loading', amount_pkr: 72000, notes: 'Deep Sugarcane fungicide formula' },
    { id: 'c9', mission_id: '44444444-4444-4444-4444-444444444407', category: 'operator_labor', amount_pkr: 30000, notes: 'Extended field delay labor cost' },
    { id: 'c10', mission_id: '44444444-4444-4444-4444-444444444407', category: 'retry_fuel', amount_pkr: 35000, notes: '4 aborted spray loops due to nozzle clogging' },
    { id: 'c11', mission_id: '44444444-4444-4444-4444-444444444407', category: 'maintenance_reserve', amount_pkr: 15000, notes: 'Falcon heavy maintenance buffer' }
  ],
  '44444444-4444-4444-4444-444444444408': [
    { id: 'c12', mission_id: '44444444-4444-4444-4444-444444444408', category: 'travel', amount_pkr: 88000, notes: 'Remote inter-district travel & accommodation' },
    { id: 'c13', mission_id: '44444444-4444-4444-4444-444444444408', category: 'battery_wear', amount_pkr: 42000, notes: 'Heavy payload battery stress' },
    { id: 'c14', mission_id: '44444444-4444-4444-4444-444444444408', category: 'chemical_loading', amount_pkr: 65000, notes: 'Sugarcane rust chemical mix' },
    { id: 'c15', mission_id: '44444444-4444-4444-4444-444444444408', category: 'operator_labor', amount_pkr: 28000, notes: 'Hamza Tariq extended duration fee' },
    { id: 'c16', mission_id: '44444444-4444-4444-4444-444444444408', category: 'retry_fuel', amount_pkr: 46000, notes: '5 retries due to operator navigation errors' },
    { id: 'c17', mission_id: '44444444-4444-4444-4444-444444444408', category: 'maintenance_reserve', amount_pkr: 16000, notes: 'High maintenance allocation' }
  ],
  '44444444-4444-4444-4444-444444444403': [
    { id: 'c18', mission_id: '44444444-4444-4444-4444-444444444403', category: 'travel', amount_pkr: 18000, notes: 'Shujabad highway transit' },
    { id: 'c19', mission_id: '44444444-4444-4444-4444-444444444403', category: 'battery_wear', amount_pkr: 32000, notes: 'High area coverage cycle' },
    { id: 'c20', mission_id: '44444444-4444-4444-4444-444444444403', category: 'chemical_loading', amount_pkr: 78000, notes: 'Premium micronutrient mix' },
    { id: 'c21', mission_id: '44444444-4444-4444-4444-444444444403', category: 'operator_labor', amount_pkr: 26000, notes: 'Usman Khan efficiency bonus' },
    { id: 'c22', mission_id: '44444444-4444-4444-4444-444444444403', category: 'maintenance_reserve', amount_pkr: 11000, notes: 'Reserve allocation' }
  ],
  '44444444-4444-4444-4444-444444444415': [
    { id: 'c23', mission_id: '44444444-4444-4444-4444-444444444415', category: 'travel', amount_pkr: 22000, notes: 'Kasur regional van dispatch' },
    { id: 'c24', mission_id: '44444444-4444-4444-4444-444444444415', category: 'battery_wear', amount_pkr: 22000, notes: 'Agras T40 standard' },
    { id: 'c25', mission_id: '44444444-4444-4444-4444-444444444415', category: 'chemical_loading', amount_pkr: 48000, notes: 'Herbicide formulation' },
    { id: 'c26', mission_id: '44444444-4444-4444-4444-444444444415', category: 'operator_labor', amount_pkr: 19000, notes: 'Bilal Ahmed fee' },
    { id: 'c27', mission_id: '44444444-4444-4444-4444-444444444415', category: 'maintenance_reserve', amount_pkr: 9000, notes: 'Standard reserve' }
  ]
};

// Helper to generate default costs if specific array missing
function getDefaultCosts(missionId: string, revenue: number, retries: number, _crop: string, location: string): MissionCost[] {
  if (mockCostsByMission[missionId]) return mockCostsByMission[missionId];

  const isRemote = location === 'Sukkur' || location === 'Hyderabad';
  const travel = isRemote ? Math.round(revenue * 0.28) : Math.round(revenue * 0.06);
  const chemical = Math.round(revenue * 0.22);
  const battery = Math.round(revenue * 0.08);
  const labor = Math.round(revenue * 0.07);
  const retryFuel = retries * 12000;
  const reserve = Math.round(revenue * 0.04);

  return [
    { id: `${missionId}-t`, mission_id: missionId, category: 'travel', amount_pkr: travel, notes: 'Estimated transport logistics' },
    { id: `${missionId}-c`, mission_id: missionId, category: 'chemical_loading', amount_pkr: chemical, notes: 'Estimated chemical formulation' },
    { id: `${missionId}-b`, mission_id: missionId, category: 'battery_wear', amount_pkr: battery, notes: 'Estimated battery depreciation' },
    { id: `${missionId}-l`, mission_id: missionId, category: 'operator_labor', amount_pkr: labor, notes: 'Operator field allocation' },
    ...(retries > 0 ? [{ id: `${missionId}-r`, mission_id: missionId, category: 'retry_fuel' as const, amount_pkr: retryFuel, notes: `${retries} field retries` }] : []),
    { id: `${missionId}-m`, mission_id: missionId, category: 'maintenance_reserve', amount_pkr: reserve, notes: 'Reserve buffer' }
  ];
}

const rawMissionsData = [
  { id: '44444444-4444-4444-4444-444444444401', code: 'MSN-2026-001', title: 'Cotton Canopy Spray - Multan Block A', date: '2026-07-15', location: 'Multan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111101', operator_id: '22222222-2222-2222-2222-222222222201', flight_hours: 4.5, duration_minutes: 310, delay_minutes: 0, retry_count: 0, idle_time_minutes: 20, area_covered_acres: 180.0, revenue_pkr: 320000 },
  { id: '44444444-4444-4444-4444-444444444402', code: 'MSN-2026-002', title: 'Cotton Pest Control - Multan Block B', date: '2026-07-14', location: 'Multan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111101', operator_id: '22222222-2222-2222-2222-222222222201', flight_hours: 3.8, duration_minutes: 260, delay_minutes: 10, retry_count: 0, idle_time_minutes: 15, area_covered_acres: 155.0, revenue_pkr: 285000 },
  { id: '44444444-4444-4444-4444-444444444403', code: 'MSN-2026-003', title: 'Cotton Micronutrient Spray - Shujabad', date: '2026-07-13', location: 'Multan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111102', operator_id: '22222222-2222-2222-2222-222222222203', flight_hours: 5.2, duration_minutes: 360, delay_minutes: 15, retry_count: 0, idle_time_minutes: 30, area_covered_acres: 210.0, revenue_pkr: 380000 },
  { id: '44444444-4444-4444-4444-444444444404', code: 'MSN-2026-004', title: 'Cotton Insecticide Run - Lodhran Sector 4', date: '2026-07-12', location: 'Multan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111102', operator_id: '22222222-2222-2222-2222-222222222201', flight_hours: 4.0, duration_minutes: 275, delay_minutes: 5, retry_count: 0, idle_time_minutes: 25, area_covered_acres: 165.0, revenue_pkr: 295000 },
  { id: '44444444-4444-4444-4444-444444444405', code: 'MSN-2026-005', title: 'Cotton Foliar Feed - Khanewal Fields', date: '2026-07-11', location: 'Multan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111103', operator_id: '22222222-2222-2222-2222-222222222203', flight_hours: 3.5, duration_minutes: 240, delay_minutes: 0, retry_count: 0, idle_time_minutes: 15, area_covered_acres: 140.0, revenue_pkr: 260000 },
  { id: '44444444-4444-4444-4444-444444444406', code: 'MSN-2026-006', title: 'Cotton Bollworm Defense - Vehari Estate', date: '2026-07-10', location: 'Multan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111101', operator_id: '22222222-2222-2222-2222-222222222201', flight_hours: 6.0, duration_minutes: 410, delay_minutes: 20, retry_count: 1, idle_time_minutes: 40, area_covered_acres: 240.0, revenue_pkr: 430000 },
  { id: '44444444-4444-4444-4444-444444444407', code: 'MSN-2026-007', title: 'Sugarcane Deep Foliar - Sukkur Barrage Belt', date: '2026-07-15', location: 'Sukkur', province: 'Sindh' as const, crop_type: 'Sugarcane' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111104', operator_id: '22222222-2222-2222-2222-222222222204', flight_hours: 5.5, duration_minutes: 450, delay_minutes: 90, retry_count: 4, idle_time_minutes: 120, area_covered_acres: 190.0, revenue_pkr: 310000 },
  { id: '44444444-4444-4444-4444-444444444408', code: 'MSN-2026-008', title: 'Sugarcane Rust Treatment - Rohri Sector', date: '2026-07-14', location: 'Sukkur', province: 'Sindh' as const, crop_type: 'Sugarcane' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111104', operator_id: '22222222-2222-2222-2222-222222222207', flight_hours: 4.8, duration_minutes: 420, delay_minutes: 110, retry_count: 5, idle_time_minutes: 140, area_covered_acres: 160.0, revenue_pkr: 265000 },
  { id: '44444444-4444-4444-4444-444444444409', code: 'MSN-2026-009', title: 'Rice Paddy Blast Spray - Larkana Belt', date: '2026-07-13', location: 'Sukkur', province: 'Sindh' as const, crop_type: 'Rice' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111105', operator_id: '22222222-2222-2222-2222-222222222208', flight_hours: 5.0, duration_minutes: 430, delay_minutes: 85, retry_count: 4, idle_time_minutes: 95, area_covered_acres: 175.0, revenue_pkr: 280000 },
  { id: '44444444-4444-4444-4444-444444444410', code: 'MSN-2026-010', title: 'Sugarcane Stem Borer Run - Ghotki Fields', date: '2026-07-12', location: 'Sukkur', province: 'Sindh' as const, crop_type: 'Sugarcane' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111104', operator_id: '22222222-2222-2222-2222-222222222204', flight_hours: 6.2, duration_minutes: 510, delay_minutes: 130, retry_count: 3, idle_time_minutes: 110, area_covered_acres: 210.0, revenue_pkr: 340000 },
  { id: '44444444-4444-4444-4444-444444444411', code: 'MSN-2026-011', title: 'Rice Fungal Application - Hyderabad North', date: '2026-07-15', location: 'Hyderabad', province: 'Sindh' as const, crop_type: 'Rice' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111105', operator_id: '22222222-2222-2222-2222-222222222205', flight_hours: 4.2, duration_minutes: 340, delay_minutes: 45, retry_count: 2, idle_time_minutes: 60, area_covered_acres: 150.0, revenue_pkr: 245000 },
  { id: '44444444-4444-4444-4444-444444444412', code: 'MSN-2026-012', title: 'Rice Zinc Boost - Badin Coastal Sector', date: '2026-07-14', location: 'Hyderabad', province: 'Sindh' as const, crop_type: 'Rice' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111105', operator_id: '22222222-2222-2222-2222-222222222206', flight_hours: 4.5, duration_minutes: 380, delay_minutes: 70, retry_count: 3, idle_time_minutes: 85, area_covered_acres: 160.0, revenue_pkr: 255000 },
  { id: '44444444-4444-4444-4444-444444444413', code: 'MSN-2026-013', title: 'Sugarcane Growth Regulator - Tando Allahyar', date: '2026-07-11', location: 'Hyderabad', province: 'Sindh' as const, crop_type: 'Sugarcane' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111104', operator_id: '22222222-2222-2222-2222-222222222207', flight_hours: 5.8, duration_minutes: 480, delay_minutes: 95, retry_count: 5, idle_time_minutes: 130, area_covered_acres: 185.0, revenue_pkr: 290000 },
  { id: '44444444-4444-4444-4444-444444444414', code: 'MSN-2026-014', title: 'Rice Nitrogen Foliar - Mirpur Khas', date: '2026-07-10', location: 'Hyderabad', province: 'Sindh' as const, crop_type: 'Rice' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111105', operator_id: '22222222-2222-2222-2222-222222222205', flight_hours: 3.9, duration_minutes: 310, delay_minutes: 30, retry_count: 1, idle_time_minutes: 45, area_covered_acres: 140.0, revenue_pkr: 235000 },
  { id: '44444444-4444-4444-4444-444444444415', code: 'MSN-2026-015', title: 'Wheat Herbicide Run - Kasur Border Zone', date: '2026-07-15', location: 'Lahore', province: 'Punjab' as const, crop_type: 'Wheat' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111102', operator_id: '22222222-2222-2222-2222-222222222202', flight_hours: 3.5, duration_minutes: 240, delay_minutes: 15, retry_count: 0, idle_time_minutes: 20, area_covered_acres: 130.0, revenue_pkr: 210000 },
  { id: '44444444-4444-4444-4444-444444444416', code: 'MSN-2026-016', title: 'Wheat Rust Prevention - Sheikhupura Fields', date: '2026-07-14', location: 'Lahore', province: 'Punjab' as const, crop_type: 'Wheat' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111103', operator_id: '22222222-2222-2222-2222-222222222202', flight_hours: 4.0, duration_minutes: 280, delay_minutes: 25, retry_count: 1, idle_time_minutes: 35, area_covered_acres: 150.0, revenue_pkr: 240000 },
  { id: '44444444-4444-4444-4444-444444444417', code: 'MSN-2026-017', title: 'Wheat Micronutrient Mist - Gujranwala South', date: '2026-07-13', location: 'Lahore', province: 'Punjab' as const, crop_type: 'Wheat' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111103', operator_id: '22222222-2222-2222-2222-222222222202', flight_hours: 3.8, duration_minutes: 265, delay_minutes: 20, retry_count: 0, idle_time_minutes: 30, area_covered_acres: 140.0, revenue_pkr: 225000 },
  { id: '44444444-4444-4444-4444-444444444418', code: 'MSN-2026-018', title: 'Wheat Aphid Control - Faisalabad Agri Sector', date: '2026-07-15', location: 'Faisalabad', province: 'Punjab' as const, crop_type: 'Wheat' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111101', operator_id: '22222222-2222-2222-2222-222222222207', flight_hours: 4.5, duration_minutes: 360, delay_minutes: 60, retry_count: 3, idle_time_minutes: 65, area_covered_acres: 165.0, revenue_pkr: 260000 },
  { id: '44444444-4444-4444-4444-444444444419', code: 'MSN-2026-019', title: 'Wheat Canopy Feed - Jhang Road Sector', date: '2026-07-12', location: 'Faisalabad', province: 'Punjab' as const, crop_type: 'Wheat' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111102', operator_id: '22222222-2222-2222-2222-222222222208', flight_hours: 4.2, duration_minutes: 330, delay_minutes: 50, retry_count: 3, idle_time_minutes: 55, area_covered_acres: 155.0, revenue_pkr: 245000 },
  { id: '44444444-4444-4444-4444-444444444420', code: 'MSN-2026-020', title: 'Wheat Late Season Guard - Toba Tek Singh', date: '2026-07-11', location: 'Faisalabad', province: 'Punjab' as const, crop_type: 'Wheat' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111101', operator_id: '22222222-2222-2222-2222-222222222201', flight_hours: 5.0, duration_minutes: 345, delay_minutes: 10, retry_count: 0, idle_time_minutes: 25, area_covered_acres: 185.0, revenue_pkr: 295000 },
  { id: '44444444-4444-4444-4444-444444444421', code: 'MSN-2026-021', title: 'Cotton Early Pest Guard - Sadiqabad Farms', date: '2026-07-15', location: 'Rahim Yar Khan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111103', operator_id: '22222222-2222-2222-2222-222222222203', flight_hours: 4.6, duration_minutes: 315, delay_minutes: 10, retry_count: 0, idle_time_minutes: 20, area_covered_acres: 175.0, revenue_pkr: 315000 },
  { id: '44444444-4444-4444-4444-444444444422', code: 'MSN-2026-022', title: 'Sugarcane Root Stimulator - Liaquatpur Block', date: '2026-07-14', location: 'Rahim Yar Khan', province: 'Punjab' as const, crop_type: 'Sugarcane' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111104', operator_id: '22222222-2222-2222-2222-222222222203', flight_hours: 5.2, duration_minutes: 390, delay_minutes: 40, retry_count: 2, idle_time_minutes: 50, area_covered_acres: 180.0, revenue_pkr: 285000 },
  { id: '44444444-4444-4444-4444-444444444423', code: 'MSN-2026-023', title: 'Cotton Whitefly Eradication - Bahawalpur Sector', date: '2026-07-13', location: 'Multan', province: 'Punjab' as const, crop_type: 'Cotton' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111101', operator_id: '22222222-2222-2222-2222-222222222201', flight_hours: 5.5, duration_minutes: 370, delay_minutes: 0, retry_count: 0, idle_time_minutes: 15, area_covered_acres: 210.0, revenue_pkr: 375000 },
  { id: '44444444-4444-4444-4444-444444444424', code: 'MSN-2026-024', title: 'Rice Leaf Folder Defense - Shikarpur Belt', date: '2026-07-12', location: 'Sukkur', province: 'Sindh' as const, crop_type: 'Rice' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111105', operator_id: '22222222-2222-2222-2222-222222222204', flight_hours: 4.4, duration_minutes: 350, delay_minutes: 50, retry_count: 2, idle_time_minutes: 60, area_covered_acres: 155.0, revenue_pkr: 250000 },
  { id: '44444444-4444-4444-4444-444444444425', code: 'MSN-2026-025', title: 'Wheat Harvest Booster - Okara Agricultural Hub', date: '2026-07-11', location: 'Lahore', province: 'Punjab' as const, crop_type: 'Wheat' as const, status: 'completed' as const, drone_id: '11111111-1111-1111-1111-111111111102', operator_id: '22222222-2222-2222-2222-222222222202', flight_hours: 4.0, duration_minutes: 270, delay_minutes: 15, retry_count: 0, idle_time_minutes: 20, area_covered_acres: 145.0, revenue_pkr: 235000 }
];

export const mockMaintenanceLogs: MaintenanceLog[] = [
  { id: 'm1', drone_id: '11111111-1111-1111-1111-111111111104', date: '2026-07-08', cost_pkr: 185000, hours_down: 48.0, description: 'Falcon-X pump manifold replacement & ESC cooling fan repair', drone: mockDrones[3] },
  { id: 'm2', drone_id: '11111111-1111-1111-1111-111111111104', date: '2026-06-25', cost_pkr: 120000, hours_down: 36.0, description: 'Nozzle arm calibration failure and rotor bearing replacement', drone: mockDrones[3] },
  { id: 'm3', drone_id: '11111111-1111-1111-1111-111111111105', date: '2026-07-02', cost_pkr: 140000, hours_down: 32.0, description: 'Battery docking port overheating & telemetry transmitter swap', drone: mockDrones[4] },
  { id: 'm4', drone_id: '11111111-1111-1111-1111-111111111101', date: '2026-06-30', cost_pkr: 35000, hours_down: 8.0, description: 'Routine Agras T40 nozzle cleaning and firmware diagnostic check', drone: mockDrones[0] }
];

// Assemble fully populated missions with joined relations and pre-computed deterministic scores
export const mockMissions: Mission[] = rawMissionsData.map(m => {
  const drone = mockDrones.find(d => d.id === m.drone_id);
  const operator = mockOperators.find(o => o.id === m.operator_id);
  const costs = getDefaultCosts(m.id, m.revenue_pkr, m.retry_count, m.crop_type, m.location);
  const scoringRes = computeMissionProfitabilityScore(m, costs);

  return {
    ...m,
    drone,
    operator,
    costs,
    profitability_score: {
      id: `score-${m.id}`,
      mission_id: m.id,
      score: scoringRes.score,
      band: scoringRes.band,
      reasons: scoringRes.reasons,
      recommendations: scoringRes.recommendations,
      computed_at: new Date().toISOString()
    }
  };
});
