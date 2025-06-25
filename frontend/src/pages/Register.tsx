import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [team, setTeam] = useState("exatas");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        team,
      });
      // Cadastro OK: redireciona para setup de avatar
      navigate("/map");
    } catch (err: any) {
      if (err.response && err.response.data.detail) {
        alert("Erro: " + err.response.data.detail);
      } else {
        alert("Erro ao cadastrar usuário.");
      }
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "1rem" }}>
      <h2>Cadastro de Jogador</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.75rem" }}>
          <label>Nickname:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="ex: jogadora123"
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="seu@exemplo.com"
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Senha (mínimo 6 caracteres):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="••••••••"
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Equipe:</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          >
            <option value="exatas">Exatas</option>
            <option value="humanas">Humanas</option>
            <option value="biologicas">Biológicas</option>
          </select>
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
          Cadastrar
        </button>
      </form>
    </div>
  );
}
