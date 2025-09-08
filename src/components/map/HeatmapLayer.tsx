import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

// Tipado para puntos de calor
export type HeatPoint = [number, number, number?];

interface HeatmapLayerProps {
  points: HeatPoint[];
  radius?: number;
}

const HeatmapLayer = ({ points, radius = 25 }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // @ts-ignore (leaflet.heat no tiene tipos TS oficiales)
    const layer = L.heatLayer(points, { radius }).addTo(map);

    return () => {
      map.removeLayer(layer); // cleanup al desmontar
    };
  }, [map, points, radius]);

  return null;
};

export default HeatmapLayer;
