export type ProphetHorizon = 1 | 3 | 6 | 12 | 24;

export interface ProphetPredictionPoint {
  horizon: number;
  predicted_pm25: number;
  lower_bound: number;
  upper_bound: number;
  prediction_timestamp: string;
}
export interface ProphetPredictionResponse {
  success: boolean;
  station_id: number;
  station_name: string;
  predictions: Record<string, ProphetPredictionPoint>;
  last_known_value: number;
  last_known_timestamp: string;
  data_points_used: number;
  generated_at: string;
  method: "prophet";
}

interface StoredProphetData {
  predictions: ProphetPredictionResponse;
  timestamp: number;
  stationId: number;
  horizons: number[];
}

const STORAGE_KEY = "prophet_predictions";
const UPDATE_INTERVAL = 3600000; // 1 hora en milisegundos


function generateRandomPM25(base: number = 25): number {
  const variance = base * 0.25;
  return Math.max(5, base + (Math.random() * variance * 2 - variance));
}


function generateConfidenceIntervals(predicted: number, horizon: number): {
  lower: number;
  upper: number;
} {
  const uncertaintyPct = 0.05 + (horizon * 0.02);
  const uncertainty = predicted * uncertaintyPct;
  
  return {
    lower: Math.max(0, predicted - uncertainty),
    upper: predicted + uncertainty
  };
}


function generateProphetPredictions(
  stationId: number,
  stationName: string,
  horizons: ProphetHorizon[]
): ProphetPredictionResponse {
  const now = new Date();
  const lastKnownValue = generateRandomPM25(30);
  
  const predictions: Record<string, ProphetPredictionPoint> = {};
  
  horizons.forEach(horizon => {
    const predictedValue = generateRandomPM25(lastKnownValue);
    const { lower, upper } = generateConfidenceIntervals(predictedValue, horizon);
    const predictionTime = new Date(now.getTime() + horizon * 3600000);
    
    predictions[horizon.toString()] = {
      horizon,
      predicted_pm25: predictedValue,
      lower_bound: lower,
      upper_bound: upper,
      prediction_timestamp: predictionTime.toISOString()
    };
  });
  
  return {
    success: true,
    station_id: stationId,
    station_name: stationName,
    predictions,
    last_known_value: lastKnownValue,
    last_known_timestamp: new Date(now.getTime() - 3600000).toISOString(),
    data_points_used: 168, // Simulamos 7 días de datos
    generated_at: now.toISOString(),
    method: "prophet"
  };
}


function getStoredData(): StoredProphetData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data: StoredProphetData = JSON.parse(stored);
    return data;
  } catch (error) {
    console.error("Error leyendo datos guardados:", error);
    return null;
  }
}


function saveData(data: StoredProphetData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error guardando datos:", error);
  }
}

function needsUpdate(storedData: StoredProphetData | null, currentParams: {
  stationId: number;
  horizons: ProphetHorizon[];
}): boolean {
  if (!storedData) return true;
  
  const now = Date.now();
  const timeSinceUpdate = now - storedData.timestamp;
  
  if (timeSinceUpdate >= UPDATE_INTERVAL) return true;
  
  if (storedData.stationId !== currentParams.stationId) return true;
  
  const storedHorizons = storedData.horizons.sort().join(',');
  const currentHorizons = currentParams.horizons.sort().join(',');
  if (storedHorizons !== currentHorizons) return true;
  
  return false;
}

export async function predictPM25Prophet(
  stationId: number,
  horizons: ProphetHorizon[]
): Promise<ProphetPredictionResponse> {
  console.log("🔮 Generando predicción Prophet:", { stationId, horizons });
  

  await new Promise(resolve => setTimeout(resolve, 500));
  
  const storedData = getStoredData();
  const currentParams = { stationId, horizons };
  

  if (!needsUpdate(storedData, currentParams)) {
    const timeUntilUpdate = UPDATE_INTERVAL - (Date.now() - storedData!.timestamp);
    const minutesLeft = Math.ceil(timeUntilUpdate / 60000);
    
    console.log(` Usando predicción existente (se actualizará en ${minutesLeft} minutos)`);
    return storedData!.predictions;
  }
  

  console.log(" Generando nuevas predicciones Prophet...");
  

  const stationNames: Record<number, string> = {
    1: "Carvajal - Sevillana",
    2: "Guaymaral",
    3: "Las Ferias",
    4: "Puente Aranda",
    5: "Usaquén",
    6: "Kennedy",
    7: "Suba",
    8: "Fontibón",
    9: "MinAmbiente",
    10: "Móvil"
  };
  
  const stationName = stationNames[stationId] || `Estación ${stationId}`;
  const predictions = generateProphetPredictions(stationId, stationName, horizons);

  const dataToStore: StoredProphetData = {
    predictions,
    timestamp: Date.now(),
    stationId,
    horizons
  };
  
  saveData(dataToStore);
  
  console.log(" Predicción Prophet generada y guardada");
  
  return predictions;
}


export function formatConfidenceInterval(pred: ProphetPredictionPoint): string {
  return `[${pred.lower_bound.toFixed(1)}, ${pred.upper_bound.toFixed(1)}] μg/m³`;
}


export function getUncertaintyPercentage(pred: ProphetPredictionPoint): number {
  const range = pred.upper_bound - pred.lower_bound;
  const uncertainty = (range / pred.predicted_pm25) * 100;
  return uncertainty;
}


export function getTimeUntilNextUpdate(): number | null {
  const storedData = getStoredData();
  if (!storedData) return null;
  
  const timeUntilUpdate = UPDATE_INTERVAL - (Date.now() - storedData.timestamp);
  return timeUntilUpdate > 0 ? timeUntilUpdate : 0;
}


export function forceRegeneratePredictions(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log(" Cache de predicciones Prophet limpiado");
}