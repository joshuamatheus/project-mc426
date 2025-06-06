// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AvatarSetup from "./pages/AvatarSetup";
import GameMap from "./pages/GameMap";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Se estiver logado, quem acessar "/" redireciona para "/map" */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/map" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Registro e Login são rotas públicas */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Setup de Avatar: precisa de token */}
        <Route
          path="/avatar-setup"
          element={
            <PrivateRoute>
              <AvatarSetup />
            </PrivateRoute>
          }
        />

        {/* Mapa do jogo: precisa de token */}
        <Route
          path="/map"
          element={
            <PrivateRoute>
              <GameMap />
            </PrivateRoute>
          }
        />

        {/* Qualquer outra rota não encontrada volta a "/" */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}