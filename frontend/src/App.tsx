// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import GameMap from "./pages/GameMap";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  const isLogged = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLogged ? <Navigate to="/map" replace /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/map"
          element={
            <PrivateRoute>
              <GameMap />
            </PrivateRoute>
          }
        />
        {/* redireciona qualquer outra rota para "/" */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
