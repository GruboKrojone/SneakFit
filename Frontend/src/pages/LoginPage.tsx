import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/LoginPage.css";
import loginLogo from "/images/loginLogo.png";
import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import AuthService, { LoginCredentials } from "../services/AuthService";
import ThemeButton from "../components/ThemeButton";

export default function LoginPage() {
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
      <div id="login-area">
        <div id="login-form-core">
          <div className="logo-container">
            <img src={loginLogo} alt="SneakFit Logo" />
          </div>
          <form onSubmit={performLogin}>
            <AuthInput
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <AuthInput
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => updateField("password", e.target.value)}
            />

            <div className="buttons">
              <AuthButton
                name="Register"
                type="button"
                onClick={() => navigateTo(`/${locale}/register`)}
              />
              <AuthButton
                id="log"
                name="Sign In"
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
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    </>
  );
}
