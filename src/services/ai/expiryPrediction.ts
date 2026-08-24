import { BloodBank, BloodUnit, BloodRequest, RiskLevel } from '../../types';
import { ExpiryPredictionResult } from './types';

export function calculateExpiryPrediction(
  unit: BloodUnit,
  bloodBank: BloodBank,
  activeRequests: BloodRequest[]
): ExpiryPredictionResult {
  const today = new Date('2026-08-24T00:00:00'); // Baseline date
  const expiry = new Date(unit.expiry_date);
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Check matching local active requests
  const localMatchingRequests = activeRequests.filter(
    r => r.blood_group === unit.blood_group && r.component_type === unit.component_type && r.status === 'Pending'
  );
  const totalLocalDemandUnits = localMatchingRequests.reduce((sum, r) => sum + r.quantity, 0);

  // Typical maximum shelf life by component
  const maxShelfLifeDays: Record<string, number> = {
    Platelets: 5,
    'Whole Blood': 35,
    RBC: 42,
    Plasma: 365
  };
  const standardLife = maxShelfLifeDays[unit.component_type] || 35;

  let riskLevel: RiskLevel = 'Low';
  let riskScore = 0.2;
  let estimatedUsageBeforeExpiry = Math.min(1, totalLocalDemandUnits);

  // Expiry risk rules
  if (unit.status !== 'Available') {
    // If unit is already Reserved, Transferred or Expired, risk is low/handled
    riskLevel = 'Low';
    riskScore = 0.1;
  } else if (daysRemaining <= 0) {
    riskLevel = 'High';
    riskScore = 1.0;
  } else if (unit.component_type === 'Platelets') {
    // Platelets are extremely fragile (5 days total life)
    if (daysRemaining <= 2) {
      riskLevel = 'High';
      riskScore = 0.92;
    } else if (daysRemaining <= 3) {
      riskLevel = 'Medium';
      riskScore = 0.65;
    } else {
      riskLevel = 'Low';
      riskScore = 0.25;
    }
  } else if (unit.component_type === 'RBC' || unit.component_type === 'Whole Blood') {
    if (daysRemaining <= 5 && totalLocalDemandUnits === 0) {
      riskLevel = 'High';
      riskScore = 0.85;
    } else if (daysRemaining <= 10) {
      riskLevel = 'Medium';
      riskScore = 0.58;
    } else {
      riskLevel = 'Low';
      riskScore = 0.15;
    }
  } else if (unit.component_type === 'Plasma') {
    if (daysRemaining <= 15) {
      riskLevel = 'Medium';
      riskScore = 0.5;
    } else {
      riskLevel = 'Low';
      riskScore = 0.1;
    }
  }

  // AI confidence
  const confidenceScore = Math.min(96, Math.max(85, Math.round(90 + (5 - Math.min(5, daysRemaining)))));

  // Explainable reason
  let reason = '';
  if (daysRemaining <= 0) {
    reason = `Unit is past expiry date (${unit.expiry_date}). Must be quarantined immediately.`;
  } else if (riskLevel === 'High') {
    reason = `High Expiry Risk: Unit has only ${daysRemaining} day(s) of shelf life remaining (Expires: ${unit.expiry_date}). Local demand is insufficient to prevent 100% loss.`;
  } else if (riskLevel === 'Medium') {
    reason = `Moderate Expiry Horizon: ${daysRemaining} days remaining for ${unit.component_type}. Monitored for potential redistribution if unconsumed in next 48h.`;
  } else {
    reason = `Safe Shelf Life: ${daysRemaining} days remaining (${Math.round((daysRemaining / standardLife) * 100)}% of shelf life active).`;
  }

  return {
    bloodUnitId: unit.id,
    bloodBankId: bloodBank.id,
    bloodBankName: bloodBank.name,
    bloodGroup: unit.blood_group,
    componentType: unit.component_type,
    expiryDate: unit.expiry_date,
    daysRemaining,
    estimatedUsageBeforeExpiry,
    riskScore,
    riskLevel,
    confidenceScore,
    reason
  };
}

export function generateAllExpiryPredictions(
  units: BloodUnit[],
  bloodBanks: BloodBank[],
  activeRequests: BloodRequest[]
): ExpiryPredictionResult[] {
  const bankMap = bloodBanks.reduce<Record<string, BloodBank>>((acc, b) => {
    acc[b.id] = b;
    return acc;
  }, {});

  return units
    .filter(u => u.status === 'Available')
    .map(unit => {
      const bank = bankMap[unit.blood_bank_id] || {
        id: unit.blood_bank_id,
        name: 'Blood Bank',
        location: '',
        city: '',
        state: '',
        latitude: 0,
        longitude: 0,
        contact: '',
        linked_admin_id: ''
      };
      return calculateExpiryPrediction(unit, bank, activeRequests);
    });
}
