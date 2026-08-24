export type UserRole = 'admin' | 'blood_bank' | 'hospital' | 'donor';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type ComponentType = 'Whole Blood' | 'Plasma' | 'Platelets' | 'RBC';

export type UnitStatus = 'Available' | 'Reserved' | 'Transferred' | 'Expired';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type RequestStatus = 'Pending' | 'Approved' | 'In Transit' | 'Fulfilled' | 'Cancelled';

export type PredictionType = 'Demand' | 'Shortage' | 'Expiry';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type SuggestionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password_hash: string;
  location: string;
  contact: string;
  entity_id?: string; // Links to blood_bank_id or hospital_id if applicable
  blood_group?: BloodGroup; // Specific to donors
  last_donation_date?: string; // Specific to donors
  available_for_donation?: boolean;
}

export interface BloodBank {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  contact: string;
  linked_admin_id: string;
  storage_capacity_units?: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  contact: string;
  emergency_level: 'Level 1 Trauma' | 'General' | 'Specialty' | 'Super Specialty';
}

export interface BloodUnit {
  id: string;
  blood_bank_id: string;
  blood_group: BloodGroup;
  component_type: ComponentType;
  collection_date: string;
  expiry_date: string;
  status: UnitStatus;
  volume_ml?: number;
  donor_id?: string;
  bag_barcode?: string;
}

export interface BloodRequest {
  id: string;
  hospital_id: string;
  blood_group: BloodGroup;
  component_type: ComponentType;
  quantity: number;
  urgency_level: UrgencyLevel;
  status: RequestStatus;
  patient_case?: string;
  created_at: string;
  fulfilled_by_bank_id?: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  blood_bank_id: string;
  blood_group: BloodGroup;
  donation_date: string;
  units_donated: number;
  component_type?: ComponentType;
  hemoglobin_level?: string;
  certificate_id?: string;
}

export interface Prediction {
  id: string;
  blood_bank_id: string;
  blood_group?: BloodGroup;
  prediction_type: PredictionType;
  predicted_value: number | string;
  confidence_score: number; // 0 to 100%
  target_date: string;
  created_at: string;
  risk_level?: RiskLevel;
  summary?: string;
}

export interface RedistributionSuggestion {
  id: string;
  source_bank_id: string;
  destination_bank_id: string;
  blood_unit_id: string;
  blood_group: BloodGroup;
  component_type: ComponentType;
  quantity: number;
  reason: string;
  status: SuggestionStatus;
  created_at: string;
  estimated_distance_km?: number;
  potential_wastage_hours_saved?: number;
}

export interface FeedbackLog {
  id: string;
  suggestion_id?: string;
  prediction_id?: string;
  outcome: 'Approved' | 'Rejected' | 'Ignored' | 'Modified' | string;
  reviewer_role: UserRole;
  reviewer_name: string;
  logged_at: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  target_role?: UserRole | 'all';
  target_user_id?: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  link_tab?: string;
}
