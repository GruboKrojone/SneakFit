import { useState } from "react";
import { useTranslation } from "react-i18next";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import AuthService, { RegisterCredentials } from "../services/AuthService";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/RegisterPage.css";
import Close from "@mui/icons-material/Close";
import ThemeButton from "../components/ThemeButton";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigateTo = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    password: "",
    password2: "",
    name: "",
    age: undefined,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const updateField = (field: keyof RegisterCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setCredentials({
      email: "",
      password: "",
      password2: "",
      name: "",
      age: undefined,
    });
    setErrorMsg("");
  };

  const performRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");

    try {
      const response = await AuthService.register(credentials);

      if (response != null) {
        navigateTo(`/${locale}/login`);
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Registration unsuccessful. Please try again."
      );
    }
  };

  return (
    <>
      <ThemeButton />
      <div className="container">
        <div id="left"></div>
        <div id="middle">
          <h1>{t("register_page_title")}</h1>
          <div id="register-form-core">
            <form onSubmit={performRegister}>
              <AuthInput
                type="email"
                placeholder={t("register_page_title")}
                value={credentials.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <AuthInput
                type="text"
                placeholder={t("register_page_name_holder")}
                value={credentials.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <AuthInput
                type="password"
                placeholder={t("register_page_password_holder")}
                value={credentials.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
              <AuthInput
                type="password"
                placeholder={t("register_page_confirm_password_holder")}
                value={credentials.password2}
                onChange={(e) => updateField("password2", e.target.value)}
              />

              <div className="buttons" id="register-buttons">
                <AuthButton
                  id="register"
                  name={t("register_page_register_button")}
                  type="submit"
                />
                <AuthButton
                  id="reset"
                  name={t("register_page_clear_button")}
                  type="button"
                  onClick={handleReset}
                />
              </div>
            </form>
            {errorMsg && (
              <div className="error-message">
                <p>{errorMsg}</p>
              </div>
            )}
          </div>
          <div id="spacer" />
        </div>
        <div id="right">
          <Close
            id="close-button"
            onClick={() => navigateTo(`/${locale}/login`)}
          />
        </div>
      </div>
    </>
  );
}
