import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const resp = await api.post("/auth/login", { email, password });
      const { access_token } = resp.data;
      // Armazena o token no localStorage
      localStorage.setItem("token", access_token);
      // Já configuramos o interceptor do axios, então tudo vai passar o header
      // Redireciona para setup de avatar
      navigate("/avatar-setup");
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        alert("Email ou senha inválidos.");
      } else {
        alert("Erro ao fazer login.");
      }
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "1rem" }}>
      <h2>Login de Jogador</h2>
      <form onSubmit={handleSubmit}>
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
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="••••••••"
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
          Entrar
        </button>
      </form>
    </div>
  );
}
