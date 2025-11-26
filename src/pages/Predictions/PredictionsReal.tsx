/**
 * Página de predicciones con modelos XGBoost y Prophet.
 * Versión optimizada con mejor UX y diseño.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Prophet REAL (SOLO 24h)
import {
  predictPM25Prophet,
  type ProphetPredictionResponse
} from "../../services/prophet_prediction";

// XGBoost REAL
import {
  checkModelsHealth,
  getAirQualityStatus,
  getAllowedStations,
  predictPM25Real,
  type AllowedStation,
  type RealPredictionResponse,
  type XGBoostHorizon
} from "../../services/xgboost_prediction";

type ModelType = "xgboost" | "prophet";

const PredictionsReal = () => {
  // ===== Estado =====
  const [allowedStations, setAllowedStations] = useState<AllowedStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [selectedHorizons, setSelectedHorizons] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);
  const [xgboostPrediction, setXgboostPrediction] = useState<RealPredictionResponse | null>(null);
  const [prophetPrediction, setProphetPrediction] = useState<ProphetPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsHealthy, setModelsHealthy] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<ModelType | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);

  // ===== Carga inicial =====
  useEffect(() => {
    Promise.all([getAllowedStations(), checkModelsHealth()])
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

  // ===== Toggle de horizonte (solo para XGBoost) =====
  const toggleHorizon = (horizon: number) => {
    if (horizon > 12) return; // Solo XGBoost <= 12h

    setSelectedHorizons(prev =>
      prev.includes(horizon)
        ? prev.filter(h => h !== horizon)
        : [...prev, horizon].sort((a, b) => a - b)
    );
  };

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

    const validHorizons = selectedHorizons.filter(h => h <= 12) as XGBoostHorizon[];

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

  // ===== Handler de predicción Prophet (solo 24h) =====
  const handlePredictProphet = async () => {
    if (!selectedStation) {
      setError("Selecciona una estación");
      return;
    }

    setLoading(true);
    setError(null);
    setActiveModel("prophet");

    try {
      const result = await predictPM25Prophet(selectedStation);

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

  // ===== Utilidades =====
  const selectedStationData = allowedStations.find(s => s.id === selectedStation);

  const horizonOptions: { value: number; label: string; description: string; prophetOnly?: boolean }[] = [
    { value: 1, label: "1 hora", description: "Predicción inmediata" },
    { value: 3, label: "3 horas", description: "Corto plazo" },
    { value: 6, label: "6 horas", description: "Mediano plazo" },
    { value: 12, label: "12 horas", description: "Largo plazo" },
    { value: 24, label: "24 horas", description: "Día completo", prophetOnly: true }
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
                  <div className="text-xs text-blue-700 font-medium mb-1">Estación seleccionada:</div>
                  <div className="text-lg font-bold text-blue-900">
                    {selectedStationData.name}
                  </div>
                </div>
              )}
            </div>
            
            {/* Selector de modelo */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Seleccionar Modelo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedModel("xgboost");
                    setSelectedHorizons(prev => prev.filter(h => h <= 12));
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                    selectedModel === "xgboost"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-sm font-bold">XGBoost</div>
                  <div className={`text-xs ${selectedModel === "xgboost" ? "text-blue-100" : "text-gray-500"}`}>
                    Hasta 12h
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedModel("prophet");
                    setSelectedHorizons([24]);
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                    selectedModel === "prophet"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="text-sm font-bold">Prophet</div>
                  <div className={`text-xs ${selectedModel === "prophet" ? "text-purple-100" : "text-gray-500"}`}>
                    Solo 24h
                  </div>
                </button>
              </div>
            </div>

            {/* Selector de horizontes - Solo mostrar si hay un modelo seleccionado */}
            {selectedModel && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Horizontes de Predicción
                </label>
                <div className="space-y-2">
                  {horizonOptions
                    .filter((option) => {
                      if (selectedModel === "xgboost") {
                        return option.value <= 12;
                      } else if (selectedModel === "prophet") {
                        return option.prophetOnly;
                      }
                      return false;
                    })
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleHorizon(option.value)}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                          selectedHorizons.includes(option.value)
                            ? selectedModel === "xgboost" 
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "bg-purple-600 text-white border-purple-600 shadow-md"
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
                                <svg 
                                  className={`w-3 h-3 ${selectedModel === "xgboost" ? "text-blue-600" : "text-purple-600"}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="font-bold">{option.label}</span>
                            {option.prophetOnly && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                Prophet
                              </span>
                            )}
                          </div>
                          <span className={`text-xs ${
                            selectedHorizons.includes(option.value)
                              ? selectedModel === "xgboost" ? "text-blue-100" : "text-purple-100"
                              : "text-gray-500"
                          }`}>
                            {option.description}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Botones de predicción */}
            {selectedModel && (
              <div className="space-y-3">
                {selectedModel === "xgboost" && (
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
                )}

                {selectedModel === "prophet" && (
                  <button
                    onClick={handlePredictProphet}
                    disabled={loading || !selectedStation}
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
                        Predecir con Prophet (24h)
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Mensaje cuando no hay modelo seleccionado */}
            {!selectedModel && (
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">
                  Selecciona un modelo para continuar
                </p>
              </div>
            )}

            {/* Información del modelo */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-2">Modelos disponibles</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <span className="font-semibold text-blue-700">XGBoost:</span>
                  <span>Hasta 12h - 17 features</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <span className="font-semibold text-purple-700">Prophet:</span>
                  <span>24h con intervalos</span>
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
                  Genera tu predicción
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Selecciona horizontes para XGBoost (1-12h) o usa Prophet para obtener
                  una predicción de 24 horas con intervalos de confianza.
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
                                <span
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: quality.color === 'green' ? '#dcfce7' :
                                    quality.color === 'yellow' ? '#fef9c3' :
                                    quality.color === 'orange' ? '#fed7aa' : '#fecaca',
                                    color: quality.color === 'green' ? '#15803d' :
                                    quality.color === 'yellow' ? '#a16207' :
                                    quality.color === 'orange' ? '#c2410c' : '#b91c1c'
                                  }}
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
                    Predicción Prophet (24h)
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs font-medium text-purple-700 mb-1">Estación</div>
                      <div className="text-sm font-bold text-purple-900">{prophetPrediction.station_name || 'Bogotá'}</div>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="text-xs font-medium text-pink-700 mb-1">Modelo</div>
                      <div className="text-sm font-bold text-pink-900">Prophet</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Predicción 24 horas
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
                        {prophetPrediction.predictions.map((pred, index) => {
                          const date = new Date(pred.timestamp);
                          const quality = getAirQualityStatus(pred.predicted_pm25);
                          
                          
                          const lowerBound = pred.lower_bound ?? 0;
                          const upperBound = pred.upper_bound ?? pred.predicted_pm25;
                          const confidenceRange = ((upperBound - lowerBound) / 2).toFixed(1);
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg font-bold text-purple-700">+{pred.horizon}</span>
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
                                <span
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: 
                                      quality.color === 'green' ? '#dcfce7' :
                                      quality.color === 'yellow' ? '#fef9c3' :
                                      quality.color === 'orange' ? '#fed7aa' : '#fecaca',
                                    color: quality.color === 'green' ? '#15803d' :
                                      quality.color === 'yellow' ? '#a16207' :
                                      quality.color === 'orange' ? '#c2410c' : '#b91c1c'
                                  }}
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PredictionsReal;