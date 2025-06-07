import React, { useState } from "react";
import api from "../api/api";
import { AVAILABLE_AVATARS, AvatarChoice } from "../types/avatar";

interface WelcomeAvatarSetupProps {
  onComplete: (avatar: string) => void;
  playerName: string;
}

export default function WelcomeAvatarSetup({ onComplete, playerName }: WelcomeAvatarSetupProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(AVAILABLE_AVATARS[0].emoji);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const avatarChoice: AvatarChoice = {
        avatar: selectedAvatar,
        trainer_type: selectedAvatar
      };
      await api.post("/users/me/avatar", avatarChoice);
      onComplete(selectedAvatar);
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      alert("Erro ao configurar avatar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 4000,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "2.5rem",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          maxWidth: "550px",
          width: "90%",
          textAlign: "center",
          maxHeight: "85vh",
          overflow: "auto",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "2rem" }}>
          Bem-vindo(a), {playerName}! 🎉
        </h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "2rem", opacity: 0.9 }}>
          Escolha seu avatar para começar a explorar o campus da Unicamp!
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {AVAILABLE_AVATARS.map((avatar) => (
            <div
              key={avatar.emoji}
              onClick={() => setSelectedAvatar(avatar.emoji)}
              style={{
                textAlign: "center",
                padding: "1rem",
                border: selectedAvatar === avatar.emoji ? "3px solid #FFD700" : "2px solid rgba(255,255,255,0.3)",
                borderRadius: "15px",
                cursor: "pointer",
                backgroundColor: selectedAvatar === avatar.emoji 
                  ? "rgba(255,215,0,0.2)" 
                  : "rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {avatar.emoji}
              </div>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                {avatar.name}
              </div>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                {avatar.description}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleComplete}
          disabled={loading}
          style={{
            padding: "1rem 2rem",
            backgroundColor: loading ? "#ccc" : "#FFD700",
            color: loading ? "#666" : "#333",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1.1rem",
            fontWeight: "bold",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 15px rgba(255,215,0,0.3)",
          }}
        >
          {loading ? "Configurando..." : "Começar Aventura! 🚀"}
        </button>
      </div>
    </div>
  );
}