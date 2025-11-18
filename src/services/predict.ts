// /**
// * Servicio de predicciones de PM2.5 con modelo XGBoost.
// * // * @remarks
// * Soporta 3 métodos de conexión con el modelo:
// * 1. **API REST**: Modelo desplegado en servidor externo
// * 2. **Backend .pkl**: Modelo scikit-learn/joblib en backend Python
// * 3. **Backend Spark**: Modelo MLlib de Spark en backend Python
// * // * El servicio detecta automáticamente qué método está disponible
// * e intenta conectarse en el siguiente orden:
// * 1. API REST (más rápido)
// * 2. Backend .pkl
// * 3. Backend Spark
// * 4. Mock (fallback)
// * // * @module services/predict
// * @category Services
// */

// import { apiFetch } from "./api";

// /**
// * Rangos temporales soportados para predicciones.
// * // * @typedef {string} TimeRange
// */
// export type TimeRange = "1h" | "3h" | "6h" | "12h" | "24h" | "48h";

// /**
// * Método de predicción utilizado.
// * // * @typedef {string} PredictionMethod
// */
// export type PredictionMethod = "api_rest" | "backend_pkl" | "backend_spark" | "mock";

// /**
// * Solicitud de predicción.
// * // * @interface
// */
// export interface PredictionRequest {
//   /** ID de la estación */
//   station_id: number;
//   
//   /** Rango temporal de predicción */
//   time_range: TimeRange;
//   
//   /** Timestamp de inicio (opcional, por defecto: ahora) */
//   start_time?: string;
// }

// /**
// * Punto individual de predicción.
// * // * @interface
// */
// export interface PredictionPoint {
//   /** Timestamp de la predicción (ISO 8601) */
//   timestamp: string;
//   
//   /** Valor predicho de PM2.5 (μg/m³) */
//   predicted_pm25: number;
//   
//   /** Porcentaje de error/incertidumbre de la predicción */
//   error_percentage: number;
// }

// /**
// * Respuesta completa de predicción.
// * // * @interface
// */
// export interface PredictionResponse {
//   /** Indica si la predicción fue exitosa */
//   success: boolean;
//   
//   /** ID de la estación predicha */
//   station_id: number;
//   
//   /** Nombre de la estación */
//   station_name: string;
//   
//   /** Rango temporal usado */
//   time_range: TimeRange;
//   
//   /** Método de predicción utilizado */
//   method: PredictionMethod;
//   
//   /** Array de predicciones (una por hora) */
//   predictions: PredictionPoint[];
//   
//   /** Tiempo de generación (ISO 8601) */
//   generated_at: string;
// }

// /**
// * Configuración de métodos de predicción disponibles.
// * // * @constant
// */
// const PREDICTION_CONFIG = {
//   /** URL de la API REST externa (si existe) */
//   API_REST_URL: import.meta.env.VITE_ML_API_URL || null,
//   
//   /** Backend propio con modelo .pkl */
//   BACKEND_PKL_ENDPOINT: "/predict/pkl",
//   
//   /** Backend propio con modelo Spark */
//   BACKEND_SPARK_ENDPOINT: "/predict/spark",
//   
//   /** Timeout para requests (ms) */
//   TIMEOUT: 30000, // 30 segundos
// };

// /**
// * Convierte el rango temporal a número de horas.
// * // * @param range - Rango temporal
// * @returns Número de horas
// * // * @internal
// */
// function timeRangeToHours(range: TimeRange): number {
//   const map: Record<TimeRange, number> = {
//     "1h": 1,
//     "3h": 3,
//     "6h": 6,
//     "12h": 12,
//     "24h": 24,
//     "48h": 48
//   };
//   return map[range];
// }

