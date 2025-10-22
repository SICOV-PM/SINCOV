// src/pages/reports/Reports.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Report, ReportsSummary } from "../../services/reports";
import { getAvailableMonitors, getReports, getReportsByMonitor, getReportsSummary } from "../../services/reports";

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

interface MonitorReport {
  station_id: number;
  station_name: string;
  lat: number;
  lng: number;
  monitor_type: string;
  value: number;
  status: string;
  timestamp: string;
  date: string;
}

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

  // Fetch available monitors on mount
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

  // Fetch data based on view mode
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
          setMonitorReports(data.reports);
          setMonitorStats(data.statistics);
        }
      } catch (err)   {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar los datos";
        setError(errorMessage);
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode, selectedMonitor]);

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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promedio General</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.avg_pm25.toFixed(1)} µg/m³</p>
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
                      <p className="text-2xl font-bold text-red-600">{summary.max_pm25.toFixed(1)} µg/m³</p>
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
                      <p className="text-2xl font-bold text-green-600">{summary.min_pm25.toFixed(1)} µg/m³</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Estaciones</p>
                      <p className="text-2xl font-bold text-purple-600">{summary.total_stations}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{monitorStats.avg}</p>
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
                      <p className="text-sm font-medium text-gray-600"> Promedio Máximo</p>
                      <p className="text-2xl font-bold text-red-600">{monitorStats.max}</p>
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
                      <p className="text-sm font-medium text-gray-600"> Promedio Mínimo</p>
                      <p className="text-2xl font-bold text-green-600">{monitorStats.min}</p>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
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
                                {report.pm25_value.toFixed(1)} µg/m³
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
                                {report.date}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">
                                {report.value.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {report.monitor_type}
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
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Última actualización:</span> {new Date().toLocaleDateString('es-ES')}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Sistema:</span> SINCOV-PM
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;