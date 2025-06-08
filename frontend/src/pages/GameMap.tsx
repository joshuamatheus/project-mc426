import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../api/api";
import PlayerMenu from "../components/PlayerMenu";

interface Location {
  latitude: number;
  longitude: number;
  distance_traveled: number;
  timestamp: string;
}

interface Player {
  id: number;
  name: string;
  email: string;
  team: string;
  avatar?: string;
  trainer_type?: string;
  created_at: string;
}

// Função para criar ícone personalizado com emoji
function createEmojiIcon(emoji: string = "🎓") {
  return L.divIcon({
    html: `<div style="
      font-size: 24px;
      text-align: center;
      line-height: 1;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    ">${emoji}</div>`,
    className: 'emoji-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
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
  const [playerAvatar, setPlayerAvatar] = useState("🎓");
  const [playerIcon, setPlayerIcon] = useState(createEmojiIcon());

  // Recupera dados do jogador para o avatar
  useEffect(() => {
    async function fetchPlayerAvatar() {
      try {
        const resp = await api.get<Player>("/users/me");
        if (resp.data.avatar) {
          setPlayerAvatar(resp.data.avatar);
          setPlayerIcon(createEmojiIcon(resp.data.avatar));
        }
      } catch (error) {
        console.error("Erro ao carregar avatar do jogador:", error);
      }
    }
    fetchPlayerAvatar();
  }, []);

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

  // Função para atualizar o avatar (será chamada pelo PlayerMenu)
  const handleAvatarUpdate = (newAvatar: string) => {
    setPlayerAvatar(newAvatar);
    setPlayerIcon(createEmojiIcon(newAvatar));
  };

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

      <PlayerMenu 
        onAvatarUpdate={handleAvatarUpdate}
      />
    </div>
  );
}