/**
 * Página de predicciones con modelos XGBoost y Prophet.
 * 
 * @remarks
 * Usa los modelos XGBoost y Prophet del backend para generar
 * predicciones reales de PM2.5 en múltiples horizontes temporales.
 * 
 * @module pages/PredictionsReal
 * @category Pages
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
//import {
 // formatConfidenceInterval,
 // getUncertaintyPercentage,
 // predictPM25Prophet,
 // type ProphetHorizon,
 // type ProphetPredictionResponse
//} from "../../services/prophet_prediction"; ##### IMPORTANTE: Descomentar al habilitar Prophet
import {
  checkModelsHealth,
  getAirQualityStatus,
  getAllowedStations,
  predictPM25Real,
  type AllowedStation,
  type RealPredictionResponse,
  type XGBoostHorizon
} from "../../services/real_prediction";

type ModelType = "xgboost" | "prophet";

/**
 * Componente de página de predicciones reales.
 * 
 * @component
 * @public
 */
const PredictionsReal = () => {
  // ===== Estado =====
  const [allowedStations, setAllowedStations] = useState<AllowedStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [selectedHorizons, setSelectedHorizons] = useState<number[]>([1, 3, 6, 12]);
  const [loading, setLoading] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);
  const [xgboostPrediction, setXgboostPrediction] = useState<RealPredictionResponse | null>(null);
  const [prophetPrediction, setProphetPrediction] = useState<ProphetPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsHealthy, setModelsHealthy] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<ModelType | null>(null);

  // ===== Carga inicial =====
  useEffect(() => {
    Promise.all([
      getAllowedStations(),
      checkModelsHealth()
    ])
      .then(([stationsData, healthData]) => {
        setAllowedStations(stationsData.stations);
        setModelsHealthy(healthData.status === "healthy");
        
        if (stationsData.stations.length > 0) {
          setSelectedStation(stationsData.stations[0].id);
        }
      })
      .catch((err) => {
        console.error("Error cargando datos iniciales:", err);
        setError("No se pudieron cargar las estaciones o modelos");
      })
      .finally(() => setLoadingStations(false));
  }, []);

  // ===== Handler de predicción XGBoost =====
  const handlePredictXGBoost = async () => {
    if (!selectedStation) {
      setError("Selecciona una estación");
      return;
    }

    if (selectedHorizons.length === 0) {
      setError("Selecciona al menos un horizonte temporal");
      return;
    }

    // Validar horizontes para XGBoost (máximo 12h)
    const validHorizons = selectedHorizons.filter(h => h <= 12) as XGBoostHorizon[];
    if (validHorizons.length === 0) {
      setError("XGBoost solo soporta horizontes hasta 12h");
      return;
    }

    setLoading(true);
    setError(null);
    setActiveModel("xgboost");
    
    try {
      const result = await predictPM25Real({
        station_id: selectedStation,
        horizons: validHorizons
      });
      
      setXgboostPrediction(result);
      setProphetPrediction(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al generar predicción XGBoost";
      setError(errorMessage);
      console.error("Error en predicción XGBoost:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Handler de predicción Prophet =====
  const handlePredictProphet = async () => {
    if (!selectedStation) {
      setError("Selecciona una estación");
      return;
    }

    if (selectedHorizons.length === 0) {
      setError("Selecciona al menos un horizonte temporal");
      return;
    }

    // Prophet soporta hasta 24h
    const validHorizons = selectedHorizons as ProphetHorizon[];

    setLoading(true);
    setError(null);
    setActiveModel("prophet");
    
    try {
      const result = await predictPM25Prophet(
        selectedStation,
        validHorizons
      );
      
      setProphetPrediction(result);
      setXgboostPrediction(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al generar predicción Prophet";
      setError(errorMessage);
      console.error("Error en predicción Prophet:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Toggle de horizonte =====
  const toggleHorizon = (horizon: number) => {
    setSelectedHorizons(prev => 
      prev.includes(horizon)
        ? prev.filter(h => h !== horizon)
        : [...prev, horizon].sort((a, b) => a - b)
    );
  };

  // ===== Utilidades =====
  const selectedStationData = allowedStations.find(s => s.id === selectedStation);

  const horizonOptions: { value: number; label: string; description: string; prophefOnly?: boolean }[] = [
    { value: 1, label: "1 hora", description: "Predicción inmediata" },
    { value: 3, label: "3 horas", description: "Corto plazo" },
    { value: 6, label: "6 horas", description: "Mediano plazo" },
    { value: 12, label: "12 horas", description: "Largo plazo" },
    { value: 24, label: "24 horas", description: "Día completo", prophefOnly: true }
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-cyan-100">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/monitoring"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Volver</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-800">Predicciones - XGBoost & Prophet</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {modelsHealthy && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Modelos activos</span>
              </div>
            )}
            
            {activeModel && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                activeModel === "xgboost" 
                  ? "bg-blue-50 text-blue-700" 
                  : "bg-purple-50 text-purple-700"
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">
                  {activeModel === "xgboost" ? "XGBoost" : "Prophet"}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== Contenido principal ===== */}
      <main className="px-6 py-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ===== Panel de configuración ===== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </h2>

              {/* Selector de estación */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Estación de Monitoreo
                </label>
                {loadingStations ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <select
                    value={selectedStation || ""}
                    onChange={(e) => setSelectedStation(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                  >
                    {allowedStations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                )}
                
                {selectedStationData && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium mb-1">Estación:</div>
                    <div className="text-lg font-bold text-blue-900">
                      {selectedStationData.name}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector de horizontes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Horizontes de Predicción
                </label>
                <div className="space-y-2">
                  {horizonOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleHorizon(option.value)}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                        selectedHorizons.includes(option.value)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedHorizons.includes(option.value)
                              ? "bg-white border-white"
                              : "border-gray-400"
                          }`}>
                            {selectedHorizons.includes(option.value) && (
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="font-bold">{option.label}</span>
                          {option.prophefOnly && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              Prophet
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${
                          selectedHorizons.includes(option.value)
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}>
                          {option.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botones de predicción */}
              <div className="space-y-3">
                <button
                  onClick={handlePredictXGBoost}
                  disabled={loading || !selectedStation || selectedHorizons.length === 0}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading && activeModel === "xgboost" ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generando XGBoost...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Predecir con XGBoost
                    </span>
                  )}
                </button>

                <button
                  onClick={handlePredictProphet}
                  disabled={loading || !selectedStation || selectedHorizons.length === 0}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading && activeModel === "prophet" ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generando Prophet...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Predecir con Prophet
                    </span>
                  )}
                </button>
              </div>

              {/* Información del modelo */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold text-gray-600 mb-2">ℹ️ Modelos disponibles</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <span className="font-semibold text-blue-700">XGBoost:</span>
                    <span>Hasta 12h • 17 features</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <span className="font-semibold text-purple-700">Prophet:</span>
                    <span>Hasta 24h • IC 95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Panel de resultados ===== */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Error en la predicción</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!xgboostPrediction && !prophetPrediction && !loading && !error && (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Selecciona un modelo de predicción
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Elige entre XGBoost (hasta 12h) o Prophet (hasta 24h con intervalos de confianza)
                  para generar predicciones de PM2.5.
                </p>
              </div>
            )}

            {/* Resultados XGBoost */}
            {xgboostPrediction && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Predicciones XGBoost
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs font-medium text-blue-700 mb-1">Estación</div>
                      <div className="text-sm font-bold text-blue-900">{xgboostPrediction.station_name}</div>
                    </div>
                    <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                      <div className="text-xs font-medium text-cyan-700 mb-1">Modelo</div>
                      <div className="text-sm font-bold text-cyan-900">XGBoost</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="text-xs font-medium text-indigo-700 mb-1">Predicciones</div>
                      <div className="text-sm font-bold text-indigo-900">{xgboostPrediction.predictions.length}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Resultados por Horizonte
                    </h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Horizonte</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Predicción</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {xgboostPrediction.predictions.map((pred, index) => {
                          const date = new Date(pred.timestamp);
                          const quality = getAirQualityStatus(pred.predicted_pm25);
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg font-bold text-blue-700">+{pred.horizon}</span>
                                  </div>
                                  <span className="text-sm text-gray-600">h</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-2xl font-bold text-gray-900">
                                  {pred.predicted_pm25.toFixed(2)}
                                  <span className="text-sm text-gray-600 ml-1">μg/m³</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-${quality.color}-100 text-${quality.color}-700`}>
                                  {quality.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Resultados Prophet */}
            {prophetPrediction && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Predicciones Prophet
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs font-medium text-purple-700 mb-1">Estación</div>
                      <div className="text-sm font-bold text-purple-900">{prophetPrediction.station_name}</div>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="text-xs font-medium text-pink-700 mb-1">Modelo</div>
                      <div className="text-sm font-bold text-pink-900">Prophet</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="text-xs font-medium text-indigo-700 mb-1">Último valor</div>
                      <div className="text-sm font-bold text-indigo-900">{prophetPrediction.last_known_value.toFixed(2)} μg/m³</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs font-medium text-green-700 mb-1">Datos usados</div>
                      <div className="text-sm font-bold text-green-900">{prophetPrediction.data_points_used}h</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Resultados con Intervalos de Confianza (95%)
                    </h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Horizonte</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Predicción</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Intervalo 95%</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(prophetPrediction.predictions).map(([horizon, pred]) => {
                          // Validaciones de seguridad
                          if (!pred || typeof pred.predicted_pm25 !== "number") return null;

                          const date = new Date(pred.prediction_timestamp);
                          const quality = getAirQualityStatus(pred.predicted_pm25);
                          const uncertaintyPct = getUncertaintyPercentage(pred);
                          const horizonNum = parseInt(horizon);

                          // Forzar clases seguras de Tailwind
                          const colorMap: Record<string, string> = {
                            green: "bg-green-100 text-green-700",
                            yellow: "bg-yellow-100 text-yellow-700",
                            orange: "bg-orange-100 text-orange-700",
                            red: "bg-red-100 text-red-700",
                            purple: "bg-purple-100 text-purple-700",
                            gray: "bg-gray-100 text-gray-700",
                          };

                          const qualityClass = colorMap[quality.color] || colorMap.gray;

                          return (
                            <tr key={horizon} className="hover:bg-gray-50 transition-colors">
                              {/* Horizonte */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg font-bold text-purple-700">
                                      +{isNaN(horizonNum) ? "?" : horizonNum}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-600">h</span>
                                </div>
                              </td>

                              {/* Predicción principal */}
                              <td className="px-6 py-4">
                                <div className="text-2xl font-bold text-gray-900">
                                  {pred.predicted_pm25.toFixed(2)}
                                  <span className="text-sm text-gray-600 ml-1">μg/m³</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Incertidumbre: {isNaN(uncertaintyPct) ? "—" : `${uncertaintyPct.toFixed(1)}%`}
                                </div>
                              </td>

                              {/* Intervalos de confianza */}
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatConfidenceInterval(pred)}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">Min:</span>
                                      <span className="font-semibold">
                                        {pred.lower_bound?.toFixed(1) ?? "—"}
                                      </span>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">Max:</span>
                                      <span className="font-semibold">
                                        {pred.upper_bound?.toFixed(1) ?? "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Fecha */}
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {date.toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "2-digit",
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {date.toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </td>

                              {/* Estado */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${qualityClass}`}
                                >
                                  {quality.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                    </table>
                  </div>
                </div>

                {/* Información adicional Prophet */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-purple-900 mb-2">
                        Sobre las predicciones Prophet
                      </h3>
                      <div className="space-y-1 text-xs text-purple-700">
                        <p>• Los intervalos de confianza del 95% indican el rango donde se espera que esté el valor real</p>
                        <p>• Mayor incertidumbre (%) significa mayor variabilidad en la predicción</p>
                        <p>• Prophet es especialmente efectivo para capturar patrones temporales y tendencias</p>
                        <p>• Última medición: {new Date(prophetPrediction.last_known_timestamp).toLocaleString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PredictionsReal;