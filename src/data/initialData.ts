import {
  User,
  BloodBank,
  Hospital,
  BloodUnit,
  BloodRequest,
  Donation,
  Prediction,
  RedistributionSuggestion,
  FeedbackLog,
  AppNotification
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Rajesh Verma',
    role: 'admin',
    email: 'admin@raktsetu.gov.in',
    password_hash: 'demo123',
    location: 'New Delhi, Delhi NCR',
    contact: '+91 98110 24890'
  },
  {
    id: 'usr-bb-1',
    name: 'Dr. Ananya Sharma',
    role: 'blood_bank',
    email: 'aiims.bloodbank@delhi.gov.in',
    password_hash: 'demo123',
    location: 'Ansari Nagar, New Delhi',
    contact: '+91 11 2658 8500',
    entity_id: 'bb-1'
  },
  {
    id: 'usr-bb-2',
    name: 'Dr. Farhan Qureshi',
    role: 'blood_bank',
    email: 'lions.bloodbank@mumbai.org',
    password_hash: 'demo123',
    location: 'Bandra West, Mumbai',
    contact: '+91 22 2640 1234',
    entity_id: 'bb-2'
  },
  {
    id: 'usr-hosp-1',
    name: 'Dr. Sunita Deshmukh',
    role: 'hospital',
    email: 'transfusion@safdarjung.gov.in',
    password_hash: 'demo123',
    location: 'Safdarjung Hospital, New Delhi',
    contact: '+91 11 2616 5060',
    entity_id: 'hosp-1'
  },
  {
    id: 'usr-hosp-2',
    name: 'Dr. Kevin D\'Souza',
    role: 'hospital',
    email: 'emergency@kem.edu.in',
    password_hash: 'demo123',
    location: 'KEM Hospital, Parel, Mumbai',
    contact: '+91 22 2410 7000',
    entity_id: 'hosp-2'
  },
  {
    id: 'usr-donor-1',
    name: 'Rahul Sharma',
    role: 'donor',
    email: 'rahul.sharma@example.com',
    password_hash: 'demo123',
    location: 'South Extension, New Delhi',
    contact: '+91 98765 43210',
    blood_group: 'O+',
    last_donation_date: '2026-05-10',
    available_for_donation: true
  },
  {
    id: 'usr-donor-2',
    name: 'Pooja Iyer',
    role: 'donor',
    email: 'pooja.iyer@example.com',
    password_hash: 'demo123',
    location: 'Indiranagar, Bengaluru',
    contact: '+91 99887 76655',
    blood_group: 'AB-',
    last_donation_date: '2026-02-14',
    available_for_donation: true
  }
];

export const INITIAL_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'bb-1',
    name: 'AIIMS Central Blood Bank & Component Lab',
    location: 'Ansari Nagar, Sri Aurobindo Marg',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.5672,
    longitude: 77.2100,
    contact: '+91 11 2658 8500',
    linked_admin_id: 'usr-admin-1',
    storage_capacity_units: 2500
  },
  {
    id: 'bb-2',
    name: 'Lions Club Blood Bank & Research Centre',
    location: 'Bandra West, Hill Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0596,
    longitude: 72.8295,
    contact: '+91 22 2640 1234',
    linked_admin_id: 'usr-admin-1',
    storage_capacity_units: 1800
  },
  {
    id: 'bb-3',
    name: 'Rotary TTK Blood Centre',
    location: 'New Thippasandra, HAL 3rd Stage',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.6412,
    contact: '+91 80 2528 7903',
    linked_admin_id: 'usr-admin-1',
    storage_capacity_units: 3000
  },
  {
    id: 'bb-4',
    name: 'Apollo Hospital Regional Blood Centre',
    location: 'Greams Road, Thousand Lights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0604,
    longitude: 80.2496,
    contact: '+91 44 2829 0200',
    linked_admin_id: 'usr-admin-1',
    storage_capacity_units: 2100
  },
  {
    id: 'bb-5',
    name: 'Safdarjung Transfusion Medicine Centre',
    location: 'Ring Road, Opposite AIIMS',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.5685,
    longitude: 77.2075,
    contact: '+91 11 2616 5060',
    linked_admin_id: 'usr-admin-1',
    storage_capacity_units: 1600
  },
  {
    id: 'bb-6',
    name: 'KEM Hospital Blood Centre',
    location: 'Acharya Donde Marg, Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0022,
    longitude: 72.8423,
    contact: '+91 22 2410 7000',
    linked_admin_id: 'usr-admin-1',
    storage_capacity_units: 1750
  }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Safdarjung Super-Specialty Hospital',
    location: 'Ring Road, Opposite AIIMS',
    city: 'New Delhi',
    contact: '+91 11 2616 5060',
    emergency_level: 'Level 1 Trauma'
  },
  {
    id: 'hosp-2',
    name: 'King Edward Memorial (KEM) Hospital',
    location: 'Acharya Donde Marg, Parel',
    city: 'Mumbai',
    contact: '+91 22 2410 7000',
    emergency_level: 'Level 1 Trauma'
  },
  {
    id: 'hosp-3',
    name: 'Manipal Hospital HAL',
    location: '98 Old Airport Road',
    city: 'Bengaluru',
    contact: '+91 80 2502 4444',
    emergency_level: 'Super Specialty'
  },
  {
    id: 'hosp-4',
    name: 'Fortis Malar Hospital',
    location: 'Gandhi Nagar, Adyar',
    city: 'Chennai',
    contact: '+91 44 4289 2222',
    emergency_level: 'Specialty'
  }
];

