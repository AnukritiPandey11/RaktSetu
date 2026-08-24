import { BloodBank, BloodGroup, BloodUnit, BloodRequest, RiskLevel } from '../../types';
import { DemandForecastResult, ShortagePredictionResult } from './types';

export function calculateShortagePrediction(
  bloodBank: BloodBank,
  bloodGroup: BloodGroup,
  units: BloodUnit[],
  demandForecast: DemandForecastResult,
  activeRequests: BloodRequest[]
): ShortagePredictionResult {
  // Current available units for this bank and blood group
  const matchingUnits = units.filter(
    u => u.blood_bank_id === bloodBank.id && u.blood_group === bloodGroup && u.status === 'Available'
  );
  const currentStock = matchingUnits.length;

  const predictedDemand7Days = demandForecast.total7DayDemand;
  const coverageRatio = Number((currentStock / Math.max(1, predictedDemand7Days)).toFixed(2));
  const predictedShortage = Math.max(0, predictedDemand7Days - currentStock);

  // Check for critical active requests
  const bankRequests = activeRequests.filter(
    r => r.blood_group === bloodGroup && (r.status === 'Pending' || r.status === 'In Transit')
  );
  const hasCriticalRequest = bankRequests.some(r => r.urgency_level === 'Critical');

  // Risk Classification
  let riskLevel: RiskLevel = 'Low';
  let riskScore = 0.2;

  if (coverageRatio < 0.55 || (hasCriticalRequest && currentStock < 4) || (predictedShortage >= 8)) {
    riskLevel = 'High';
    riskScore = Math.min(0.98, Number((0.75 + (1 - coverageRatio) * 0.25).toFixed(2)));
  } else if (coverageRatio < 1.0 || predictedShortage > 0) {
    riskLevel = 'Medium';
    riskScore = Math.min(0.74, Number((0.45 + (1 - coverageRatio) * 0.25).toFixed(2)));
  } else {
    riskLevel = 'Low';
    riskScore = Math.max(0.1, Number((0.3 - (coverageRatio - 1) * 0.1).toFixed(2)));
  }

  // Confidence calculation
  const confidenceScore = Math.min(95, Math.max(84, Math.round(88 + (matchingUnits.length > 0 ? 3 : 0) + (bankRequests.length * 2))));

  // Explainability string
  let reason = '';
  if (riskLevel === 'High') {
    reason = `Critical Shortage: Predicted demand of ${predictedDemand7Days} units exceeds available stock of ${currentStock} units (Coverage: ${(coverageRatio * 100).toFixed(0)}%).`;
    if (hasCriticalRequest) reason += ' Unfulfilled critical ICU requests pending.';
  } else if (riskLevel === 'Medium') {
    reason = `Moderate Deficit: Stock covers ${(coverageRatio * 100).toFixed(0)}% of 7-day demand (${currentStock}/${predictedDemand7Days} units). Replenishment advised.`;
  } else {
    reason = `Adequate Buffer: Current stock (${currentStock} units) satisfies projected demand (${predictedDemand7Days} units) with ${(coverageRatio * 100).toFixed(0)}% coverage.`;
  }

  // Target target date: 3 days ahead for critical alert horizon
  const targetDate = new Date('2026-08-27T00:00:00').toISOString().split('T')[0];

  return {
    bloodBankId: bloodBank.id,
    bloodBankName: bloodBank.name,
    bloodGroup,
    currentStock,
    predictedDemand7Days,
    coverageRatio,
    predictedShortage,
    riskScore,
    riskLevel,
    confidenceScore,
    hasCriticalRequest,
    targetDate,
    reason
  };
}

export function generateAllShortagePredictions(
  bloodBanks: BloodBank[],
  units: BloodUnit[],
  demandForecasts: DemandForecastResult[],
  activeRequests: BloodRequest[]
): ShortagePredictionResult[] {
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const results: ShortagePredictionResult[] = [];

  bloodBanks.forEach(bank => {
    bloodGroups.forEach(group => {
      const forecast = demandForecasts.find(
        f => f.bloodBankId === bank.id && f.bloodGroup === group
      );
      if (forecast) {
        results.push(calculateShortagePrediction(bank, group, units, forecast, activeRequests));
      }
    });
  });

  return results;
}
