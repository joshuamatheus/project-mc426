import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import AvatarSelector from "./AvatarSelector";

interface Player {
  id: number;
  name: string;
  email: string;
  team: string;
  avatar?: string;
  trainer_type?: string;
  created_at: string;
}

interface PlayerMenuProps {
  onAvatarUpdate?: (avatar: string) => void;
}

export default function PlayerMenu({ onAvatarUpdate }: PlayerMenuProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const resp = await api.get("/users/me");
        setPlayer(resp.data);
      } catch {
        alert("Erro ao carregar dados do jogador.");
      }
    }
    fetchProfile();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const handleAvatarSelected = (newAvatar: string) => {
    if (player) {
      const updatedPlayer = { ...player, avatar: newAvatar };
      setPlayer(updatedPlayer);
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatar);
      }
    }
  };

  if (!player) return null;

  return (
    <>
      {/* Botão de menu hambúrguer */}
      {!showMenu && (
        <button
          onClick={() => setShowMenu(true)}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "white",
            color: "black",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "0.5rem 0.75rem",
            fontSize: "1.5rem",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          ☰
        </button>
      )}

      {/* Menu lateral flutuante */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "white",
            color: "black",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
            fontSize: "0.9rem",
            minWidth: "200px",
          }}
        >
          {/* Botão de fechar (X) */}
          <button
            onClick={() => setShowMenu(false)}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              background: "transparent",
              color: "black",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", marginTop: "1.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>{player.avatar || "🎓"}</span>
            <strong>{player.name}</strong>
          </div>

          <div>Equipe: {player.team}</div>

          <button
            onClick={() => setShowProfile(true)}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.4rem",
              backgroundColor: "#1a73e8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Ver Perfil
          </button>

          <button
            onClick={() => setShowAvatarSelector(true)}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.4rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Trocar Avatar
          </button>

          <button
            onClick={handleLogout}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.4rem",
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      )}

      {/* Modal de perfil */}
      {showProfile && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            color: "black",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
            zIndex: 2000,
            minWidth: "300px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "3rem" }}>{player.avatar || "🎓"}</span>
            <h3 style={{ margin: 0 }}>Perfil do Jogador</h3>
          </div>

          <p><strong>ID:</strong> {player.id}</p>
          <p><strong>Nickname:</strong> {player.name}</p>
          <p><strong>Email:</strong> {player.email}</p>
          <p><strong>Equipe:</strong> {player.team}</p>
          <p><strong>Desde:</strong> {new Date(player.created_at).toLocaleDateString()}</p>

          <button
            onClick={async () => {
              const confirmed = window.confirm("Tem certeza que deseja apagar sua conta? Esta ação não pode ser desfeita.");
              if (!confirmed) return;

              try {
                await api.delete("/users/me");
                alert("Conta apagada com sucesso.");
                localStorage.removeItem("token");
                navigate("/login");
              } catch (err) {
                alert("Erro ao apagar conta.");
              }
            }}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.5rem",
              backgroundColor: "#d33",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Apagar Conta
          </button>

          <button
            onClick={() => setShowProfile(false)}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.5rem",
              backgroundColor: "#888",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Modal de seleção de avatar */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={player.avatar}
          onAvatarSelected={handleAvatarSelected}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </>
  );
}
