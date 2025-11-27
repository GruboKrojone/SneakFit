import { useState } from "react";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import AuthService, { RegisterCredentials } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import "./styles/RegisterPage.css";
import Close from "@mui/icons-material/Close";
import ThemeButton from "../components/ThemeButton";

export default function RegisterPage() {
  const navigateTo = useNavigate();
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
        navigateTo("/login");
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
          <h1>Register</h1>
          <div id="register-form-core">
            <form onSubmit={performRegister}>
              <AuthInput
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <AuthInput
                type="text"
                placeholder="Name"
                value={credentials.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <AuthInput
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
              <AuthInput
                type="password"
                placeholder="Confirm Password"
                value={credentials.password2}
                onChange={(e) => updateField("password2", e.target.value)}
              />

              <div id="buttons">
                <AuthButton id="register" name="Register" type="submit" />
                <AuthButton
                  id="reset"
                  name="Reset"
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
        </div>
        <div id="right">
          <Close id="close-button" onClick={() => navigateTo("/")} />
        </div>
      </div>
    </>
  );
}
