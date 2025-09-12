import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ReactNode } from "react";

interface BaseMapProps {
  center: [number, number];
  zoom: number;
  children?: ReactNode;
}

const BaseMap = ({ center, zoom, children }: BaseMapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
};

export default BaseMap;