export const INITIAL_BLOOD_UNITS: BloodUnit[] = [
  // AIIMS Blood Bank Units (Delhi)
  {
    id: 'unit-del-01',
    blood_bank_id: 'bb-1',
    blood_group: 'A+',
    component_type: 'Platelets',
    collection_date: '2026-08-21',
    expiry_date: '2026-08-26', // Near expiry (approx 2 days remaining)
    status: 'Available',
    volume_ml: 250,
    bag_barcode: 'RS-DEL-8901'
  },
  {
    id: 'unit-del-02',
    blood_bank_id: 'bb-1',
    blood_group: 'A+',
    component_type: 'Platelets',
    collection_date: '2026-08-21',
    expiry_date: '2026-08-26', // Near expiry
    status: 'Available',
    volume_ml: 250,
    bag_barcode: 'RS-DEL-8902'
  },
  {
    id: 'unit-del-03',
    blood_bank_id: 'bb-1',
    blood_group: 'O+',
    component_type: 'RBC',
    collection_date: '2026-08-10',
    expiry_date: '2026-09-21',
    status: 'Available',
    volume_ml: 300,
    bag_barcode: 'RS-DEL-9011'
  },
  {
    id: 'unit-del-04',
    blood_bank_id: 'bb-1',
    blood_group: 'O+',
    component_type: 'RBC',
    collection_date: '2026-08-12',
    expiry_date: '2026-09-23',
    status: 'Available',
    volume_ml: 300,
    bag_barcode: 'RS-DEL-9012'
  },
  {
    id: 'unit-del-05',
    blood_bank_id: 'bb-1',
    blood_group: 'O-',
    component_type: 'Whole Blood',
    collection_date: '2026-08-18',
    expiry_date: '2026-09-22',
    status: 'Reserved',
    volume_ml: 450,
    bag_barcode: 'RS-DEL-9105'
  },
  {
    id: 'unit-del-06',
    blood_bank_id: 'bb-1',
    blood_group: 'B+',
    component_type: 'Plasma',
    collection_date: '2026-06-15',
    expiry_date: '2027-06-15',
    status: 'Available',
    volume_ml: 200,
    bag_barcode: 'RS-DEL-9201'
  },
  {
    id: 'unit-del-07',
    blood_bank_id: 'bb-1',
    blood_group: 'AB+',
    component_type: 'Plasma',
    collection_date: '2026-07-01',
    expiry_date: '2027-07-01',
    status: 'Available',
    volume_ml: 220,
    bag_barcode: 'RS-DEL-9304'
  },
  {
    id: 'unit-del-08',
    blood_bank_id: 'bb-1',
    blood_group: 'B-',
    component_type: 'Platelets',
    collection_date: '2026-08-22',
    expiry_date: '2026-08-27',
    status: 'Available',
    volume_ml: 250,
    bag_barcode: 'RS-DEL-9402'
  },

  // Lions Blood Bank Units (Mumbai)
  {
    id: 'unit-mum-01',
    blood_bank_id: 'bb-2',
    blood_group: 'O+',
    component_type: 'Whole Blood',
    collection_date: '2026-08-15',
    expiry_date: '2026-09-19',
    status: 'Available',
    volume_ml: 450,
    bag_barcode: 'RS-MUM-1001'
  },
  {
    id: 'unit-mum-02',
    blood_bank_id: 'bb-2',
    blood_group: 'AB-',
    component_type: 'Platelets',
    collection_date: '2026-08-20',
    expiry_date: '2026-08-25', // 1 day remaining! Risk alert
    status: 'Available',
    volume_ml: 250,
    bag_barcode: 'RS-MUM-1005'
  },
  {
    id: 'unit-mum-03',
    blood_bank_id: 'bb-2',
    blood_group: 'A-',
    component_type: 'RBC',
    collection_date: '2026-08-05',
    expiry_date: '2026-09-16',
    status: 'Available',
    volume_ml: 300,
    bag_barcode: 'RS-MUM-1010'
  },
  {
    id: 'unit-mum-04',
    blood_bank_id: 'bb-2',
    blood_group: 'B+',
    component_type: 'Whole Blood',
    collection_date: '2026-08-14',
    expiry_date: '2026-09-18',
    status: 'Available',
    volume_ml: 450,
    bag_barcode: 'RS-MUM-1012'
  },
  {
    id: 'unit-mum-05',
    blood_bank_id: 'bb-2',
    blood_group: 'O-',
    component_type: 'RBC',
    collection_date: '2026-07-28',
    expiry_date: '2026-09-08',
    status: 'Transferred',
    volume_ml: 300,
    bag_barcode: 'RS-MUM-1088'
  },

  // Rotary TTK Blood Centre (Bengaluru)
  {
    id: 'unit-blr-01',
    blood_bank_id: 'bb-3',
    blood_group: 'B+',
    component_type: 'Platelets',
    collection_date: '2026-08-22',
    expiry_date: '2026-08-27',
    status: 'Available',
    volume_ml: 250,
    bag_barcode: 'RS-BLR-4001'
  },
  {
    id: 'unit-blr-02',
    blood_bank_id: 'bb-3',
    blood_group: 'A+',
    component_type: 'RBC',
    collection_date: '2026-08-11',
    expiry_date: '2026-09-22',
    status: 'Available',
    volume_ml: 300,
    bag_barcode: 'RS-BLR-4002'
  },
  {
    id: 'unit-blr-03',
    blood_bank_id: 'bb-3',
    blood_group: 'O-',
    component_type: 'Whole Blood',
    collection_date: '2026-08-01',
    expiry_date: '2026-09-05',
    status: 'Available',
    volume_ml: 450,
    bag_barcode: 'RS-BLR-4003'
  },

  // Apollo Blood Centre (Chennai)
  {
    id: 'unit-chn-01',
    blood_bank_id: 'bb-4',
    blood_group: 'AB+',
    component_type: 'RBC',
    collection_date: '2026-08-12',
    expiry_date: '2026-09-23',
    status: 'Available',
    volume_ml: 300,
    bag_barcode: 'RS-CHN-7001'
  },
  {
    id: 'unit-chn-02',
    blood_bank_id: 'bb-4',
    blood_group: 'O+',
    component_type: 'Platelets',
    collection_date: '2026-08-21',
    expiry_date: '2026-08-26', // Near expiry
    status: 'Available',
    volume_ml: 250,
    bag_barcode: 'RS-CHN-7002'
  }
];

