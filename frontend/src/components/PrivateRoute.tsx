// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem("token");
  if (!token) {
    // Se não tem token, redireciona para login
    return <Navigate to="/login" replace />;
  }
  // Se tem token, renderiza o componente “filho”
  return children;
}
