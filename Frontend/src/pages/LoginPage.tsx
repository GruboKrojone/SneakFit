import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/LoginPage.css";
import loginLogo from "/images/loginLogo.svg";
import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import darkMode from "../../public/images/dark-mode.svg";
import AuthService from "../services/AuthService";

interface LoginCredentials {
  email: string;
  password: string;
}

export default function LoginPage() {
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
        navigateTo("/home");
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
      <div id="view-mode">
        <img src={darkMode} alt="Dark mode toggle" />
      </div>
      <div id="login-area">
        <div id="form-core">
          <div className="logo-container">
            <img src={loginLogo} alt="SneakFit Logo" />
          </div>

          {errorMsg && (
            <div className="error-message">
              <p>{errorMsg}</p>
            </div>
          )}

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

            <div id="buttons">
              <AuthButton name="Register" />
              <AuthButton name="Sign In" loading={loading} disabled={loading} />
            </div>
          </form>

          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    </>
  );
}
