import { Navigate, useParams } from "react-router-dom";

export default function NotFoundRedirect() {
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || "en";

  const isAuthenticated = !!localStorage.getItem("accessToken");

  if (isAuthenticated) {
    return <Navigate to={`/${currentLocale}/home`} replace />;
  }

  return <Navigate to={`/${currentLocale}/login`} replace />;
}
