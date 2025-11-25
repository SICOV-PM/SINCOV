import { apiFetch } from "./api";

export type XGBoostHorizon = 1 | 3 | 6 | 12;

export interface RealPredictionPoint {
  horizon: number;
  predicted_pm25: number;
  timestamp: string;
  features_used?: number;
}

export interface RealPredictionResponse {
  success: boolean;
  station_id: number;
  station_name: string;
  predictions: RealPredictionPoint[];
  generated_at: string;
  method: "xgboost";
}

export interface RealPredictionRequest {
  station_id: number;
  horizons: XGBoostHorizon[];
}

export interface AllowedStation {
  id: number;
  name: string;
}

export interface AllowedStationsResponse {
  success: boolean;
  stations: AllowedStation[];
  count: number;
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded";
  models: any;
  allowed_stations?: number;
}

export async function predictPM25Real(
  request: RealPredictionRequest
): Promise<RealPredictionResponse> {

  const response = await apiFetch<RealPredictionResponse>("/predict/", {
    method: "POST",
    body: JSON.stringify({
      ...request,
      model_type: "xgboost"
    }),
  });

  return response;
}

export async function getAllowedStations(): Promise<AllowedStationsResponse> {
  return apiFetch("/predict/allowed-stations");
}

export async function checkModelsHealth(): Promise<HealthCheckResponse> {
  return apiFetch("/predict/health");
}

export function getAirQualityStatus(pm25: number) {
  if (pm25 >= 55.5) return { status: "Alto", color: "red", description: "Calidad del aire no saludable" };
  if (pm25 >= 35.5) return { status: "Regular", color: "orange", description: "Calidad del aire aceptable" };
  if (pm25 >= 12.1) return { status: "Moderado", color: "yellow", description: "Calidad del aire moderada" };
  return { status: "Bueno", color: "green", description: "Calidad del aire buena" };
}
