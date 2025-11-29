import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/LoginPage.css";
import loginLogo from "/images/loginLogo.png";
import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import AuthService, { LoginCredentials } from "../services/AuthService";
import ThemeButton from "../components/ThemeButton";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();

  const updateField = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const performLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const accessToken = await AuthService.login(credentials);

      if (accessToken != null) {
        navigateTo(`/${locale}/home`);
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Login unsuccessful. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeButton />
      <div className="container">
        <div id="login-form-core">
          <div className="logo-container">
            <img src={loginLogo} alt="SneakFit Logo" />
          </div>
          <h1>{t("login_page_title")}</h1>
          <form onSubmit={performLogin}>
            <AuthInput
              type="email"
              placeholder={t("login_page_email_holder")}
              value={credentials.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <AuthInput
              type="password"
              placeholder={t("login_page_password_holder")}
              value={credentials.password}
              onChange={(e) => updateField("password", e.target.value)}
            />

            <div className="buttons">
              <AuthButton
                name={t("register_page_register_button")}
                type="button"
                onClick={() => navigateTo(`/${locale}/register`)}
              />
              <AuthButton
                id="log"
                name={t("login_page_login_button")}
                type="submit"
                loading={loading}
                disabled={loading}
              />
            </div>
          </form>
          {errorMsg && (
            <div className="error-message">
              <p>{errorMsg}</p>
            </div>
          )}
          <div id="spacer">
            <a href={`/${locale}/forgot-password`}>
              {t("login_page_forgot_password")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
