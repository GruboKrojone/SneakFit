import { ReactNode, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./styles/ProtectedLayout.css";
import NavBar from "./NavBar";
import AuthService from "../services/AuthService";

interface ProtectedLayoutProps {
  readonly children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || AuthService.isTokenExpired()) {
      AuthService.logout();
      navigate(`/${locale}/login`);
    }
  }, [navigate, locale]);

  return (
    <div className="protected-layout">
      <NavBar />
      <div className="protected-content">{children}</div>
    </div>
  );
}
