import React, { useState } from "react";
import api from "../api/api";
import { AVAILABLE_AVATARS, AvatarChoice } from "../types/avatar";

interface AvatarSelectorProps {
  onAvatarSelected: (avatar: string) => void;
  onClose: () => void;
  currentAvatar?: string;
}

export default function AvatarSelector({ onAvatarSelected, onClose, currentAvatar }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || AVAILABLE_AVATARS[0].emoji);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const avatarChoice: AvatarChoice = {
        avatar: selectedAvatar,
        trainer_type: selectedAvatar // Usando o mesmo valor para ambos por compatibilidade
      };
      await api.post("/users/me/avatar", avatarChoice);
      onAvatarSelected(selectedAvatar);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      alert("Erro ao salvar avatar. Tente novamente.");
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
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#333" }}>
          Escolha seu Avatar
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {AVAILABLE_AVATARS.map((avatar) => (
            <div
              key={avatar.emoji}
              onClick={() => setSelectedAvatar(avatar.emoji)}
              style={{
                textAlign: "center",
                padding: "1rem",
                border: selectedAvatar === avatar.emoji ? "3px solid #1a73e8" : "2px solid #ddd",
                borderRadius: "12px",
                cursor: "pointer",
                backgroundColor: selectedAvatar === avatar.emoji ? "#f0f8ff" : "#fff",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {avatar.emoji}
              </div>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333" }}>
                {avatar.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "0.25rem" }}>
                {avatar.description}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.75rem",
              backgroundColor: "#888",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.75rem",
              backgroundColor: loading ? "#ccc" : "#1a73e8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
            }}
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}