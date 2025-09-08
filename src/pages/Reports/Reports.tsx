import { useState } from "react";
import { Link } from "react-router-dom";

// Datos simulados de reportes
const sampleReports = [
  { id: 1, date: "2025-09-01", avg: 0.45, status: "Moderado" },
  { id: 2, date: "2025-09-02", avg: 0.32, status: "Bueno" },
  { id: 3, date: "2025-09-03", avg: 0.68, status: "Alto" },
  { id: 4, date: "2025-09-04", avg: 0.81, status: "Muy Alto" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Bueno":
      return "bg-green-100 text-green-700";
    case "Moderado":
      return "bg-yellow-100 text-yellow-700";
    case "Alto":
      return "bg-orange-100 text-orange-700";
    case "Muy Alto":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const Reports = () => {
  const [reports] = useState(sampleReports);

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
            <h1 className="text-xl font-bold text-gray-800">Reportes Históricos</h1>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="pt-20 px-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Promedios diarios de PM2.5
          </h2>

          {/* Tabla de reportes */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                    Promedio PM2.5
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-sm text-gray-800 border-b">
                      {report.date}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900 border-b">
                      {(report.avg * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen al final */}
          <div className="mt-6 text-sm text-gray-600">
            Total de reportes:{" "}
            <span className="font-semibold text-gray-900">{reports.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
