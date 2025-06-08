import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, Popup} from "react-leaflet";
import L from "leaflet";
import api from "../api/api";
import PlayerMenu from "../components/PlayerMenu";
import pointsOfInterest from "../assets/pointsOfInterest.json";

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

interface PointOfInterest {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

const iconMap: Record<string, string> = {
  library: "📚",
  square: "🌳",
  building: "🏢",
  restaurant: "🍽",
  auditorium: "🏛",
  gym: "🏋",
  bank: "🏦",
  museum: "🏺",
  school: "🏫",
  parking: "🅿"
};

// Centraliza o mapa na posição atual
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

  // Pega avatar do jogador
  useEffect(() => {
    async function fetchPlayerAvatar() {
      try {
        const resp = await api.get<Player>("/users/me");
        if (resp.data.avatar) {
          setPlayerAvatar(resp.data.avatar);
        }
      } catch (error) {
        console.error("Erro ao carregar avatar do jogador:", error);
      }
    }
    fetchPlayerAvatar();
  }, []);

  // Pega a última posição do jogador
  useEffect(() => {
    async function fetchLatest() {
      try {
        const resp = await api.get<Location>("/location/latest");
        setPosition([resp.data.latitude, resp.data.longitude]);
      } catch {
        // tudo bem se não houver posição ainda
      }
    }
    fetchLatest();
  }, []);

  // Atualiza a posição em tempo real
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

  // Avatar personalizado
  const handleAvatarUpdate = (newAvatar: string) => {
    setPlayerAvatar(newAvatar);
  };

  if (!position) {
    return <div>Carregando mapa e localização...</div>;
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <MapContainer 
        center={position}
        zoom={17}
        minZoom={15}
        maxZoom={19}
        maxBounds={[[-22.82678, -47.0942], [-22.8120, -47.03891]]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}>
      <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Jogador */}
        <CircleMarker
          center={position}
          radius={8}
          pathOptions={{ color: "#007bff", fillColor: "#007bff", fillOpacity: 1 }}
        >
          <Popup>Você está aqui {playerAvatar}</Popup>
        </CircleMarker>

        {/* Pontos fixos */}
        {pointsOfInterest.map((poi, index) => (
          <Marker
            key={index}
            position={[poi.latitude, poi.longitude]}
          >
            <Popup>
              {iconMap[poi.type] || "❓"} <strong>{poi.name}</strong>
            </Popup>
          </Marker>
        ))}

        <MapInitializer position={position} />
      </MapContainer>

      <PlayerMenu onAvatarUpdate={handleAvatarUpdate} />
    </div>
  );
}