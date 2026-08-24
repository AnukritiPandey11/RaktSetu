import {
  dbBloodBanks,
  dbBloodUnits,
  dbRequests,
  dbHospitals,
  dbPredictions,
  dbRedistributions,
  dbNotifications
} from '../db';
import { Prediction, RedistributionSuggestion } from '../../types';
import { AIPipelineResult } from './types';
import { generateAllDemandForecasts } from './demandForecast';
import { generateAllShortagePredictions } from './shortagePrediction';
import { generateAllExpiryPredictions } from './expiryPrediction';
import { generateRedistributionRecommendations } from './redistributionEngine';

/**
 * Central AI Orchestration Pipeline
 * Executes: Demand Forecasting -> Shortage Prediction -> Expiry Prediction -> Smart Redistribution
 */
export function runAIAnalysis(): AIPipelineResult {
  const bloodBanks = dbBloodBanks.getAll();
  const units = dbBloodUnits.getAll();
  const activeRequests = dbRequests.getAll();
  const hospitals = dbHospitals.getAll();

  // 1. Demand Forecasting
  const demandForecasts = generateAllDemandForecasts(bloodBanks, activeRequests, hospitals);

  // 2. Shortage Prediction
  const shortagePredictions = generateAllShortagePredictions(
    bloodBanks,
    units,
    demandForecasts,
    activeRequests
  );

  // 3. Expiry / Wastage Prediction
  const expiryPredictions = generateAllExpiryPredictions(units, bloodBanks, activeRequests);

  // 4. Smart Redistribution Engine
  const redistributionRecommendations = generateRedistributionRecommendations(
    units,
    bloodBanks,
    shortagePredictions,
    expiryPredictions,
    activeRequests
  );

  // Synchronize predictions into database format
  const formattedPredictions: Prediction[] = [];

  // Add Shortage predictions (Top risk alerts)
  shortagePredictions
    .filter(s => s.riskLevel === 'High' || s.riskLevel === 'Medium')
    .forEach(s => {
      formattedPredictions.push({
        id: `pred-short-${s.bloodBankId}-${s.bloodGroup}`,
        blood_bank_id: s.bloodBankId,
        blood_group: s.bloodGroup,
        prediction_type: 'Shortage',
        predicted_value: `Projected deficit of ${s.predictedShortage} units (Coverage: ${(s.coverageRatio * 100).toFixed(0)}%)`,
        confidence_score: s.confidenceScore,
        risk_level: s.riskLevel,
        summary: s.reason,
        target_date: s.targetDate,
        created_at: new Date().toISOString()
      });
    });

  // Add Expiry predictions (Units approaching expiry)
  expiryPredictions
    .filter(e => e.riskLevel === 'High' || e.riskLevel === 'Medium')
    .slice(0, 8)
    .forEach(e => {
      formattedPredictions.push({
        id: `pred-exp-${e.bloodUnitId}`,
        blood_bank_id: e.bloodBankId,
        blood_group: e.bloodGroup,
        prediction_type: 'Expiry',
        predicted_value: `${e.componentType} (${e.bloodUnitId}) expiring in ${e.daysRemaining} days`,
        confidence_score: e.confidenceScore,
        risk_level: e.riskLevel,
        summary: e.reason,
        target_date: e.expiryDate,
        created_at: new Date().toISOString()
      });
    });

  // Add Demand forecast summary highlights
  demandForecasts
    .filter(d => d.total7DayDemand >= 15)
    .slice(0, 4)
    .forEach(d => {
      formattedPredictions.push({
        id: `pred-dem-${d.bloodBankId}-${d.bloodGroup}`,
        blood_bank_id: d.bloodBankId,
        blood_group: d.bloodGroup,
        prediction_type: 'Demand',
        predicted_value: `7-Day demand forecast: ${d.total7DayDemand} units (Avg: ${d.historicalAvgDaily}/day)`,
        confidence_score: d.confidenceScore,
        risk_level: 'Medium',
        summary: d.reason,
        target_date: d.dailyForecast[6]?.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      });
    });

  // Update DB predictions
  if (formattedPredictions.length > 0) {
    dbPredictions.setAll(formattedPredictions);
  }

  // Synchronize redistribution suggestions while strictly preserving human actions
  const existingSuggestions = dbRedistributions.getAll();
  const existingMap = new Map<string, RedistributionSuggestion>();
  existingSuggestions.forEach(s => {
    const key = `${s.source_bank_id}-${s.destination_bank_id}-${s.blood_unit_id}`;
    existingMap.set(key, s);
  });

  const mergedSuggestions: RedistributionSuggestion[] = [...existingSuggestions];

  redistributionRecommendations.forEach(rec => {
    const key = `${rec.sourceBankId}-${rec.destinationBankId}-${rec.bloodUnitId}`;
    if (!existingMap.has(key)) {
      const newSuggestion: RedistributionSuggestion = {
        id: `sug-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        source_bank_id: rec.sourceBankId,
        destination_bank_id: rec.destinationBankId,
        blood_unit_id: rec.bloodUnitId,
        blood_group: rec.bloodGroup,
        component_type: rec.componentType,
        quantity: rec.quantity,
        reason: rec.reason,
        status: 'Pending', // ALWAYS Pending
        created_at: new Date().toISOString(),
        estimated_distance_km: rec.distanceKm,
        potential_wastage_hours_saved: rec.potentialWastageHoursSaved
      };
      mergedSuggestions.unshift(newSuggestion);
      existingMap.set(key, newSuggestion);
    }
  });

  dbRedistributions.setAll(mergedSuggestions);

  return {
    timestamp: new Date().toISOString(),
    demandForecasts,
    shortagePredictions,
    expiryPredictions,
    redistributionRecommendations
  };
}
