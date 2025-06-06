// src/pages/GameMap.tsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import api from "../api/api";

// Se você quiser personalizar o ícone do Marker (por ex. usar uma seta ou avatar).
const playerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", // ícone padrão do Leaflet
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Location {
  latitude: number;
  longitude: number;
  distance_traveled: number;
  timestamp: string;
}

export default function GameMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<any>(null);

  // 1) Ao montar, recupera a última posição do servidor
  useEffect(() => {
    async function fetchLatest() {
      try {
        const resp = await api.get<Location>("/location/latest");
        setPosition([resp.data.latitude, resp.data.longitude]);
      } catch {
        // Se não existe nenhuma posição salva, você pode esperar o watchPosition.
      }
    }
    fetchLatest();
  }, []);

  // 2) Assim que o componente montar, inicia o watchPosition
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta Geolocalização.");
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);

        // Chama o backend para salvar a nova posição
        try {
          await api.post("/location/update", {
            latitude,
            longitude,
          });
        } catch (err) {
          console.error("Erro ao atualizar localização:", err);
        }

        // Se o mapa já estiver renderizado, centraliza a View
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 17);
        }
      },
      (err) => {
        console.error("Erro na geolocalização:", err);
        alert("Não foi possível obter sua localização.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
    );

    // Cleanup: ao desmontar, para de “ouvir” a posição
    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  if (!position) {
    return <div>Carregando mapa e localização...</div>;
  }

  return (
    <MapContainer
      center={position}
      zoom={17}
      style={{ height: "100vh", width: "100%" }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        // Você pode trocar para um tile stylizado da Unicamp, caso exista.
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={playerIcon} />
    </MapContainer>
  );
}
