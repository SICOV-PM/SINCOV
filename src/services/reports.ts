import { apiFetch } from "./api";

export async function getReports(days: number = 7) {
  return apiFetch(`/reports?days=${days}`);
}
