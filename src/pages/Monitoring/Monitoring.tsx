import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BaseMap from "../../components/map/BaseMap";
import HeatmapLayer from "../../components/map/HeatmapLayer";
import type { HeatPoint } from "../../components/map/HeatmapLayer";
import { getStations } from "../../services/stations";
import type { Station } from "../../services/stations";
import "./Monitoring.css";

const Monitoring = () => {
  const [selectedRadius, setSelectedRadius] = useState(25);
  const [showPanel, setShowPanel] = useState(true);
  const [heatData, setHeatData] = useState<HeatPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar estaciones desde el backend
  useEffect(() => {
    getStations()
      .then((data) => {
        const formatted: HeatPoint[] = data.stations.map((s: Station) => [
          s.lat,
          s.lng,
          s.value,
        ]);
        setHeatData(formatted);
      })
      .finally(() => setLoading(false));
  }, []);

  // Función para calcular nivel de calidad del aire
  const getAirQualityInfo = (value: number) => {
    if (value >= 0.8) return { level: "Muy Alto", color: "text-red-600", bg: "bg-red-100", icon: "⚠️" };
    if (value >= 0.6) return { level: "Alto", color: "text-orange-600", bg: "bg-orange-100", icon: "📊" };
    if (value >= 0.4) return { level: "Moderado", color: "text-yellow-600", bg: "bg-yellow-100", icon: "⚡" };
    return { level: "Bueno", color: "text-green-600", bg: "bg-green-100", icon: "✅" };
  };

  // Calcular estadísticas
  const getStatistics = () => {
    if (heatData.length === 0) return null;
    
    const validData = heatData.filter(point => point[2] !== undefined);
    const values = validData.map(point => point[2] as number);
    
    const averagePM = values.reduce((sum, val) => sum + val, 0) / values.length;
    const maxPM = Math.max(...values);
    const minPM = Math.min(...values);
    
    const statusCount = validData.reduce((acc, point) => {
      const quality = getAirQualityInfo(point[2] as number);
      acc[quality.level] = (acc[quality.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { averagePM, maxPM, minPM, statusCount, validCount: validData.length };
  };

  const stats = getStatistics();
  const currentAirQuality = stats ? getAirQualityInfo(stats.averagePM) : getAirQualityInfo(0);

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
        </div>
      </header>

      {/* Layout principal: mapa + panel lateral */}
      <div className="h-full w-full pt-16 flex">
        {/* Mapa */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-gray-600 font-medium">Cargando estaciones...</span>
              </div>
            </div>
          ) : (
            <BaseMap center={[4.6097, -74.0817]} zoom={12}>
              <HeatmapLayer points={heatData} radius={selectedRadius} />
            </BaseMap>
          )}
        </div>

        {/* Panel lateral */}
        <div
          className={`monitoring-panel slide-panel ${
            showPanel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full w-80 glass-panel shadow-xl relative">
            {/* Botón toggle */}
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

            {/* Contenido del panel con padding bottom para el footer */}
            <div className="p-6 h-full overflow-y-auto panel-scroll pb-16">
              {/* Métricas principales */}
              {stats && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Métricas en Tiempo Real
                  </h2>
                  <div className="space-y-3">
                    {/* Promedio General */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-blue-700 font-medium">Promedio PM2.5</div>
                          <div className="text-2xl font-bold text-blue-900">
                            {(stats.averagePM * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grid de estadísticas secundarias */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-xs text-red-600 font-medium">Máximo</div>
                        <div className="text-lg font-bold text-red-700">
                          {(stats.maxPM * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs text-green-600 font-medium">Mínimo</div>
                        <div className="text-lg font-bold text-green-700">
                          {(stats.minPM * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Información de estaciones */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 font-medium">Estaciones Activas</div>
                          <div className="text-xl font-bold text-gray-800">
                            {stats.validCount}/{heatData.length}
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Controles del Mapa
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Radio del Mapa de Calor
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-medium">10px</span>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={selectedRadius}
                        onChange={(e) => setSelectedRadius(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-xs text-gray-500 font-medium">50px</span>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm font-bold text-blue-600">{selectedRadius}px</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de estaciones mejorada */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Estaciones de Monitoreo
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {heatData.map((point, index) => {
                      const value = point[2] ?? 0;
                      const quality = getAirQualityInfo(value);
                      return (
                        <div
                          key={index}
                          className="p-3 bg-white border border-gray-200 rounded-lg station-card hover:border-blue-300 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${quality.color.replace('text', 'bg')}`}></div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  Estación {String(index + 1).padStart(2, '0')}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {point[0].toFixed(4)}, {point[1].toFixed(4)}
                                </div>
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
                )}
              </div>

              {/* Leyenda mejorada */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Leyenda de Calidad del Aire
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                      <span className="font-medium">Bueno</span>
                    </div>
                    <span className="text-xs text-gray-600">0-40%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span className="font-medium">Moderado</span>
                    </div>
                    <span className="text-xs text-gray-600">40-60%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                      <span className="font-medium">Alto</span>
                    </div>
                    <span className="text-xs text-gray-600">60-80%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                      <span className="font-medium">Muy Alto</span>
                    </div>
                    <span className="text-xs text-gray-600">80-100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer flotante mejorado */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="glass-panel rounded-2xl shadow-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full status-indicator"></div>
                <span className="text-sm font-medium text-gray-700">En vivo</span>
              </div>
              <div className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleTimeString('es-ES')}
              </div>
              {stats && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{stats.validCount}</span> estaciones activas
                </div>
              )}
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
    </div>
  );
};

export default Monitoring;