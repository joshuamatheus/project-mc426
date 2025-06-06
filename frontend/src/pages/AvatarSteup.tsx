// src/pages/AvatarSetup.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Avatar {
  key: string;
  display_name: string;
  image_url: string;
}

export default function AvatarSetup() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [trainerName, setTrainerName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAvatars() {
      try {
        const resp = await api.get<Avatar[]>("/avatars");
        setAvatars(resp.data);
      } catch (err) {
        console.error("Erro ao buscar avatares:", err);
      }
    }
    fetchAvatars();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedKey || !trainerName.trim()) {
      alert("Selecione um avatar e digite um nome de treinador.");
      return;
    }
    try {
      await api.post("/users/me/avatar", {
        avatar_key: selectedKey,
        trainer_name: trainerName,
      });
      // Se deu certo, redireciona para o mapa
      navigate("/map");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar preferências.");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: "1rem" }}>
      <h2>Escolha seu Avatar e Nome de Treinador</h2>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          {avatars.map((av) => (
            <label
              key={av.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="avatar"
                value={av.key}
                checked={selectedKey === av.key}
                onChange={() => setSelectedKey(av.key)}
                required
                style={{ marginBottom: "0.5rem" }}
              />
              <img
                src={av.image_url}
                alt={av.display_name}
                width={80}
                height={80}
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
              <div>{av.display_name}</div>
            </label>
          ))}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Nome do Treinador:</label>
          <input
            type="text"
            value={trainerName}
            onChange={(e) => setTrainerName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="Digite seu nome de treinador"
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Salvar e Ir ao Mapa
        </button>
      </form>
    </div>
  );
}
