import { ReactNode } from "react";
import AuthService from "../services/AuthService";

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminOnly({ children, fallback = null }: Readonly<AdminOnlyProps>) {
  const isAdmin = AuthService.isAdmin();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
