import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Componente para ajustar el centro del mapa
const MapCenter = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      // Ajusta el zoom y el centro del mapa con un padding adicional
      map.fitBounds(bounds, {
        animate: true,
        padding: [0.5, 0.5] // Ajusta estos valores para mayor o menor espacio alrededor de los límites
      });
    }
  }, [bounds, map]);

  return null;
};

const MapView = ({ provincia, geojsonData }) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => {
    if (provincia && geojsonData) {
      const provinceFeature = geojsonData.features.find(
        feature => feature.properties.NAME === provincia
      );
      if (provinceFeature) {
        setSelectedProvince(provinceFeature);

        // Obtener las coordenadas y calcular los límites
        const coordinates = provinceFeature.geometry.type === 'Polygon'
          ? [provinceFeature.geometry.coordinates]
          : provinceFeature.geometry.coordinates;

        // Aplanar las coordenadas para GeoJSON tipo Polygon o MultiPolygon
        const latLngs = coordinates.flat(2).map(coord => [coord[1], coord[0]]); // Convierte [lon, lat] a [lat, lon]

        // Crear bounds para el mapa
        const bounds = L.latLngBounds(latLngs);
        setMapBounds(bounds); // Establecer los límites del mapa
      } else {
        setMapBounds(null); // Si no se encuentra la provincia, restablecer los límites
      }
    }
  }, [provincia, geojsonData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.NAME) {
      layer.bindPopup(feature.properties.NAME);
    }

    // Aplicar el estilo solo a la provincia seleccionada
    if (selectedProvince && feature.properties.NAME === selectedProvince.properties.NAME) {
      layer.setStyle({
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.4,
      });
    } else {
      layer.setStyle({
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.2,
      });
    }
  };

  return (
    <div className="map-container">
      <h3 className="text-center">Mapa del Ecuador</h3>
      <MapContainer center={[-1.831239, -78.183406]} zoom={6} style={{ height: '400px', width: '100%', border: '2px solid #007bff', borderRadius: '10px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geojsonData && (
          <GeoJSON data={geojsonData} onEachFeature={onEachFeature} />
        )}
        {mapBounds && <MapCenter bounds={mapBounds} />}
      </MapContainer>
    </div>
  );
};

export default MapView;
