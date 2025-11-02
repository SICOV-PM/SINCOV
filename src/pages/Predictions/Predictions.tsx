/**
 * Página de predicciones de calidad del aire con modelo XGBoost.
 * 
 * @remarks
 * Permite al usuario:
 * - Seleccionar una estación de monitoreo
 * - Elegir rango temporal de predicción (1h - 48h)
 * - Visualizar predicciones con % de error
 * - Ver resultados en tabla y gráfico
 * 
 * Soporta 3 métodos de predicción:
 * - API REST externa (modelo en otro servidor)
 * - Archivo .pkl/.joblib (backend Python + scikit-learn)
 * - Modelo Spark MLlib (backend Python + PySpark)
 * 
 * @module pages/Predictions
 * @category Pages
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    predictPM25TimeSeries,
    type PredictionRequest,
    type PredictionResponse,
    type TimeRange
} from "../../services/predict";
import type { Station } from "../../services/stations";
import { getStations } from "../../services/stations";

/**
 * Componente de página de predicciones.
 * 
 * @component
 * @public
 */
const Predictions = () => {
  // ===== Estado =====
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("6h");
  const [loading, setLoading] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ===== Carga de estaciones =====
  useEffect(() => {
    getStations()
      .then((data) => {
        setStations(data.stations);
        if (data.stations.length > 0) {
          setSelectedStation(data.stations[0].id);
        }
      })
      .catch((err) => {
        console.error("Error cargando estaciones:", err);
        setError("No se pudieron cargar las estaciones");
      })
      .finally(() => setLoadingStations(false));
  }, []);

  // ===== Handler de predicción =====
  const handlePredict = async () => {
    if (!selectedStation) {
      setError("Selecciona una estación");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const request: PredictionRequest = {
        station_id: selectedStation,
        time_range: timeRange
      };

      const result = await predictPM25TimeSeries(request);
      setPrediction(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al generar predicción";
      setError(errorMessage);
      console.error("Error en predicción:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Utilidades =====
  const getStatusColor = (value: number) => {
    if (value >= 55.5) return "bg-red-100 text-red-700 border-red-300";
    if (value >= 35.5) return "bg-orange-100 text-orange-700 border-orange-300";
    if (value >= 12.1) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-green-100 text-green-700 border-green-300";
  };

  const getStatus = (value: number) => {
    if (value >= 55.5) return "Alto";
    if (value >= 35.5) return "Regular";
    if (value >= 12.1) return "Moderado";
    return "Bueno";
  };

  const selectedStationData = stations.find(s => s.id === selectedStation);

  const timeRangeOptions: { value: TimeRange; label: string; hours: number }[] = [
    { value: "1h", label: "1 hora", hours: 1 },
    { value: "3h", label: "3 horas", hours: 3 },
    { value: "6h", label: "6 horas", hours: 6 },
    { value: "12h", label: "12 horas", hours: 12 },
    { value: "24h", label: "24 horas", hours: 24 },
    { value: "48h", label: "48 horas", hours: 48 }
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
            <h1 className="text-xl font-bold text-gray-800">Predicciones de Calidad del Aire</h1>
          </div>
          
          {prediction && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Predicción generada</span>
            </div>
          )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                )}
                
                {selectedStationData && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium mb-1">Valor actual:</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {selectedStationData.value.toFixed(1)} <span className="text-sm text-blue-700">μg/m³</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      📍 {selectedStationData.lat.toFixed(4)}, {selectedStationData.lng.toFixed(4)}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector de rango temporal */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rango de Predicción
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        timeRange === option.value
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de predicción */}
              <button
                onClick={handlePredict}
                disabled={loading || !selectedStation}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generando predicción...
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

              {/* Información del modelo */}
              {prediction && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 mb-2">ℹ️ Información del modelo</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Algoritmo:</span>
                      <span className="font-mono font-semibold">XGBoost</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Método:</span>
                      <span className="font-mono font-semibold">{prediction.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Predicciones:</span>
                      <span className="font-semibold">{prediction.predictions.length}</span>
                    </div>
                  </div>
                </div>
              )}
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

            {!prediction && !loading && !error && (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Selecciona una estación y genera tu predicción
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Configura los parámetros en el panel izquierdo y presiona "Predecir con XGBoost" 
                  para obtener las predicciones de calidad del aire.
                </p>
              </div>
            )}

            {prediction && (
              <div className="space-y-6">
                {/* Resumen */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    📊 Resumen de la Predicción
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs font-medium text-blue-700 mb-1">Estación</div>
                      <div className="text-sm font-bold text-blue-900">{prediction.station_name}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs font-medium text-purple-700 mb-1">Periodo</div>
                      <div className="text-sm font-bold text-purple-900">
                        {timeRangeOptions.find(o => o.value === timeRange)?.label}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs font-medium text-green-700 mb-1">Datos</div>
                      <div className="text-sm font-bold text-green-900">
                        {prediction.predictions.length} puntos
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de predicciones */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Predicciones Detalladas
                    </h2>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Fecha y Hora
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            PM2.5 Predicho
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Error (%)
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {prediction.predictions.map((pred, index) => {
                          const date = new Date(pred.timestamp);
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {date.toLocaleDateString('es-ES', { 
                                    day: '2-digit', 
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {date.toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-lg font-bold text-gray-900">
                                  {pred.predicted_pm25.toFixed(1)} 
                                  <span className="text-sm text-gray-600 ml-1">μg/m³</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-semibold text-gray-900">
                                    ±{pred.error_percentage.toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ({(pred.predicted_pm25 * pred.error_percentage / 100).toFixed(1)} μg/m³)
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(pred.predicted_pm25)}`}>
                                  {getStatus(pred.predicted_pm25)}
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

export default Predictions;
