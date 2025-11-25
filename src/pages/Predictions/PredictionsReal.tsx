/**
 * Página de predicciones con modelos XGBoost y Prophet.
 * Usa modelos REALES del backend.
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
  // Estado general
  const [allowedStations, setAllowedStations] = useState<AllowedStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  // SOLO PARA XGBOOST (Prophet ignora horizontes excepto 24h)
  const [selectedHorizons, setSelectedHorizons] = useState<number[]>([1, 3, 6, 12]);

  const [loading, setLoading] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);
  const [xgboostPrediction, setXgboostPrediction] = useState<RealPredictionResponse | null>(null);
  const [prophetPrediction, setProphetPrediction] = useState<ProphetPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsHealthy, setModelsHealthy] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<ModelType | null>(null);

  // ===========================
  // CARGA INICIAL
  // ===========================
  useEffect(() => {
    Promise.all([getAllowedStations(), checkModelsHealth()])
      .then(([stationsData, healthData]) => {
        setAllowedStations(stationsData.stations);
        setModelsHealthy(healthData.status === "healthy");

        if (stationsData.stations.length > 0) {
          setSelectedStation(stationsData.stations[0].id);
        }
      })
      .catch(() => {
        setError("No se pudieron cargar las estaciones o modelos.");
      })
      .finally(() => setLoadingStations(false));
  }, []);

  // ===========================
  // PREDICCIÓN XGBOOST
  // ===========================
  const handlePredictXGBoost = async () => {
    if (!selectedStation) return setError("Selecciona una estación");
    if (selectedHorizons.length === 0) return setError("Selecciona al menos un horizonte");

    const validHorizons = selectedHorizons.filter(h => h <= 12) as XGBoostHorizon[];

    if (validHorizons.length === 0) {
      return setError("XGBoost solo soporta horizontes hasta 12h");
    }

    setLoading(true);
    setError(null);
    setActiveModel("xgboost");

    try {
      const result = await predictPM25Real({
        station_id: selectedStation,
        horizons: validHorizons,
      });

      setXgboostPrediction(result);
      setProphetPrediction(null);
    } catch (err) {
      setError("Error al generar predicción XGBoost");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // PREDICCIÓN PROPHET (SOLO 24H)
  // ===========================
  const handlePredictProphet = async () => {
    if (!selectedStation) return setError("Selecciona una estación");

    setLoading(true);
    setError(null);
    setActiveModel("prophet");

    try {
      const result = await predictPM25Prophet(selectedStation);

      setProphetPrediction(result);
      setXgboostPrediction(null);
    } catch (err) {
      setError("Error al generar predicción Prophet");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // UTILIDADES
  // ===========================
  const selectedStationData = allowedStations.find(s => s.id === selectedStation);

  const horizonOptions = [
    { value: 1, label: "1 hora", description: "Predicción inmediata" },
    { value: 3, label: "3 horas", description: "Corto plazo" },
    { value: 6, label: "6 horas", description: "Mediano plazo" },
    { value: 12, label: "12 horas", description: "Largo plazo" },
    // Prophet ignora los horizontes, pero mostramos 24h visualmente
    { value: 24, label: "24 horas (Prophet)", description: "Predicción día completo", prophetOnly: true }
  ];

  const toggleHorizon = (h: number) => {
    setSelectedHorizons(prev =>
      prev.includes(h)
        ? prev.filter(x => x !== h)
        : [...prev, h].sort((a, b) => a - b)
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-cyan-100">

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">
            <Link
              to="/monitoring"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Link>

            <div className="w-px h-6 bg-gray-300" />

            <h1 className="text-xl font-bold">Predicciones - XGBoost & Prophet</h1>
          </div>

          <div className="flex items-center gap-3">

            {modelsHealthy && (
              <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm flex items-center gap-2">
                ✓ Modelos activos
              </div>
            )}

            {activeModel && (
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  activeModel === "xgboost"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-purple-50 text-purple-700"
                }`}
              >
                {activeModel === "xgboost" ? "XGBoost" : "Prophet"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="px-6 py-10 max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">

        {/* PANEL IZQUIERDO */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border sticky top-24">

            {/* Selector de estación */}
            <h2 className="text-lg font-bold mb-4">Configuración</h2>

            <label className="block text-sm font-semibold mb-2">
              Estación de Monitoreo
            </label>

            {loadingStations ? (
              <div className="py-4 text-center">Cargando estaciones...</div>
            ) : (
              <select
                value={selectedStation || ""}
                onChange={e => setSelectedStation(Number(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg"
              >
                {allowedStations.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* Horizontes */}
            <div className="mt-6">
              <label className="block text-sm font-semibold mb-3">
                Horizontes de Predicción (solo XGBoost)
              </label>

              <div className="space-y-2">
                {horizonOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleHorizon(opt.value)}
                    className={`w-full px-4 py-3 border rounded-lg font-medium ${
                      selectedHorizons.includes(opt.value)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handlePredictXGBoost}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl"
              >
                {loading && activeModel === "xgboost"
                  ? "Generando XGBoost…"
                  : "Predecir con XGBoost"}
              </button>

              <button
                onClick={handlePredictProphet}
                disabled={loading}
                className="w-full py-4 bg-purple-600 text-white rounded-xl"
              >
                {loading && activeModel === "prophet"
                  ? "Generando Prophet…"
                  : "Predecir con Prophet (24h)"}
              </button>
            </div>
          </div>
        </div>

        {/* PANEL DE RESULTADOS */}
        <div className="lg:col-span-2">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-red-700">
              {error}
            </div>
          )}

          {/* Vista inicial */}
          {!xgboostPrediction && !prophetPrediction && !loading && !error && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <h3 className="text-2xl font-bold mb-3">
                Selecciona un modelo de predicción
              </h3>
              <p className="text-gray-600">
                XGBoost: hasta 12h • Prophet: 24h
              </p>
            </div>
          )}

          {/* RESULTADOS XGBOOST */}
          {xgboostPrediction && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Resultados XGBoost</h2>

              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Horizonte</th>
                    <th className="px-6 py-4 text-left">Predicción</th>
                    <th className="px-6 py-4 text-left">Fecha</th>
                    <th className="px-6 py-4 text-left">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {xgboostPrediction.predictions.map((pred, i) => {
                    const date = new Date(pred.timestamp);
                    const q = getAirQualityStatus(pred.predicted_pm25);

                    return (
                      <tr key={i} className="border-b">
                        <td className="px-6 py-3">+{pred.horizon}h</td>
                        <td className="px-6 py-3">{pred.predicted_pm25.toFixed(2)} μg/m³</td>
                        <td className="px-6 py-3">{date.toLocaleString()}</td>
                        <td className="px-6 py-3">
                          <span className={`px-3 py-1 rounded-full bg-${q.color}-100 text-${q.color}-700`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* RESULTADOS PROPHET */}
          {prophetPrediction && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border">

              <h2 className="text-xl font-bold mb-4">Predicción Prophet (24h)</h2>

              {prophetPrediction.predictions.map(pred => {
                const date = new Date(pred.timestamp);
                const q = getAirQualityStatus(pred.predicted_pm25);

                return (
                  <div key={pred.horizon} className="p-4 border rounded-lg mb-4">
                    <h3 className="text-lg font-semibold mb-2">+24h</h3>

                    <p className="text-3xl font-bold">
                      {pred.predicted_pm25.toFixed(2)} μg/m³
                    </p>

                    <p className="text-gray-600 mt-2">{date.toLocaleString()}</p>

                    <span className={`inline-block mt-3 px-3 py-1 rounded-full bg-${q.color}-100 text-${q.color}-700`}>
                      {q.status}
                    </span>
                  </div>
                );
              })}

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PredictionsReal;
