import { useState } from "react";
import { Link } from "react-router-dom";
import BaseMap from "../../components/map/BaseMap";
import HeatmapLayer from "../../components/map/HeatmapLayer";
import type { HeatPoint } from "../../components/map/HeatmapLayer";
import "./Monitoring.css";

const Monitoring = () => {
  const [selectedRadius, setSelectedRadius] = useState(25);
  const [showPanel, setShowPanel] = useState(true);

  // Datos simulados de PM2.5 normalizados (0–1)
  const heatData: HeatPoint[] = [
    [4.65, -74.1, 0.8],
    [4.61, -74.08, 0.6],
    [4.63, -74.07, 0.9],
    [4.60, -74.05],
  ];

  // Función para obtener el nivel de calidad del aire
  const getAirQualityInfo = (value: number) => {
    if (value >= 0.8) return { level: "Muy Alto", color: "text-red-600", bg: "bg-red-100" };
    if (value >= 0.6) return { level: "Alto", color: "text-orange-600", bg: "bg-orange-100" };
    if (value >= 0.4) return { level: "Moderado", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Bueno", color: "text-green-600", bg: "bg-green-100" };
  };

  // Promedio protegido
  const averagePM =
    heatData.reduce((sum, point) => sum + (point[2] ?? 0), 0) / heatData.length;
  const currentAirQuality = getAirQualityInfo(averagePM);

  return (
    <div className="relative h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Volver</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-800">Monitoreo PM2.5</h1>
          </div>

          {/* Status indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${currentAirQuality.bg}`}
          >
            <div
              className={`w-2 h-2 rounded-full status-indicator ${currentAirQuality.color.replace(
                "text",
                "bg"
              )}`}
            ></div>
            <span className={`text-sm font-medium ${currentAirQuality.color}`}>
              {currentAirQuality.level}
            </span>
          </div>
        </div>
      </header>

      {/* Layout principal: mapa + panel */}
      <div className="h-full w-full pt-16 flex">
        {/* Mapa */}
        <div className="flex-1">
          <BaseMap center={[4.6097, -74.0817]} zoom={12}>
            <HeatmapLayer points={heatData} radius={selectedRadius} />
          </BaseMap>
        </div>

        {/* Panel lateral */}
        <div
          className={`monitoring-panel slide-panel ${
            showPanel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full w-80 glass-panel shadow-xl relative">
            {/* Toggle button */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="absolute -left-12 top-6 w-10 h-10 glass-panel border border-gray-200 rounded-l-lg shadow-lg flex items-center justify-center control-button panel-toggle"
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  showPanel ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="p-6 h-full overflow-y-auto panel-scroll">
              {/* Información general */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Información General
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">
                      Promedio PM2.5
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {(averagePM * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">
                      Puntos de Monitoreo
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {heatData.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Controles
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radio del Mapa de Calor: {selectedRadius}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={selectedRadius}
                      onChange={(e) => setSelectedRadius(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de estaciones */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Estaciones de Monitoreo
                </h3>
                <div className="space-y-2">
                  {heatData.map((point, index) => {
                    const value = point[2] ?? 0;
                    const quality = getAirQualityInfo(value);
                    return (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg station-card"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">
                              Estación {index + 1}
                            </div>
                            <div className="text-xs text-gray-500">
                              {point[0].toFixed(4)}, {point[1].toFixed(4)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">
                              {point[2] !== undefined
                                ? `${(value * 100).toFixed(1)}%`
                                : "N/A"}
                            </div>
                            <div className={`text-xs font-medium ${quality.color}`}>
                              {quality.level}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leyenda */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Leyenda
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span>Bueno (0-40%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <span>Moderado (40-60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-400 rounded"></div>
                    <span>Alto (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span>Muy Alto (80-100%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información flotante inferior */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="glass-panel rounded-2xl shadow-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full status-indicator"></div>
              <span className="text-sm font-medium text-gray-700">En vivo</span>
            </div>
            <div className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Sistema SINCOV-PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