export const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req-001',
    hospital_id: 'hosp-1',
    blood_group: 'O-',
    component_type: 'Whole Blood',
    quantity: 4,
    urgency_level: 'Critical',
    status: 'Pending',
    patient_case: 'Emergency Multiple Trauma Case - ICU Bed #4',
    created_at: '2026-08-24T10:15:00'
  },
  {
    id: 'req-002',
    hospital_id: 'hosp-1',
    blood_group: 'A+',
    component_type: 'Platelets',
    quantity: 6,
    urgency_level: 'High',
    status: 'Pending',
    patient_case: 'Chemotherapy Thrombocytopenia Oncology Ward - Urgent Platelet Need',
    created_at: '2026-08-24T08:30:00'
  },
  {
    id: 'req-003',
    hospital_id: 'hosp-2',
    blood_group: 'B+',
    component_type: 'RBC',
    quantity: 3,
    urgency_level: 'Medium',
    status: 'Pending',
    patient_case: 'Scheduled Elective Cardiac Bypass Surgery',
    created_at: '2026-08-23T16:45:00'
  },
  {
    id: 'req-004',
    hospital_id: 'hosp-3',
    blood_group: 'AB-',
    component_type: 'Platelets',
    quantity: 2,
    urgency_level: 'Critical',
    status: 'Pending',
    patient_case: 'Dengue Hemorrhagic Fever with platelet drop',
    created_at: '2026-08-24T12:00:00'
  },
  {
    id: 'req-005',
    hospital_id: 'hosp-4',
    blood_group: 'O+',
    component_type: 'Plasma',
    quantity: 5,
    urgency_level: 'Low',
    status: 'Fulfilled',
    patient_case: 'Burn Recovery Unit Replenishment',
    created_at: '2026-08-22T09:00:00',
    fulfilled_by_bank_id: 'bb-4'
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-001',
    donor_id: 'usr-donor-1',
    blood_bank_id: 'bb-1',
    blood_group: 'O+',
    donation_date: '2026-05-10',
    units_donated: 1,
    component_type: 'Whole Blood',
    hemoglobin_level: '14.8 g/dL',
    certificate_id: 'CERT-DEL-2026-8812'
  },
  {
    id: 'don-002',
    donor_id: 'usr-donor-1',
    blood_bank_id: 'bb-1',
    blood_group: 'O+',
    donation_date: '2026-01-15',
    units_donated: 1,
    component_type: 'Whole Blood',
    hemoglobin_level: '15.1 g/dL',
    certificate_id: 'CERT-DEL-2026-1044'
  },
  {
    id: 'don-003',
    donor_id: 'usr-donor-2',
    blood_bank_id: 'bb-3',
    blood_group: 'AB-',
    donation_date: '2026-02-14',
    units_donated: 1,
    component_type: 'Platelets',
    hemoglobin_level: '13.5 g/dL',
    certificate_id: 'CERT-BLR-2026-4431'
  }
];

