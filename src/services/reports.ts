import { apiFetch } from "./api";

export interface Report {
  date: string;
  avg: number;
  status: string;
}

export async function getReports(days: number = 7): Promise<{ reports: Report[] }> {
  return apiFetch(`/reports?days=${days}`);
}