// /**
// * Genera predicciones mock con algoritmo realista.
// * // * @param request - Solicitud de predicción
// * @param stationName - Nombre de la estación
// * @param currentValue - Valor actual de PM2.5
// * // * @returns Predicciones simuladas
// * // * @remarks
// * **Algoritmo del mock:**
// * 1. Random walk con drift (tendencia aleatoria)
// * 2. Ciclo diurno (más contaminación en horas pico)
// * 3. Ruido gaussiano
// * 4. Error proporcional al horizonte temporal
// * // * @internal
// */
// async function generateMockPredictions(
//   request: PredictionRequest,
//   stationName: string,
//   currentValue: number
// ): Promise<PredictionResponse> {
//   // Simular latencia del modelo (1-3 segundos)
//   await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
//   
//   const hours = timeRangeToHours(request.time_range);
//   const predictions: PredictionPoint[] = [];
//   
//   let value = currentValue;
//   const startTime = request.start_time ? new Date(request.start_time) : new Date();
//   
//   for (let i = 1; i <= hours; i++) {
//     const timestamp = new Date(startTime.getTime() + i * 3600000);
//     const hour = timestamp.getHours();
//     
//     // Random walk con drift
//     const drift = (Math.random() - 0.5) * 2; // ±1 μg/m³ por hora
//     
//     // Ciclo diurno (más contaminación en horas pico: 7-9, 17-19)
//     let diurnalEffect = 0;
//     if (hour >= 7 && hour <= 9) {
//       diurnalEffect = 3 + Math.random() * 5; // Pico matutino
//     } else if (hour >= 17 && hour <= 19) {
//       diurnalEffect = 4 + Math.random() * 6; // Pico vespertino
//     } else if (hour >= 0 && hour <= 5) {
//       diurnalEffect = -(2 + Math.random() * 3); // Valle nocturno
//     }
//     
//     // Ruido gaussiano
//     const noise = (Math.random() + Math.random() + Math.random() - 1.5) * 1.5;
//     
//     // Actualizar valor con tendencia realista
//     value = Math.max(5, Math.min(150, value + drift + diurnalEffect + noise));
//     
//     // Error proporcional al horizonte temporal (más lejos = más incertidumbre)
//     const baseError = 5; // 5% base
//     const timeError = (i / hours) * 15; // hasta +15% adicional
//     const errorPercentage = baseError + timeError + Math.random() * 5;
//     
//     predictions.push({
//       timestamp: timestamp.toISOString(),
//       predicted_pm25: parseFloat(value.toFixed(1)),
//       error_percentage: parseFloat(errorPercentage.toFixed(1))
//     });
//   }
//   
//   return {
//     success: true,
//     station_id: request.station_id,
//     station_name: stationName,
//     time_range: request.time_range,
//     method: "mock",
//     predictions,
//     generated_at: new Date().toISOString()
//   };
// }

// /**
// * Intenta predecir usando API REST externa.
// * // * @param request - Solicitud de predicción
// * // * @returns Predicción desde API REST o null si falla
// * // * @remarks
// * **Formato esperado de la API REST:**
// * ```json
// * POST /predict
// * Body: {
// *   "station_id": 1,
// *   "time_range": "6h",
// *   "start_time": "2025-10-31T14:00:00Z"
// * }
// * // * Response: {
// *   "success": true,
// *   "station_id": 1,
// *   "station_name": "Estación Centro",
// *   "predictions": [
// *     {
// *       "timestamp": "2025-10-31T15:00:00Z",
// *       "predicted_pm25": 42.3,
// *       "error_percentage": 8.5
// *     },
// *     ...
// *   ]
// * }
// * ```
// * // * @internal
// */
// async function predictFromAPIRest(request: PredictionRequest): Promise<PredictionResponse | null> {
//   if (!PREDICTION_CONFIG.API_REST_URL) {
//     console.log(" API REST no configurada");
//     return null;
//   }
//   
//   try {
//     console.log(" Intentando predicción con API REST...");
//     
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), PREDICTION_CONFIG.TIMEOUT);
//     
//     const response = await fetch(`${PREDICTION_CONFIG.API_REST_URL}/predict`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(request),
//       signal: controller.signal
//     });
//     
//     clearTimeout(timeoutId);
//     
//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }
//     
//     const data = await response.json();
//     
//     console.log(" Predicción exitosa desde API REST");
//     
//     return {
//       ...data,
//       method: "api_rest" as PredictionMethod,
//       time_range: request.time_range,
//       generated_at: new Date().toISOString()
//     };
//   } catch (error) {
//     console.error(" Error en API REST:", error);
//     return null;
//   }
// }

