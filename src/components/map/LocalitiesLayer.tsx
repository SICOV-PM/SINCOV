import type { Feature, FeatureCollection } from "geojson";
import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

/**
 * Capa de localidades de Bogotá usando datos reales desde el servicio oficial IDECA.
 * Fuente: https://servicios1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Mapa_Referencia/FeatureServer/48
 */

const LOCALIDADES_URL =
  "https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Mapa_Referencia/FeatureServer/48/query?where=1=1&outFields=*&f=geojson";

interface LocalitiesLayerProps {
  showLabels?: boolean;
  opacity?: number;
}

const LocalitiesLayer = ({
  showLabels = true,
  opacity = 0.25,
}: LocalitiesLayerProps) => {
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("localidades_geojson");
    if (cached) {
      setData(JSON.parse(cached));
      return;
    }

    fetch(LOCALIDADES_URL)
      .then((res) => res.json())
      .then((geojson) => {
        setData(geojson);
        localStorage.setItem("localidades_geojson", JSON.stringify(geojson));
      })
      .catch((err) => console.error("Error cargando localidades:", err));
  }, []);

  if (!data) return null;

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#F7DC6F",
    "#FDCB6E",
    "#E17055",
    "#A29BFE",
    "#FAB1A0",
    "#74B9FF",
    "#55EFC4",
    "#96CEB4",
    "#FD79A8",
    "#636E72",
    "#00B894",
    "#00CEC9",
    "#FFEAA7",
    "#81C784",
    "#6C5CE7",
  ];

  const getColor = (id: number) => colors[id % colors.length];

  return (
    <GeoJSON
      data={data}
      style={(feature: Feature) => ({
        color: getColor(feature.id as number),
        weight: 1.2,
        fillOpacity: opacity,
        fillColor: getColor(feature.id as number),
      })}
      onEachFeature={(feature, layer) => {
        const nombre = feature.properties?.NOMBRE || "";

        if (showLabels) {
          layer.bindTooltip(nombre, {
            permanent: true,
            direction: "center",
            className: "locality-tooltip",
          });
        }

        // Animación de hover
        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              fillOpacity: 0.45,
            });
          },
          mouseout: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 1.2,
              fillOpacity: opacity,
            });
          },
        });
      }}
    />
  );
};

export default LocalitiesLayer;
