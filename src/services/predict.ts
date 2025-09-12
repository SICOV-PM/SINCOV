import { apiFetch } from "./api";

export async function predictPM25(features: number[]) {
  return apiFetch("/predict/", {
    method: "POST",
    body: JSON.stringify({ features }),
  });
}
