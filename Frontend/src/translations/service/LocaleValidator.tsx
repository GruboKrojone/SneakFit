import { Navigate, useParams, Outlet } from "react-router-dom";
import { SUPPORTED_LOCALES, DEV_MODE } from "./TranslationService";

export default function LocaleValidator() {
  const { locale } = useParams<{ locale: string }>();
  const isAuthenticated = !!localStorage.getItem("accessToken");

  const isValidLocale =
    locale &&
    (SUPPORTED_LOCALES.includes(locale as any) || locale === DEV_MODE);

  if (!isValidLocale) {
    const defaultLocale = "en";
    if (isAuthenticated) {
      return <Navigate to={`/${defaultLocale}/home`} replace />;
    }
    return <Navigate to={`/${defaultLocale}/login`} replace />;
  }

  return <Outlet />;
}
