// src/pages/Monitoring/Monitoring.tsx
import L from "leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import BaseMap from "../../components/map/BaseMap";
import LocalitiesLayer from "../../components/map/LocalitiesLayer";
import type { Station } from "../../services/stations";
import { getStations } from "../../services/stations";
import "./Monitoring.css";

type HeatPoint = [number, number, number];


const getAirQualityInfo = (value: number) => {
  if (value >= 151.4) return { level: "Peligroso", color: "text-purple-600", bg: "bg-purple-100", circleColor: "#5126dcff" };
  if (value >= 55.5) return { level: "Alto", color: "text-red-600", bg: "bg-red-100", circleColor: "#dc2626" };
  if (value >= 35.5) return { level: "Regular", color: "text-orange-600", bg: "bg-orange-100", circleColor: "#f9883cff" };
  if (value >= 12.1) return { level: "Moderado", color: "text-yellow-400", bg: "bg-yellow-50", circleColor: "#e5fb1cff" };
  return { level: "Bajo", color: "text-green-600", bg: "bg-green-100", circleColor: "#16a34a" };
};


const BubbleMarkers = ({
  points,
  stations,
}: { 
  points: HeatPoint[]; 
  stations: Station[];
}) => {
  const map = useMap();
  const FIXED_RADIUS = 25; 

  useEffect(() => {
    if (!map || points.length === 0) return;

    const markers: L.CircleMarker[] = [];

    points.forEach((point, index) => {
      const [lat, lng, value] = point;
      const station = stations[index];
      const { circleColor } = getAirQualityInfo(value);

      const bubble = L.circleMarker([lat, lng], {
        radius: FIXED_RADIUS, // Tamaño fijo
        fillColor: circleColor,
        color: "#ffffff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.7,
      });

      const tooltipContent = `
        <div style="text-align: center; padding: 4px;">
          <div style="font-weight: bold; font-size: 16px; color: #000;">
            ${value.toFixed(1)}
          </div>
          ${station?.name ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${station.name}</div>` : ''}
        </div>
      `;

      bubble.bindTooltip(tooltipContent, {
        permanent: true,
        direction: "center",
        className: "bubble-label",
        opacity: 1,
      });

      const popupContent = `
        <div style="padding: 8px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${station?.name || 'Estación'}
          </div>
          <div style="font-size: 18px; font-weight: bold; color: ${circleColor};">
            PM2.5: ${value.toFixed(1)}
          </div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">
            ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
        </div>
      `;

      bubble.bindPopup(popupContent);
      bubble.addTo(map);
      markers.push(bubble);
    });

    const style = document.createElement("style");
    style.textContent = `
      .bubble-label {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        font-weight: bold;
        text-shadow: 
          -1px -1px 0 #fff,
          1px -1px 0 #fff,
          -1px 1px 0 #fff,
          1px 1px 0 #fff,
          0 0 8px rgba(255,255,255,0.8);
      }
      .bubble-label::before {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      markers.forEach((marker) => marker.remove());
      style.remove();
    };
  }, [map, points, stations]);

  return null;
};

// Componente de métricas reutilizable
const MetricsPanel = ({ stats }: { stats: ReturnType<typeof getStatistics> }) => {
  if (!stats) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Métricas en Tiempo Real
      </h2>
      <div className="space-y-3">
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
                {stats.averagePM.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 font-medium">Máximo</div>
            <div className="text-lg font-bold text-red-700">
              {stats.maxPM.toFixed(1)}
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-600 font-medium">Mínimo</div>
            <div className="text-lg font-bold text-green-700">
              {stats.minPM.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 font-medium">Estaciones Activas</div>
              <div className="text-xl font-bold text-gray-800">
                {stats.validCount}/19
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
  );
};


const getStatistics = (heatData: HeatPoint[]) => {
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

  return { 
    averagePM, 
    maxPM, 
    minPM, 
    statusCount, 
    validCount: validData.length,
    totalCount: heatData.length
  };
};

const Monitoring = () => {
  const [showPanel, setShowPanel] = useState(true);
  const [heatData, setHeatData] = useState<HeatPoint[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocalities, setShowLocalities] = useState(true);

  useEffect(() => {
    getStations()
      .then((data) => {
        const formatted: HeatPoint[] = data.stations.map((s: Station) => [
          s.lat,
          s.lng,
          s.value,
        ]);
        setHeatData(formatted);
        setStations(data.stations);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = getStatistics(heatData);

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Volver</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-800">Monitoreo PM2.5</h1>
          </div>
        </div>
      </header>

      {/* Layout principal */}
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
              {showLocalities && <LocalitiesLayer showLabels={false} opacity={0.25} />}
              <BubbleMarkers points={heatData} stations={stations} />
            </BaseMap>
          )}
        </div>

        {/* Panel lateral */}
        <div className={`monitoring-panel slide-panel ${showPanel ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full w-80 glass-panel shadow-xl relative">
            {/* Toggle button */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="absolute -left-12 top-6 w-10 h-10 glass-panel border border-gray-200 rounded-l-lg shadow-lg flex items-center justify-center control-button panel-toggle"
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${showPanel ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Contenido del panel */}
            <div className="p-6 h-full overflow-y-auto panel-scroll pb-16">
              <MetricsPanel stats={stats} />

              {/* Controles - Solo checkbox de localidades */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Controles del Mapa</h3>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLocalities}
                      onChange={(e) => setShowLocalities(e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mostrar límites de localidades
                    </span>
                  </label>
                </div>
              </div>

              {/* Lista de estaciones */}
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
                      const station = stations[index];
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
                                  {station?.name || `Estación ${index + 1}`}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {point[0].toFixed(4)}, {point[1].toFixed(4)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">
                                {point[2] !== undefined ? value.toFixed(1) : "N/A"}
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

               {/* Leyenda IBOCA */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Índice IBOCA - PM2.5
                </h3>
                <div className="text-xs text-gray-500 mb-3 italic bg-blue-50 p-2 rounded border border-blue-100">
                  Valores de PM2.5 (μg/m³)
                </div>
                <div className="space-y-2">
                  {[
                    { level: "Favorable", color: "#3b82f6", bgColor: "bg-blue-50", textColor: "text-blue-700", range: "0 - 12.0" },
                    { level: "Moderada", color: "#22c55e", bgColor: "bg-green-50", textColor: "text-green-700", range: "12.1 - 35.4" },
                    { level: "Regular", color: "#eab308", bgColor: "bg-yellow-50", textColor: "text-yellow-700", range: "35.5 - 55.4" },
                    { level: "Mala", color: "#f97316", bgColor: "bg-orange-50", textColor: "text-orange-700", range: "55.5 - 150.4" },
                    { level: "Muy Mala", color: "#dc2626", bgColor: "bg-red-50", textColor: "text-red-700", range: "150.5 - 250.4" },
                    { level: "Peligrosa", color: "#9333ea", bgColor: "bg-purple-50", textColor: "text-purple-700", range: "≥ 250.5" }
                  ].map(({ level, color, bgColor, textColor, range }) => (
                    <div key={level} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg border border-gray-200 hover:shadow-sm transition-shadow`}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full shadow-sm border-2 border-white" 
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className={`font-semibold text-sm ${textColor}`}>{level}</span>
                      </div>
                      <span className="text-xs text-gray-600 font-mono font-medium">{range}</span>
                    </div>
                  ))}
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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