export type AppRole = 'admin' | 'finance' | 'operations';
export type DroneStatus = 'active' | 'maintenance' | 'grounded';
export type MissionStatus = 'completed' | 'in_progress' | 'aborted';
export type ProvinceType = 'Punjab' | 'Sindh' | 'KPK' | 'Balochistan';
export type CropType = 'Cotton' | 'Wheat' | 'Rice' | 'Sugarcane';
export type PaymentStatus = 'received' | 'pending' | 'overdue';
export type CostCategory = 'travel' | 'battery_wear' | 'chemical_loading' | 'operator_labor' | 'maintenance_reserve' | 'retry_fuel';
export type ScoreBand = 'excellent' | 'good' | 'average' | 'poor' | 'critical';

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  created_at: string;
}

export interface Drone {
  id: string;
  serial_number: string;
  model: string;
  status: DroneStatus;
  total_flight_hours: number;
  maintenance_burden_hours: number;
  hourly_depreciation_cost_pkr: number;
  created_at?: string;
}

export interface Operator {
  id: string;
  full_name: string;
  cnic: string;
  location: string;
  province: ProvinceType;
  experience_years: number;
  hourly_rate_pkr: number;
  total_missions: number;
  retry_rate_percentage: number;
  created_at?: string;
}

export interface MissionCost {
  id: string;
  mission_id: string;
  category: CostCategory;
  amount_pkr: number;
  notes?: string;
}

export interface MissionPayment {
  id: string;
  mission_id: string;
  amount_pkr: number;
  status: PaymentStatus;
  paid_at?: string;
}

export interface ProfitabilityScoreRecord {
  id: string;
  mission_id: string;
  score: number;
  band: ScoreBand;
  reasons: string[];
  recommendations: string[];
  computed_at?: string;
}

export interface Mission {
  id: string;
  code: string;
  title: string;
  date: string;
  location: string;
  province: ProvinceType;
  crop_type: CropType;
  status: MissionStatus;
  drone_id: string;
  operator_id: string;
  flight_hours: number;
  duration_minutes: number;
  delay_minutes: number;
  retry_count: number;
  idle_time_minutes: number;
  area_covered_acres: number;
  revenue_pkr: number;
  created_at?: string;
  // Joined relations
  drone?: Drone;
  operator?: Operator;
  costs?: MissionCost[];
  payments?: MissionPayment[];
  profitability_score?: ProfitabilityScoreRecord;
}

export interface MaintenanceLog {
  id: string;
  drone_id: string;
  date: string;
  cost_pkr: number;
  hours_down: number;
  description: string;
  drone?: Drone;
}

export interface ScoringRule {
  id: string;
  name: string;
  weight: number;
  threshold_good: number;
  threshold_poor: number;
  description: string;
}
