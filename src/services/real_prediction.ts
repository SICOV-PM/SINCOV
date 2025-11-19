/**
 * Servicio de predicciones REALES de PM2.5 con XGBoost.
 * 
 * @remarks
 * Se conecta directamente al endpoint `/predict/` del backend
 * que usa los modelos XGBoost entrenados (xgb_pm25_tplus1.json, etc.)
 * 
 * @module services/real_prediction
 * @category Services
 */

import { apiFetch } from "./api";

/**
 * Horizontes temporales soportados por los modelos XGBoost.
 * 
 * @remarks
 * Corresponden a los modelos:
 * - 1h: xgb_pm25_tplus1.json
 * - 3h: xgb_pm25_tplus3.json
 * - 6h: xgb_pm25_tplus6.json
 * - 12h: xgb_pm25_tplus12.json
 */
export type XGBoostHorizon = 1 | 3 | 6 | 12;

/**
 * Solicitud de predicción al backend.
 * 
 * @interface
 */
export interface RealPredictionRequest {
  /** ID de la estación (debe estar en las 10 permitidas) */
  station_id: number;
  
  /** Horizontes a predecir (1h, 3h, 6h, 12h) */
  horizons: XGBoostHorizon[];
}

/**
 * Punto individual de predicción desde el modelo XGBoost.
 * 
 * @interface
 */
export interface RealPredictionPoint {
  /** Horizonte temporal en horas */
  horizon: number;
  
  /** Valor predicho de PM2.5 (μg/m³) */
  predicted_pm25: number;
  
  /** Timestamp de la predicción (ISO 8601) */
  timestamp: string;
  
  /** Número de features utilizadas en la predicción */
  features_used: number;
}

/**
 * Respuesta completa de predicción real desde el backend.
 * 
 * @interface
 */
export interface RealPredictionResponse {
  /** Indica si la predicción fue exitosa */
  success: boolean;
  
  /** ID de la estación predicha */
  station_id: number;
  
  /** Nombre de la estación */
  station_name: string;
  
  /** Array de predicciones (una por horizonte) */
  predictions: RealPredictionPoint[];
  
  /** Tiempo de generación (ISO 8601) */
  generated_at: string;
  
  /** Método usado (siempre "xgboost") */
  method: "xgboost";
}

/**
 * Información de estaciones permitidas.
 * 
 * @interface
 */
export interface AllowedStation {
  id: number;
  name: string;
}

/**
 * Respuesta de estaciones permitidas.
 * 
 * @interface
 */
export interface AllowedStationsResponse {
  success: boolean;
  stations: AllowedStation[];
  count: number;
}

/**
 * Estado de salud de los modelos.
 * 
 * @interface
 */
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  models: {
    [key: string]: {
      loaded: boolean;
      horizon: number;
      num_features?: number;
      num_boosted_rounds?: number;
    };
  };
  allowed_stations: number;
}

/**
 * Genera predicción REAL usando modelos XGBoost del backend.
 * 
 * @param request - Solicitud de predicción
 * 
 * @returns Promise con predicciones reales de los modelos entrenados
 * 
 * @throws Error si la estación no está permitida o si el backend falla
 * 
 * @example
 * ```typescript
 * const prediction = await predictPM25Real({
 *   station_id: 2,  // Guaymaral
 *   horizons: [1, 3, 6, 12]
 * });
 * 
 * console.log(`Estación: ${prediction.station_name}`);
 * prediction.predictions.forEach(pred => {
 *   console.log(`+${pred.horizon}h: ${pred.predicted_pm25.toFixed(2)} μg/m³`);
 * });
 * ```
 * 
 * @public
 */
export async function predictPM25Real(
  request: RealPredictionRequest
): Promise<RealPredictionResponse> {
  console.log(" Generando predicción REAL con XGBoost:", request);
  
  try {
    const response = await apiFetch<RealPredictionResponse>("/predict/", {
      method: "POST",
      body: JSON.stringify(request),
    });
    
    console.log(" Predicción real recibida:", {
      station: response.station_name,
      predictions: response.predictions.length,
      method: response.method
    });
    
    return response;
  } catch (error) {
    console.error(" Error en predicción real:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Error desconocido al generar predicción"
    );
  }
}

