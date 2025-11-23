// src/services/reports.ts
import { apiFetch } from "./api";

export interface Report {
  station_id: number;
  station_name: string;
  lat: number;
  lng: number;
  pm25_value: number;
  status: string;
  timestamp: string;
  date: string;
}

export interface ReportsSummary {
  total_stations: number;
  avg_pm25: number;
  min_pm25: number;
  max_pm25: number;
  status_distribution: Record<string, number>;
}

export interface StationDetail {
  id: number;
  name: string;
  lat: number;
  lng: number;
  sensors: {
    type: string;
    promedio: number;
    minimo: number;
    maximo: number;
    unit: string;
    ultima_medicion: string;
  }[];
}

export interface StationReport24h {
  station_id: number;
  station_name: string;
  lat: number;
  lng: number;
  pm25: {
    type: string;
    unit: string;
    total_lecturas: number;
    promedio_24h: number;
    minimo_24h: number;
    maximo_24h: number;
    sma_4h: number;
    ultima_lectura: string;
    tendencia: string;
  } | null;
  other_monitors: Array<{
    type: string;
    unit: string;
    total_lecturas: number;
    promedio_24h: number;
    minimo_24h: number;
    maximo_24h: number;
    sma_4h: number;
    ultima_lectura: string;
    tendencia: string;
  }>;
  report_timestamp: string;
}

export async function getStationReport24h(stationId: number): Promise<{
  success: boolean;
  data: StationReport24h;
}> {
  return apiFetch(`/stations/${stationId}/report`);
}

export interface MonitorReport {
  station_id: number;
  station_name: string;
  lat: number;
  lng: number;
  monitor_type: string;
  value: number;
  unit: string;
  status: string;
  timestamp: string;
  
}

// Endpoints existentes
export async function getReports(): Promise<{ success: boolean; total: number; reports: Report[] }> {
  return apiFetch("/reports/");
}

export async function getReportsSummary(): Promise<{ success: boolean; data: ReportsSummary }> {
  return apiFetch("/reports/summary");
}

export async function getStationsSummary(): Promise<any[]> {
  const response = await apiFetch("/stations/summary/all");
  return response.data;
}

export async function getStationDetail(stationId: number): Promise<StationDetail> {
  return apiFetch(`/stations/${stationId}`);
}

// Funciones auxiliares para procesar datos
function calculateMonitorStatus(monitorType: string, value: number): string {
  if (monitorType === "PM2.5") {
    if (value >= 55.5) return "Muy Alto";
    if (value >= 35.5) return "Alto";
    if (value >= 12.1) return "Moderado";
    return "Bueno";
  } else if (monitorType === "PM10") {
    if (value >= 154) return "Muy Alto";
    if (value >= 54) return "Alto";
    if (value >= 12.1) return "Moderado";
    return "Bueno";
  } else if (monitorType === "O3") {
    if (value >= 0.125) return "Muy Alto";
    if (value >= 0.085) return "Alto";
    if (value >= 0.055) return "Moderado";
    return "Bueno";
  } else if (monitorType === "NO2") {
    if (value >= 0.36) return "Muy Alto";
    if (value >= 0.18) return "Alto";
    if (value >= 0.1) return "Moderado";
    return "Bueno";
  }
  return "Desconocido";
}

// Obtener reportes filtrados por tipo de monitor
export async function getReportsByMonitor(monitorType: string): Promise<{
  success: boolean;
  monitor_type: string;
  total: number;
  statistics: { avg: number; min: number; max: number };
  reports: MonitorReport[];
}> {
  const summaryData = await getStationsSummary();
  
  const reports: MonitorReport[] = [];
  const values: number[] = [];
  
  for (const station of summaryData) {
    const monitor = station.monitors?.find((m: any) => m.type === monitorType);
    
    if (monitor) {
      const value = monitor.promedio;
      values.push(value);
      
      reports.push({
        station_id: station.id,
        station_name: station.name,
        lat: station.lat,
        lng: station.lng,
        monitor_type: monitorType,
        value: value,
        unit: monitor.unit,
        status: calculateMonitorStatus(monitorType, value),
        timestamp: monitor.ultima_medicion
      });
    }
  }
  
  // Ordenar por valor descendente
  reports.sort((a, b) => b.value - a.value);
  
  const statistics = values.length > 0 ? {
    avg: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    min: parseFloat(Math.min(...values).toFixed(2)),
    max: parseFloat(Math.max(...values).toFixed(2))
  } : { avg: 0, min: 0, max: 0 };
  
  return {
    success: true,
    monitor_type: monitorType,
    total: reports.length,
    statistics,
    reports
  };
}

// Obtener todos los tipos de monitores disponibles
export async function getAvailableMonitors(): Promise<{
  success: boolean;
  total_types: number;
  monitor_types: string[];
  details: Record<string, { count: number; stations: string[] }>;
}> {
  const summaryData = await getStationsSummary();
  
  const monitorTypes = new Set<string>();
  const details: Record<string, { count: number; stations: string[] }> = {};
  
  for (const station of summaryData) {
    for (const monitor of station.monitors || []) {
      const type = monitor.type;
      monitorTypes.add(type);
      
      if (!details[type]) {
        details[type] = { count: 0, stations: [] };
      }
      
      details[type].count++;
      details[type].stations.push(station.name);
    }
  }
  
  return {
    success: true,
    total_types: monitorTypes.size,
    monitor_types: Array.from(monitorTypes).sort(),
    details
  };
}

// Obtener todos los monitores de una estación específica
export async function getStationAllMonitors(stationId: number): Promise<{
  success: boolean;
  station_id: number;
  station_name: string;
  lat: number;
  lng: number;
  total_monitors: number;
  monitors: {
    monitor_type: string;
    value: number;
    unit: string;
    status: string;
    timestamp: string;
    min: number;
    max: number;
  }[];
}> {
  const stationData = await getStationDetail(stationId);
  
  const monitors = stationData.sensors.map(sensor => ({
    monitor_type: sensor.type,
    value: sensor.promedio,
    unit: sensor.unit,
    status: calculateMonitorStatus(sensor.type, sensor.promedio),
    timestamp: sensor.ultima_medicion,
    min: sensor.minimo,
    max: sensor.maximo
  }));
  
  return {
    success: true,
    station_id: stationData.id,
    station_name: stationData.name,
    lat: stationData.lat,
    lng: stationData.lng,
    total_monitors: monitors.length,
    monitors
  };
}