import { apiFetch } from "./api";

/**
 * Servicio REAL de predicción Prophet (backend FastAPI).
 * 
 * Prophet SIEMPRE predice a 24 horas.
 */

export type ProphetHorizon = 24;

export interface ProphetPredictionPoint {
  horizon: number;
  predicted_pm25: number;
  lower_bound: number;
  upper_bound: number;
  timestamp: string;
}

export interface ProphetPredictionResponse {
  success: boolean;
  station_id: number;
  station_name: string;
  predictions: ProphetPredictionPoint[];
  generated_at: string;
  method: "prophet";
  model_info?: any;
  last_known_value?: number;
  last_known_timestamp?: string;
  data_points_used?: number;
}

/**
 * Llama al backend real y obtiene la predicción Prophet real.
 */
export async function predictPM25Prophet(
  stationId: number
): Promise<ProphetPredictionResponse> {
  
  const body = {
    station_id: stationId,
    model_type: "prophet",
    horizons: [24],
  };

  return apiFetch("/predict/", {
    method: "POST",
    body: JSON.stringify(body),
  }) as Promise<ProphetPredictionResponse>;
}

/**
 * Intervalo de confianza formateado.
 */
export function formatConfidenceInterval(pred: ProphetPredictionPoint): string {
  return `[${pred.lower_bound.toFixed(1)} – ${pred.upper_bound.toFixed(1)}] μg/m³`;
}

/**
 * Porcentaje de incertidumbre.
 */
export function getUncertaintyPercentage(pred: ProphetPredictionPoint): number {
  const range = pred.upper_bound - pred.lower_bound;
  return (range / pred.predicted_pm25) * 100;
}
