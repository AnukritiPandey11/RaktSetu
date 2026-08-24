import { BloodBank, BloodGroup, BloodRequest, Hospital } from '../../types';
import { DayForecast, DemandForecastResult } from './types';

// Baseline Indian population blood group demand distribution (units/day base)
const BASE_DAILY_DEMAND: Record<BloodGroup, number> = {
  'O+': 2.8,
  'B+': 2.4,
  'A+': 1.8,
  'AB+': 0.9,
  'O-': 1.2,
  'A-': 0.7,
  'B-': 0.8,
  'AB-': 0.4
};

// Facility capacity & trauma intake scale factor
const FACILITY_SCALE: Record<string, number> = {
  'bb-1': 1.4, // AIIMS Central Blood Bank (Major Trauma Node)
  'bb-2': 1.1, // Lions Mumbai
  'bb-3': 1.3, // Rotary TTK Bengaluru
  'bb-4': 1.2  // Apollo Chennai
};

// Day-of-week variance pattern (Mon-Sun trauma and elective surgery cyclical pattern)
const DAY_WEIGHTS = [1.15, 1.10, 0.95, 1.05, 1.20, 0.85, 0.90];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function calculateDemandForecast(
  bloodBank: BloodBank,
  bloodGroup: BloodGroup,
  activeRequests: BloodRequest[],
  allHospitals: Hospital[]
): DemandForecastResult {
  const baseRate = BASE_DAILY_DEMAND[bloodGroup] || 1.5;
  const facilityScale = FACILITY_SCALE[bloodBank.id] || 1.0;

  // Filter requests matching this blood group
  const matchingRequests = activeRequests.filter(
    r => r.blood_group === bloodGroup && (r.status === 'Pending' || r.status === 'In Transit')
  );

  // Compute active urgency multiplier
  let urgencyPressureUnits = 0;
  matchingRequests.forEach(r => {
    switch (r.urgency_level) {
      case 'Critical':
        urgencyPressureUnits += r.quantity * 1.5;
        break;
      case 'High':
        urgencyPressureUnits += r.quantity * 1.2;
        break;
      case 'Medium':
        urgencyPressureUnits += r.quantity * 1.0;
        break;
      case 'Low':
        urgencyPressureUnits += r.quantity * 0.7;
        break;
    }
  });

  const baseDaily = baseRate * facilityScale;
  const requestImpactDaily = urgencyPressureUnits / 7;
  const effectiveDailyRate = baseDaily + requestImpactDaily;

  // Generate 7-day discrete forecast
  const baseDate = new Date('2026-08-24T00:00:00'); // Consistent reference date
  const dailyForecast: DayForecast[] = [];
  let total7DayDemand = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + i);
    const dayWeight = DAY_WEIGHTS[i % DAY_WEIGHTS.length];
    
    // Deterministic rounded projected demand
    const dayDemand = Math.max(1, Math.round(effectiveDailyRate * dayWeight));
    total7DayDemand += dayDemand;

    dailyForecast.push({
      dayIndex: i + 1,
      date: dayDate.toISOString().split('T')[0],
      dayName: DAY_NAMES[dayDate.getDay()],
      predictedDemand: dayDemand
    });
  }

  // Calculate confidence score (higher if historical baseline is well-sampled)
  const confidenceScore = Math.min(96, Math.max(82, Math.round(88 + (matchingRequests.length * 2) - (facilityScale * 2))));

  // Explainability string
  let reason = `Projected ${total7DayDemand} units needed over 7 days based on baseline draw (${baseDaily.toFixed(1)}/day)`;
  if (matchingRequests.length > 0) {
    reason += ` plus ${matchingRequests.length} active hospital emergency requisitions.`;
  } else {
    reason += ` with standard seasonal regional surgery load.`;
  }

  return {
    bloodBankId: bloodBank.id,
    bloodBankName: bloodBank.name,
    bloodGroup,
    dailyForecast,
    total7DayDemand,
    historicalAvgDaily: Number(baseDaily.toFixed(1)),
    activeRequestsCount: matchingRequests.length,
    confidenceScore,
    reason
  };
}

export function generateAllDemandForecasts(
  bloodBanks: BloodBank[],
  activeRequests: BloodRequest[],
  allHospitals: Hospital[]
): DemandForecastResult[] {
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const results: DemandForecastResult[] = [];

  bloodBanks.forEach(bank => {
    bloodGroups.forEach(group => {
      results.push(calculateDemandForecast(bank, group, activeRequests, allHospitals));
    });
  });

  return results;
}