/**
 * Obtiene la lista de estaciones permitidas para predicción.
 * 
 * @returns Promise con lista de 10 estaciones permitidas
 * 
 * @example
 * ```typescript
 * const stations = await getAllowedStations();
 * 
 * stations.stations.forEach(station => {
 *   console.log(`${station.id}: ${station.name}`);
 * });
 * ```
 * 
 * @public
 */
export async function getAllowedStations(): Promise<AllowedStationsResponse> {
  console.log(" Obteniendo estaciones permitidas...");
  
  try {
    const response = await apiFetch<AllowedStationsResponse>(
      "/predict/allowed-stations"
    );
    
    console.log(` ${response.count} estaciones permitidas obtenidas`);
    
    return response;
  } catch (error) {
    console.error(" Error obteniendo estaciones:", error);
    throw new Error("No se pudieron cargar las estaciones permitidas");
  }
}

/**
 * Verifica el estado de salud de los modelos XGBoost.
 * 
 * @returns Promise con estado de cada modelo
 * 
 * @example
 * ```typescript
 * const health = await checkModelsHealth();
 * 
 * if (health.status === "healthy") {
 *   console.log(" Todos los modelos cargados correctamente");
 *   Object.entries(health.models).forEach(([name, info]) => {
 *     console.log(`${name}: ${info.num_features} features`);
 *   });
 * }
 * ```
 * 
 * @public
 */
export async function checkModelsHealth(): Promise<HealthCheckResponse> {
  console.log(" Verificando salud de modelos...");
  
  try {
    const response = await apiFetch<HealthCheckResponse>("/predict/health");
    
    console.log(` Estado: ${response.status}`);
    
    return response;
  } catch (error) {
    console.error(" Error verificando salud:", error);
    throw new Error("No se pudo verificar el estado de los modelos");
  }
}

/**
 * Convierte horizontes XGBoost a TimeRange del servicio mock.
 * 
 * @param horizons - Array de horizontes XGBoost
 * 
 * @returns TimeRange correspondiente al horizonte máximo
 * 
 * @internal
 */
export function horizonsToTimeRange(horizons: XGBoostHorizon[]): string {
  const maxHorizon = Math.max(...horizons);
  
  const map: Record<number, string> = {
    1: "1h",
    3: "3h",
    6: "6h",
    12: "12h"
  };
  
  return map[maxHorizon] || "12h";
}

/**
 * Valida si una estación está permitida para predicción.
 * 
 * @param stationId - ID de la estación
 * 
 * @returns Promise<boolean> - true si está permitida
 * 
 * @example
 * ```typescript
 * const isAllowed = await isStationAllowed(2);
 * 
 * if (isAllowed) {
 *   console.log(" Estación permitida");
 * } else {
 *   console.log(" Estación no permitida para predicción XGBoost");
 * }
 * ```
 * 
 * @public
 */
export async function isStationAllowed(stationId: number): Promise<boolean> {
  try {
    const response = await getAllowedStations();
    return response.stations.some(s => s.id === stationId);
  } catch {
    return false;
  }
}

/**
 * Obtiene el estado de calidad del aire según valor de PM2.5.
 * 
 * @param pm25 - Valor de PM2.5 (μg/m³)
 * 
 * @returns Estado de calidad del aire
 * 
 * @remarks
 * Basado en ICA (Índice de Calidad del Aire) de EPA:
 * - Bueno: 0-12 μg/m³
 * - Moderado: 12.1-35.4 μg/m³
 * - Regular: 35.5-55.4 μg/m³
 * - Alto: 55.5+ μg/m³
 * 
 * @public
 */
export function getAirQualityStatus(pm25: number): {
  status: string;
  color: string;
  description: string;
} {
  if (pm25 >= 55.5) {
    return {
      status: "Alto",
      color: "red",
      description: "Calidad del aire no saludable"
    };
  }
  if (pm25 >= 35.5) {
    return {
      status: "Regular",
      color: "orange",
      description: "Calidad del aire aceptable"
    };
  }
  if (pm25 >= 12.1) {
    return {
      status: "Moderado",
      color: "yellow",
      description: "Calidad del aire moderada"
    };
  }
  return {
    status: "Bueno",
    color: "green",
    description: "Calidad del aire buena"
  };
}