import { BloodGroup, ComponentType, RiskLevel, SuggestionStatus } from '../../types';

export interface DayForecast {
  dayIndex: number; // 1 to 7
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  predictedDemand: number;
}

export interface DemandForecastResult {
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  dailyForecast: DayForecast[];
  total7DayDemand: number;
  historicalAvgDaily: number;
  activeRequestsCount: number;
  confidenceScore: number; // 0 to 100%
  reason: string;
}

export interface ShortagePredictionResult {
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  currentStock: number;
  predictedDemand7Days: number;
  coverageRatio: number; // currentStock / predictedDemand7Days
  predictedShortage: number; // max(0, predictedDemand7Days - currentStock)
  riskScore: number; // 0.0 to 1.0
  riskLevel: RiskLevel; // 'Low' | 'Medium' | 'High'
  confidenceScore: number; // 0 to 100%
  hasCriticalRequest: boolean;
  targetDate: string;
  reason: string;
}

export interface ExpiryPredictionResult {
  bloodUnitId: string;
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  componentType: ComponentType;
  expiryDate: string;
  daysRemaining: number;
  estimatedUsageBeforeExpiry: number;
  riskScore: number; // 0.0 to 1.0
  riskLevel: RiskLevel; // 'Low' | 'Medium' | 'High'
  confidenceScore: number; // 0 to 100%
  reason: string;
}

export interface RedistributionRecommendation {
  sourceBankId: string;
  sourceBankName: string;
  destinationBankId: string;
  destinationBankName: string;
  bloodUnitId: string;
  bloodGroup: BloodGroup;
  componentType: ComponentType;
  quantity: number;
  distanceKm: number;
  recommendationScore: number; // 0.0 to 1.0
  status: SuggestionStatus; // Always starts as 'Pending'
  potentialWastageHoursSaved: number;
  reason: string;
}

export interface AIPipelineResult {
  timestamp: string;
  demandForecasts: DemandForecastResult[];
  shortagePredictions: ShortagePredictionResult[];
  expiryPredictions: ExpiryPredictionResult[];
  redistributionRecommendations: RedistributionRecommendation[];
}
