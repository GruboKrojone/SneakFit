import React from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/AuthService";
import NavBar from "./NavBar";
import "./styles/NavBar.css";

export default function ProtectedLayout({ children }: React.PropsWithChildren) {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="protected-root">
      <NavBar />
      <div className="protected-content">{children}</div>
    </div>
  );
}
