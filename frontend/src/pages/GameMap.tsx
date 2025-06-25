import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, Popup, Circle } from "react-leaflet";
import api from "../api/api";
import PlayerMenu from "../components/PlayerMenu";
import pointsOfInterest from "../assets/pointsOfInterest.json" assert { type: "json" };
import { useNavigate } from "react-router-dom";

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

interface Creature {
  name: string;
  image_url: string;
  grayscale_image_url: string;
  poi_type?: string | null;
}

interface NearbyCreature {
  creature: Creature;
  poi_name: string;
  poi_latitude: number;
  poi_longitude: number;
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

function MapInitializer({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 17);
  }, [position]);
  return null;
}

export default function GameMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null); // Novo estado para a precisão
  const [playerAvatar, setPlayerAvatar] = useState("🎓");
  const [collectedMessage, setCollectedMessage] = useState<string | null>(null);
  const [nearbyCreature, setNearbyCreature] = useState<NearbyCreature | null>(null); // Criatura próxima
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Novo estado
  const navigate = useNavigate(); // Inicialize useNavigate
  const [loadingMessage, setLoadingMessage] = useState("Carregando mapa e localização...");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      navigate("/login"); // Redireciona para a tela de login
    }
  }, [navigate]);

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

  useEffect(() => {
    async function fetchLatest() {
      try {
        const token = localStorage.getItem("token");
        const resp = await api.get<Location>("/location/latest", {
          headers: {
            Authorization: `Bearer ${token}`, // Adiciona o token
          },
        });
        setPosition([resp.data.latitude, resp.data.longitude]);
      } catch (error) {
        console.error("Erro ao carregar localização:", error);
      }
    }

    if (isAuthenticated) {
      fetchLatest();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta Geolocalização.");
      return;
    }

    let watcherId: number;

    const attemptGeolocation = () => {
      watcherId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          console.log("Geolocalização obtida:", latitude, longitude, accuracy); // Adicione este log

          if (accuracy > 50) { // Se a precisão for maior que 50 metros...
            console.warn("Precisão da geolocalização muito baixa:", accuracy);
            alert("Atenção: A precisão da sua localização é baixa. A experiência do jogo pode ser afetada."); // Exibe um aviso
            setAccuracy(accuracy);
          } else {
             setAccuracy(null);
          }

          setPosition([latitude, longitude]);
          try {
             const token = localStorage.getItem("token");
               await api.post("/location/update", { latitude, longitude }, {
                    headers: {
                       Authorization: `Bearer ${token}`, // Adiciona o token
                  },
                });
           } catch (err) {
                console.error("Erro ao atualizar localização:", err);
           }

        // Verificar se há criatura por perto
        try {
          const token = localStorage.getItem("token");
            const resp = await api.get<NearbyCreature | null>(`/creatures/nearby?latitude=${latitude}&longitude=${longitude}`,{
                      headers: {
                         Authorization: `Bearer ${token}`, // Adiciona o token
                  },
                });
          setNearbyCreature(resp.data);
        } catch (err) {
          console.error("Erro ao verificar criatura próxima:", err);
          setNearbyCreature(null);
        }
        },
        (err) => {
          console.error("Erro na geolocalização:", err);
          switch (err.code) {
            case err.PERMISSION_DENIED:
              alert("Permissão de geolocalização negada pelo usuário.");
              break;
            case err.POSITION_UNAVAILABLE:
              alert("Não foi possível obter a localização. Verifique se o GPS está ativado.");
              break;
            case err.TIMEOUT:
              alert("Tempo limite excedido ao tentar obter a localização.");
              break;
            default:
              alert("Erro desconhecido ao obter a localização.");
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    };

    if (isAuthenticated) {
      attemptGeolocation();
    }

    return () => {
      if (watcherId) navigator.geolocation.clearWatch(watcherId);
    };
  }, [isAuthenticated]);

  const handleAvatarUpdate = (newAvatar: string) => {
    setPlayerAvatar(newAvatar);
  };

  const handleEggCollect = async (poi: PointOfInterest) => {
    if (!position) return;

    try {
     const token = localStorage.getItem("token");
      const resp = await api.post("/rewards/collect", {
        latitude: position[0],
        longitude: position[1],
        name: poi.name
      },{
                      headers: {
                         Authorization: `Bearer ${token}`, // Adiciona o token
                  },
                });

      setCollectedMessage("🥚 Ovo coletado! Abrindo em 3 segundos...");
      setTimeout(() => {
        setCollectedMessage("🐣 O ovo chocou! (em breve: criatura revelada)");
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao coletar ovo.");
    }
  };

  const handleCapture = async () => {
    if (!position || !nearbyCreature || isCapturing) return;

    setIsCapturing(true);
    try {
       const token = localStorage.getItem("token");
      const resp = await api.post(`/creatures/capture/${nearbyCreature.creature.name}`, {
                      headers: {
                         Authorization: `Bearer ${token}`, // Adiciona o token
                  },
                });

      if (resp.data) {
        setCollectedMessage(`Você capturou ${nearbyCreature.creature.name}!`);
        setNearbyCreature(null); // Limpa a criatura após a captura
      } else {
        setCollectedMessage("A captura falhou!");
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao capturar criatura.");
    } finally {
      setIsCapturing(false);
      setTimeout(() => {
        setCollectedMessage(null);
      }, 3000);
    }
  };

  if (!isAuthenticated) {
    return <div>Redirecionando para a tela de login...</div>;
  }


  if (!position) {
    return <div>Carregando mapa e localização...</div>;
  }

  //Calcula a distancia entre dois pontos geograficos
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (lat1 === null || lat1 === undefined || lon1 === undefined || lon1 === undefined || lat2 === null || lat2 === undefined || lon2 === null || lon2 === undefined) {
    return 0; // Ou outro valor padrão apropriado
  }
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180; // φ, λ em radianos
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2-lat1) * Math.PI / 180;
    const Δλ = (lon2-lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;
    return d;
  }

  const isCreatureVisible = nearbyCreature && position && calculateDistance(position[0], position[1], nearbyCreature.poi_latitude, nearbyCreature.poi_longitude) <= 50; //Raio de 50 metros

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <MapContainer
        center={position}
        zoom={17}
        minZoom={15}
        maxZoom={19}
        maxBounds={[[-22.82678, -47.0942], [-22.8120, -47.03891]]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
      >
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

         {position && accuracy !== null && (
            <Circle
              center={position}
              radius={accuracy}
              pathOptions={{
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
          )}

        {/* Exibir Criatura Próxima (se houver) */}
        {isCreatureVisible && nearbyCreature && (
          <Marker position={[nearbyCreature.poi_latitude, nearbyCreature.poi_longitude]}>
            <Popup>
              <strong>{nearbyCreature.creature.name}</strong>
              <br />
              <img
                src={nearbyCreature.creature.image_url}
                alt={nearbyCreature.creature.name}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <br />
              <button onClick={handleCapture} disabled={isCapturing}>
                {isCapturing ? "Capturando..." : "Capturar!"}
              </button>
            </Popup>
          </Marker>
        )}

        {/* Pontos fixos */}
        {pointsOfInterest.map((poi, index) => (
          <Marker key={index} position={[poi.latitude, poi.longitude]}>
            <Popup>
              {iconMap[poi.type] || "❓"} <strong>{poi.name}</strong>
              <br />
              <button onClick={() => handleEggCollect(poi)}>Coletar Ovo</button>
            </Popup>
          </Marker>
        ))}

        <MapInitializer position={position} />
      </MapContainer>

      {collectedMessage && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 1000
          }}
        >
          {collectedMessage}
        </div>
      )}

      <PlayerMenu onAvatarUpdate={handleAvatarUpdate} />
    </div>
  );
}