export const INITIAL_PREDICTIONS: Prediction[] = [
  {
    id: 'pred-001',
    blood_bank_id: 'bb-1',
    blood_group: 'O-',
    prediction_type: 'Shortage',
    predicted_value: 'Deficit of 8 units projected in next 72 hrs',
    confidence_score: 91.4,
    risk_level: 'High',
    summary: 'Spike in trauma emergency admissions correlated with monsoon weekend traffic pattern.',
    target_date: '2026-08-27',
    created_at: '2026-08-24T06:00:00'
  },
  {
    id: 'pred-002',
    blood_bank_id: 'bb-1',
    blood_group: 'A+',
    prediction_type: 'Expiry',
    predicted_value: '2 Platelet units expiring within 48 hrs without current local demand',
    confidence_score: 88.7,
    risk_level: 'High',
    summary: 'Redistribution to nearby Safdarjung Oncology or Lion Mumbai recommended to avoid 100% loss.',
    target_date: '2026-08-26',
    created_at: '2026-08-24T06:00:00'
  },
  {
    id: 'pred-003',
    blood_bank_id: 'bb-2',
    blood_group: 'AB-',
    prediction_type: 'Shortage',
    predicted_value: 'Critical shortage: 0 units available across Metro zone',
    confidence_score: 95.2,
    risk_level: 'High',
    summary: 'Zero donor walk-ins scheduled; 2 pending requests at KEM Hospital.',
    target_date: '2026-08-25',
    created_at: '2026-08-24T06:00:00'
  },
  {
    id: 'pred-004',
    blood_bank_id: 'bb-3',
    blood_group: 'B+',
    prediction_type: 'Demand',
    predicted_value: 'Projected demand: 18 units (normal range 10-12)',
    confidence_score: 82.0,
    risk_level: 'Medium',
    summary: 'Scheduled elective cardiac and orthopedic surgeries at Manipal Cluster.',
    target_date: '2026-08-28',
    created_at: '2026-08-24T06:00:00'
  },
  {
    id: 'pred-005',
    blood_bank_id: 'bb-4',
    blood_group: 'O+',
    prediction_type: 'Expiry',
    predicted_value: '1 unit Platelets expiring in 48 hours',
    confidence_score: 79.5,
    risk_level: 'Medium',
    summary: 'Local hospital demand matched at 60%; prompt transfer advised.',
    target_date: '2026-08-26',
    created_at: '2026-08-24T06:00:00'
  }
];

