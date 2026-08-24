import { BloodBank, BloodUnit, BloodRequest, ComponentType } from '../../types';
import {
  ShortagePredictionResult,
  ExpiryPredictionResult,
  RedistributionRecommendation
} from './types';

/**
 * Calculates Great-Circle Distance between two coordinates using the Haversine Formula (km)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) {
    return 15.0; // Default local metro fallback if coordinates missing
  }
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Component Transport & Shelf-Life Feasibility Parameters
 */
interface TransportConstraint {
  maxDistanceKm: number; // Strictest physical transit radius
  averageSpeedKmH: number; // Transport speed including cold chain packaging
  handlingOverheadHours: number; // Time to pack, verify, dispatch and intake
  minClinicalSafetyBufferHours: number; // Minimum remaining hours required AFTER delivery
}

const COMPONENT_TRANSPORT_CONSTRAINTS: Record<ComponentType, TransportConstraint> = {
  // Platelets (5 days total life): strictly local/intra-metro transit (<75 km)
  // Must have at least 24 hours of usable clinical life left for patient transfusion upon arrival
  Platelets: {
    maxDistanceKm: 75,
    averageSpeedKmH: 35,
    handlingOverheadHours: 0.75,
    minClinicalSafetyBufferHours: 24
  },
  // RBC (Packed Red Cells - 42 days life): regional cold chain express
  RBC: {
    maxDistanceKm: 450,
    averageSpeedKmH: 55,
    handlingOverheadHours: 1.5,
    minClinicalSafetyBufferHours: 72
  },
  // Whole Blood (35 days life): regional cold chain transit
  'Whole Blood': {
    maxDistanceKm: 350,
    averageSpeedKmH: 55,
    handlingOverheadHours: 1.5,
    minClinicalSafetyBufferHours: 72
  },
  // Plasma (Fresh Frozen Plasma - 365 days life): frozen dry-ice inter-city transport
  Plasma: {
    maxDistanceKm: 1500,
    averageSpeedKmH: 70,
    handlingOverheadHours: 2.5,
    minClinicalSafetyBufferHours: 168
  }
};

/**
 * Smart Redistribution Recommendation Engine with Strict Shelf-Life & Transit Feasibility
 */
export function generateRedistributionRecommendations(
  units: BloodUnit[],
  bloodBanks: BloodBank[],
  shortagePredictions: ShortagePredictionResult[],
  expiryPredictions: ExpiryPredictionResult[],
  activeRequests: BloodRequest[]
): RedistributionRecommendation[] {
  const bankMap = bloodBanks.reduce<Record<string, BloodBank>>((acc, b) => {
    acc[b.id] = b;
    return acc;
  }, {});

  const recommendations: RedistributionRecommendation[] = [];

  // Filter units with High or Medium expiry risk that are still physically active
  const candidateExpiryUnits = expiryPredictions.filter(
    e => (e.riskLevel === 'High' || (e.riskLevel === 'Medium' && e.daysRemaining <= 4)) && e.daysRemaining > 0
  );

  // Filter shortage targets having High or Medium deficit
  const shortageTargets = shortagePredictions.filter(
    s => s.riskLevel === 'High' || (s.riskLevel === 'Medium' && s.predictedShortage > 0)
  );

  candidateExpiryUnits.forEach(expUnit => {
    const sourceBank = bankMap[expUnit.bloodBankId];
    if (!sourceBank) return;

    const constraint = COMPONENT_TRANSPORT_CONSTRAINTS[expUnit.componentType] || COMPONENT_TRANSPORT_CONSTRAINTS['Whole Blood'];

    // Total remaining shelf-life hours
    const remainingShelfLifeHours = expUnit.daysRemaining * 24;

    // Find destination banks having shortage in the EXACT matching blood group
    const matchingShortages = shortageTargets.filter(
      s => s.bloodBankId !== expUnit.bloodBankId && s.bloodGroup === expUnit.bloodGroup
    );

    matchingShortages.forEach(destShortage => {
      const destBank = bankMap[destShortage.bloodBankId];
      if (!destBank) return;

      const distanceKm = calculateHaversineDistanceKm(
        sourceBank.latitude,
        sourceBank.longitude,
        destBank.latitude,
        destBank.longitude
      );

      // -------------------------------------------------------------
      // STRICT FEASIBILITY GATES (Reject before score calculation)
      // -------------------------------------------------------------

      // 1. Distance Gate: Reject if distance exceeds component's maximum practical radius
      if (distanceKm > constraint.maxDistanceKm) {
        return; // REJECT: e.g. Platelets > 75 km
      }

      // 2. Transport Time Estimation
      const estimatedTransitHours = Number(
        ((distanceKm / constraint.averageSpeedKmH) + constraint.handlingOverheadHours).toFixed(1)
      );

      // 3. Clinical Usable Life Gate: Shelf-life remaining after arrival
      const usableLifeAfterArrivalHours = remainingShelfLifeHours - estimatedTransitHours;

      if (usableLifeAfterArrivalHours < constraint.minClinicalSafetyBufferHours) {
        return; // REJECT: Not enough usable shelf life remaining at destination
      }

      // -------------------------------------------------------------
      // MULTI-CRITERIA RECOMMENDATION SCORING (0.0 to 1.0)
      // -------------------------------------------------------------
      const shortageWeight = destShortage.riskScore; // 0.0 - 1.0
      const expiryWeight = expUnit.riskScore; // 0.0 - 1.0
      const proximityFactor = Math.max(0.3, Number((1 - (distanceKm / constraint.maxDistanceKm)).toFixed(2)));
      const urgencyBonus = destShortage.hasCriticalRequest ? 0.20 : 0.05;

      const rawScore =
        shortageWeight * 0.35 +
        expiryWeight * 0.35 +
        proximityFactor * 0.20 +
        urgencyBonus * 0.10;

      const recommendationScore = Number(Math.min(0.99, Math.max(0.70, rawScore)).toFixed(2));

      // Potential wastage hours saved
      const potentialWastageHoursSaved = Math.max(12, Math.round(usableLifeAfterArrivalHours));

      // Explainable human-readable rationale
      const isLocalTransfer = distanceKm <= 20;
      const transitDesc = isLocalTransfer
        ? `intra-metro green corridor (${distanceKm} km, ~${Math.round(estimatedTransitHours * 60)} mins)`
        : `cold-chain transit route (${distanceKm} km, ~${estimatedTransitHours}h)`;

      const reason = `Feasible Redistribution: ${sourceBank.name} has ${expUnit.bloodGroup} ${expUnit.componentType} (${expUnit.bloodUnitId}) with ${expUnit.daysRemaining}d shelf life. Dispatch via ${transitDesc} to ${destBank.name} resolves predicted deficit of ${destShortage.predictedShortage} units with ${Math.round(usableLifeAfterArrivalHours)}h usable clinical window preserved.`;

      recommendations.push({
        sourceBankId: sourceBank.id,
        sourceBankName: sourceBank.name,
        destinationBankId: destBank.id,
        destinationBankName: destBank.name,
        bloodUnitId: expUnit.bloodUnitId,
        bloodGroup: expUnit.bloodGroup,
        componentType: expUnit.componentType,
        quantity: 1,
        distanceKm,
        recommendationScore,
        status: 'Pending', // ALWAYS starts as Pending (Human-in-the-loop rule)
        potentialWastageHoursSaved,
        reason
      });
    });
  });

  // Sort by highest recommendation score
  return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
}
