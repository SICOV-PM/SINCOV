import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";

const HeatmapLayer = () => {
  const map = useMap();

  useEffect(() => {
    const heatData: [number, number, number?][] = [
      [4.65, -74.1, 0.8],
      [4.61, -74.08, 0.6],
      [4.63, -74.07, 0.9],
      [4.60, -74.05, 0.4],
    ];

    // @ts-ignore
    L.heatLayer(heatData, { radius: 25 }).addTo(map);
  }, [map]);

  return null;
};

const Monitoring = () => {
  return (
    <div className="h-screen w-full">
      <MapContainer
        center={[4.6097, -74.0817]} // Bogotá
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer />
      </MapContainer>
    </div>
  );
};

export default Monitoring;