export const INITIAL_REDISTRIBUTION_SUGGESTIONS: RedistributionSuggestion[] = [
  {
    id: 'sug-001',
    source_bank_id: 'bb-1', // AIIMS Delhi
    destination_bank_id: 'bb-5', // Safdarjung Delhi
    blood_unit_id: 'unit-del-01',
    blood_group: 'A+',
    component_type: 'Platelets',
    quantity: 2,
    reason: 'Proactive Expiry Mitigation: AIIMS Delhi has A+ Platelets (unit-del-01) with 2 days shelf life. Dispatch via intra-metro green corridor (0.8 km, ~15 mins) to Safdarjung Transfusion Centre resolves acute oncology shortfall.',
    status: 'Pending',
    created_at: '2026-08-24T07:30:00',
    estimated_distance_km: 0.8,
    potential_wastage_hours_saved: 44
  },
  {
    id: 'sug-002',
    source_bank_id: 'bb-3', // Rotary Bengaluru
    destination_bank_id: 'bb-4', // Apollo Chennai
    blood_unit_id: 'unit-blr-03',
    blood_group: 'O-',
    component_type: 'Whole Blood',
    quantity: 1,
    reason: 'Surplus safe buffer at Rotary (5 units O-) reallocated via regional cold-chain transit (290 km) to critical deficit at Apollo Chennai ICU.',
    status: 'Pending',
    created_at: '2026-08-24T08:15:00',
    estimated_distance_km: 290.0,
    potential_wastage_hours_saved: 120
  },
  {
    id: 'sug-003',
    source_bank_id: 'bb-2', // Lions Mumbai
    destination_bank_id: 'bb-6', // KEM Blood Centre Mumbai
    blood_unit_id: 'unit-mum-02',
    blood_group: 'AB-',
    component_type: 'Platelets',
    quantity: 1,
    reason: 'Platelet shelf life optimization: Lions Mumbai has AB- Platelets expiring in 2 days. Direct intra-metro transfer (6.5 km, ~20 mins) to KEM Hospital ICU approved.',
    status: 'Approved',
    created_at: '2026-08-23T14:20:00',
    estimated_distance_km: 6.5,
    potential_wastage_hours_saved: 30
  }
];

export const INITIAL_FEEDBACK_LOGS: FeedbackLog[] = [
  {
    id: 'fb-001',
    suggestion_id: 'sug-003',
    outcome: 'Approved',
    reviewer_role: 'admin',
    reviewer_name: 'Dr. Rajesh Verma (National Grid Admin)',
    logged_at: '2026-08-23T15:05:12',
    notes: 'Approved cold-chain air-corridor transfer for AB- Platelets.'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    target_role: 'all',
    title: 'Critical Shortage Warning: O- Negative',
    message: 'National grid buffer for O- has dropped below 15% safety threshold. Conservation protocols active.',
    type: 'alert',
    timestamp: '2026-08-24T08:00:00',
    read: false,
    link_tab: 'alerts'
  },
  {
    id: 'notif-002',
    target_role: 'admin',
    title: 'New Redistribution Suggestion #sug-001',
    message: 'AI suggested transfer of 2 units A+ Platelets from AIIMS Delhi to Lions Mumbai. Requires human approval.',
    type: 'warning',
    timestamp: '2026-08-24T07:31:00',
    read: false,
    link_tab: 'redistribution'
  },
  {
    id: 'notif-003',
    target_role: 'blood_bank',
    title: 'Platelet Expiry Alert (<48 hrs)',
    message: '2 units of A+ Platelets (RS-DEL-8901, RS-DEL-8902) are reaching expiry on 26 Aug.',
    type: 'warning',
    timestamp: '2026-08-24T06:30:00',
    read: false,
    link_tab: 'inventory'
  },
  {
    id: 'notif-004',
    target_role: 'donor',
    title: 'Urgent Blood Need Near You',
    message: 'High demand for O+ and O- blood donors around South Delhi. You are eligible to donate today!',
    type: 'info',
    timestamp: '2026-08-24T09:00:00',
    read: false,
    link_tab: 'urgent'
  }
];
