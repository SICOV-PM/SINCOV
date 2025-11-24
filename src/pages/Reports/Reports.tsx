import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Report, ReportsSummary, StationReport24h } from "../../services/reports";
import {
  getAvailableMonitors,
  getReports,
  getReportsByMonitor,
  getReportsSummary,
  getStationReport24h // Nueva importación
} from "../../services/reports";

interface MonitorReport {
  station_id: number;
  station_name: string;
  lat: number;
  lng: number;
  monitor_type: string;
  value: number;
  status: string;
  unit: string;
  timestamp: string;
  date: string;
}

type ReportData = Report | MonitorReport;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Bueno":
      return "bg-green-100 text-green-700 border-green-200";
    case "Moderado":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Alto":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Muy Alto":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTrendColor = (trend: string) => {
  if (trend.includes('Alza') || trend.includes('Aumento')) return 'text-red-600';
  if (trend.includes('Baja') || trend.includes('Descenso')) return 'text-green-600';
  if (trend.includes('Estable')) return 'text-blue-600';
  return 'text-gray-600';
};


const ReporteDetallado = ({ 
  stationId, 
  onBack 
}: { 
  stationId: number; 
  onBack: () => void;
}) => {
  const [reportData, setReportData] = useState<StationReport24h | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getStationReport24h(stationId);
        setReportData(response.data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar el reporte';
        setError(errorMsg);
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [stationId]);

  const handleDownloadPDF = () => {
    alert(`Descarga de PDF será implementada próximamente.\nEstación: ${reportData?.station_name}`);
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Cargando reporte...</span>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button 
          onClick={onBack} 
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-1 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Estado de Estaciones
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar el reporte</h3>
          <p className="text-red-700">{error || 'No se pudo cargar el reporte'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button 
        onClick={onBack} 
        className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-1 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a Estado de Estaciones
      </button>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
                Reporte Ejecutivo General - {reportData.station_name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Generado: {new Date(reportData.report_timestamp).toLocaleString('es-CO')}
            </p>
          </div>
          
        </div>

       
        {reportData.pm25 ? (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              PM2.5 - Resumen de las Últimas 24 Horas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Promedio PM2.5 (24h)</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {reportData.pm25.promedio_24h.toFixed(1)} {reportData.pm25.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.pm25.total_lecturas} lecturas
                </p>
              </div>

              <div className="border-l-4 border-red-500 p-4 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Pico Máximo PM2.5 (24h)</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {reportData.pm25.maximo_24h.toFixed(1)} {reportData.pm25.unit}
                </p>
                <p className={`text-sm mt-1 font-medium ${getTrendColor('Alto Nivel')}`}>
                  Alto Nivel
                </p>
              </div>

              <div className="border-l-4 border-purple-500 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Media Móvil PM2.5 (SMA 4h)</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {reportData.pm25.sma_4h.toFixed(1)} {reportData.pm25.unit}
                </p>
                <p className={`text-sm mt-1 font-medium ${getTrendColor(reportData.pm25.tendencia)}`}>
                  {reportData.pm25.tendencia}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800 font-medium">
               No hay datos de PM2.5 disponibles para esta estación en las últimas 24 horas
            </p>
          </div>
        )}

       
        {reportData.other_monitors.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-6">
              Otros Contaminantes Clave (Últimas 24 Horas)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportData.other_monitors.map((monitor, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-gray-800">{monitor.type}</p>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {monitor.total_lecturas} lecturas
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold">Promedio 24h:</span>
                      <span>{monitor.promedio_24h.toFixed(2)} {monitor.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Pico Máximo:</span>
                      <span>{monitor.maximo_24h.toFixed(2)} {monitor.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Pico Mínimo:</span>
                      <span>{monitor.minimo_24h.toFixed(2)} {monitor.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Media Móvil (4h):</span>
                      <span>{monitor.sma_4h.toFixed(2)} {monitor.unit}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <p className={`font-medium ${getTrendColor(monitor.tendencia)}`}>
                          Tendencia: {monitor.tendencia}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">
              No hay otros monitores con datos disponibles para esta estación
            </p>
          </div>
        )}

       
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2"> Información del Reporte</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Los datos corresponden a las últimas 24 horas de medición</p>
            <p>• La Media Móvil (SMA 4h) representa el promedio de las últimas 4 horas</p>
            <p>• Las tendencias se calculan comparando la media móvil con el promedio de 24h</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const Reports = () => {
  const [viewMode, setViewMode] = useState<"pm25" | "monitor">("pm25");
  const [reports, setReports] = useState<Report[]>([]);
  const [monitorReports, setMonitorReports] = useState<MonitorReport[]>([]);
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [availableMonitors, setAvailableMonitors] = useState<string[]>([]);
  const [selectedMonitor, setSelectedMonitor] = useState<string>("PM2.5");
  const [monitorStats, setMonitorStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
 
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        const data = await getAvailableMonitors();
        setAvailableMonitors(data.monitor_types);
      } catch (err) {
        console.error("Error fetching monitors:", err);
      }
    };
    fetchMonitors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (viewMode === "pm25") {
          const [reportsData, summaryData] = await Promise.all([
            getReports(),
            getReportsSummary()
          ]);
          setReports(reportsData.reports);
          setSummary(summaryData.data);
        } else {
          const data = await getReportsByMonitor(selectedMonitor);
          setMonitorReports(data.reports as MonitorReport[]);
          setMonitorStats(data.statistics);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar los datos";
        setError(errorMessage);
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode, selectedMonitor]);

  // Si hay una estación seleccionada, mostrar el reporte detallado
  if (selectedStationId) {
    return (
      <ReporteDetallado 
        stationId={selectedStationId} 
        onBack={() => setSelectedStationId(null)} 
      />
    );
  }

  
  return (
    <div className="relative min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
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
            <h1 className="text-xl font-bold text-gray-800">Estado de Estaciones</h1>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">
              {viewMode === "pm25" ? reports.length : monitorReports.length} Estaciones
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* View Mode Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("pm25")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "pm25"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Vista PM2.5
              </button>
              <button
                onClick={() => setViewMode("monitor")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "monitor"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Por Monitor
              </button>
            </div>

            {viewMode === "monitor" && availableMonitors.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Tipo de Monitor:
                </label>
                <select
                  value={selectedMonitor}
                  onChange={(e) => setSelectedMonitor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                >
                  {availableMonitors.map((monitor) => (
                    <option key={monitor} value={monitor}>
                      {monitor}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Cargando reportes...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar datos</h3>
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Statistics Summary */}
            {viewMode === "pm25" && summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promedio General</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof summary.avg_pm25 === 'number' ? summary.avg_pm25.toFixed(1) : 'N/A'} µg/m³
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Máximo</p>
                      <p className="text-2xl font-bold text-red-600">
                        {typeof summary.max_pm25 === 'number' ? summary.max_pm25.toFixed(1) : 'N/A'} µg/m³
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mínimo</p>
                      <p className="text-2xl font-bold text-green-600">
                        {typeof summary.min_pm25 === 'number' ? summary.min_pm25.toFixed(1) : 'N/A'} µg/m³
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monitor Statistics */}
            {viewMode === "monitor" && monitorStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promedio</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof monitorStats.avg === 'number' ? monitorStats.avg.toFixed(2) : monitorStats.avg || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promedio Máximo</p>
                      <p className="text-2xl font-bold text-red-600">
                        {typeof monitorStats.max === 'number' ? monitorStats.max.toFixed(2) : monitorStats.max || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promedio Mínimo</p>
                      <p className="text-2xl font-bold text-green-600">
                        {typeof monitorStats.min === 'number' ? monitorStats.min.toFixed(2) : monitorStats.min || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">
                  {viewMode === "pm25" 
                    ? "Estado Actual PM2.5 por Estación"
                    : `Estado Actual ${selectedMonitor} por Estación`
                  }
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Datos en tiempo real de {viewMode === "pm25" ? reports.length : monitorReports.length} estaciones de monitoreo
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estación
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Última Actualización
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {viewMode === "pm25" ? "Concentración PM2.5" : `Promedio ${selectedMonitor}`}
                      </th>
                      {viewMode === "pm25" && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Estado
                        </th>
                      )}                 
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {viewMode === "pm25" 
                      ? reports.map((report) => (
                          <tr key={report.station_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {report.station_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {report.date}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">
                                {typeof report.pm25_value === 'number' ? report.pm25_value.toFixed(1) : 'N/A'} µg/m³
                              </div>
                              <div className="text-xs text-gray-500">
                                Partículas finas
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  report.status
                                )}`}
                              >
                                {report.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => setSelectedStationId(report.station_id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-4 rounded-md transition duration-150 shadow-sm font-medium"
                                title="Ver Reporte Detallado"
                              >
                                Ver Reporte
                              </button>
                            </td>
                          </tr>
                        ))
                      : monitorReports.map((report) => (
                          <tr key={report.station_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {report.station_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(report.timestamp).toISOString().slice(0, 10)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">
                                {typeof report.value === 'number' ? report.value.toFixed(1) : 'N/A'} {report.unit}
                              </div>
                              <div className="text-xs text-gray-500">
                                {report.monitor_type}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => setSelectedStationId(report.station_id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-4 rounded-md transition duration-150 shadow-sm font-medium"
                                title="Ver Reporte Detallado"
                              >
                                Ver Reporte
                              </button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;