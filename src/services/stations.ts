import { apiFetch } from "./api";

export interface Station {
  id: number;
  lat: number;
  lng: number;
  value: number;
}

export async function getStations(): Promise<{ stations: Station[] }> {
  return apiFetch("/stations/");
}

