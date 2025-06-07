import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../api/api";
import PlayerMenu from "../components/PlayerMenu";

// Ícone do jogador
const playerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
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

// Componente auxiliar para centralizar o mapa após renderização
function MapInitializer({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 17);
  }, [position]);

  return null;
}

export default function GameMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  // Recupera a última posição do servidor
  useEffect(() => {
    async function fetchLatest() {
      try {
        const resp = await api.get<Location>("/location/latest");
        setPosition([resp.data.latitude, resp.data.longitude]);
      } catch {
        // Se não existe nenhuma posição salva, pode esperar o watchPosition
      }
    }
    fetchLatest();
  }, []);

  // Geolocalização em tempo real
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta Geolocalização.");
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);

        try {
          await api.post("/location/update", { latitude, longitude });
        } catch (err) {
          console.error("Erro ao atualizar localização:", err);
        }
      },
      (err) => {
        console.error("Erro na geolocalização:", err);
        alert("Não foi possível obter sua localização.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  if (!position) {
    return <div>Carregando mapa e localização...</div>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    >
      <MapContainer
        center={position}
        zoom={17}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={playerIcon} />
        <MapInitializer position={position} />
      </MapContainer>

      <PlayerMenu />
    </div>
  );
}