// /**
// * Intenta predecir usando backend propio con modelo .pkl (joblib).
// * // * @param request - Solicitud de predicción
// * // * @returns Predicción desde backend .pkl o null si falla
// * // * @remarks
// * **Backend esperado (FastAPI + joblib):**
// * ```python
// * import joblib
// * from fastapi import FastAPI
// * // * app = FastAPI()
// * model = joblib.load("xgboost_model.pkl")
// * // * @app.post("/predict/pkl")
// * async def predict_pkl(request: PredictRequest):
// *     # Cargar datos históricos de la estación
// *     features = prepare_features(request.station_id)
// *     
// *     # Predecir con XGBoost
// *     predictions = model.predict(features)
// *     
// *     return {
// *         "success": True,
// *         "station_id": request.station_id,
// *         "predictions": [...]
// *     }
// * ```
// * // * @internal
// */
// async function predictFromBackendPKL(request: PredictionRequest): Promise<PredictionResponse | null> {
//   try {
//     console.log("🔄 Intentando predicción con backend .pkl...");
//     
//     const response = await apiFetch(PREDICTION_CONFIG.BACKEND_PKL_ENDPOINT, {
//       method: "POST",
//       body: JSON.stringify(request)
//     });
//     
//     console.log(" Predicción exitosa desde backend .pkl");
//     
//     return {
//       ...response,
//       method: "backend_pkl" as PredictionMethod,
//       time_range: request.time_range,
//       generated_at: new Date().toISOString()
//     };
//   } catch (error) {
//     console.error(" Error en backend .pkl:", error);
//     return null;
//   }
// }

// /**
// * Intenta predecir usando backend propio con modelo Spark MLlib.
// * // * @param request - Solicitud de predicción
// * // * @returns Predicción desde backend Spark o null si falla
// * // * @remarks
// * **Backend esperado (FastAPI + PySpark):**
// * ```python
// * from pyspark.ml import PipelineModel
// * from pyspark.sql import SparkSession
// * // * spark = SparkSession.builder.getOrCreate()
// * model = PipelineModel.load("xgboost_spark_model")
// * // * @app.post("/predict/spark")
// * async def predict_spark(request: PredictRequest):
// *     # Crear DataFrame de Spark con features
// *     df = prepare_spark_features(request.station_id)
// *     
// *     # Predecir con modelo Spark
// *     predictions_df = model.transform(df)
// *     
// *     # Convertir a formato JSON
// *     predictions = predictions_df.select("timestamp", "prediction").collect()
// *     
// *     return {
// *         "success": True,
// *         "station_id": request.station_id,
// *         "predictions": [...]
// *     }
// * ```
// * // * @internal
// */
// async function predictFromBackendSpark(request: PredictionRequest): Promise<PredictionResponse | null> {
//   try {
//     console.log("🔄 Intentando predicción con backend Spark...");
//     
//     const response = await apiFetch(PREDICTION_CONFIG.BACKEND_SPARK_ENDPOINT, {
//       method: "POST",
//       body: JSON.stringify(request)
//     });
//     
//     console.log("Predicción exitosa desde backend Spark");
//     
//     return {
//       ...response,
//       method: "backend_spark" as PredictionMethod,
//       time_range: request.time_range,
//       generated_at: new Date().toISOString()
//     };
//   } catch (error) {
//     console.error(" Error en backend Spark:", error);
//     return null;
//   }
// }

// /**
// * Genera predicción de serie temporal de PM2.5 usando XGBoost.
// * // * @param request - Solicitud de predicción
// * // * @returns Promise con predicciones horarias
// * // * @remarks
// * **Estrategia de fallback:**
// * 1. Intenta API REST externa
// * 2. Si falla, intenta backend .pkl
// * 3. Si falla, intenta backend Spark
// * 4. Si todo falla, usa mock realista
// * // * Esto garantiza que el frontend SIEMPRE tenga datos para mostrar,
// * facilitando el desarrollo mientras se integra el modelo real.
// * // * @example
// * ```typescript
// * const prediction = await predictPM25TimeSeries({
// *   station_id: 1,
// *   time_range: "12h"
// * });
// * // * console.log(`Método usado: ${prediction.method}`);
// * console.log(`Predicciones: ${prediction.predictions.length}`);
// * // * prediction.predictions.forEach(pred => {
// *   console.log(`${pred.timestamp}: ${pred.predicted_pm25} ±${pred.error_percentage}%`);
// * });
// * ```
// * // * @public
// */
// export async function predictPM25TimeSeries(request: PredictionRequest): Promise<PredictionResponse> {
//   console.log(" Iniciando predicción:", request);
//   
//   // Obtener información de la estación
//   const { getStations } = await import("./stations");
//   const stationsData = await getStations();
//   const station = stationsData.stations.find(s => s.id === request.station_id);
//   
//   if (!station) {
//     throw new Error(`Estación ${request.station_id} no encontrada`);
//   }
//   
//   // Estrategia de fallback
//   let result: PredictionResponse | null = null;
//   
//   // 1. Intentar API REST
//   result = await predictFromAPIRest(request);
//   if (result) return result;
//   
//   // 2. Intentar backend .pkl
//   result = await predictFromBackendPKL(request);
//   if (result) return result;
//   
//   // 3. Intentar backend Spark
//   result = await predictFromBackendSpark(request);
//   if (result) return result;
//   
//   // 4. Fallback: Mock
//   console.log(" Todos los métodos fallaron, usando mock");
//   return generateMockPredictions(request, station.name, station.value);
// }

// /**
// * Verifica qué métodos de predicción están disponibles.
// * // * @returns Promise con estado de cada método
// * // * @remarks
// * Útil para mostrar en el frontend qué métodos están activos.
// * // * @example
// * ```typescript
// * const status = await checkPredictionMethods();
// * // * if (status.api_rest) {
// *   console.log(" API REST disponible");
// * }
// * if (status.backend_pkl) {
// *   console.log(" Backend .pkl disponible");
// * }
// * ```
// * // * @public
// */
// export async function checkPredictionMethods(): Promise<{
//   api_rest: boolean;
//   backend_pkl: boolean;
//   backend_spark: boolean;
// }> {
//   const status = {
//     api_rest: false,
//     backend_pkl: false,
//     backend_spark: false
//   };
//   
//   // Verificar API REST
//   if (PREDICTION_CONFIG.API_REST_URL) {
//     try {
//       const response = await fetch(`${PREDICTION_CONFIG.API_REST_URL}/health`, {
//         method: "GET",
//         signal: AbortSignal.timeout(5000)
//       });
//       status.api_rest = response.ok;
//     } catch {
//       status.api_rest = false;
//     }
//   }
//   
//   // Verificar backend .pkl
//   try {
//     await apiFetch("/health/predict-pkl");
//     status.backend_pkl = true;
//   } catch {
//     status.backend_pkl = false;
//   }
//   
//   // Verificar backend Spark
//   try {
//     await apiFetch("/health/predict-spark");
//     status.backend_spark = true;
//   } catch {
//     status.backend_spark = false;
//   }
//   
//   return status;
// }