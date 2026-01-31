import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "./styles/LoginPage.css";
import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import AuthService from "../services/AuthService";
import ThemeButton from "../components/ThemeButton";
import { useTranslation } from "react-i18next";

const loginSchemaType = z.object({
  email: z.string(),
  password: z.string(),
});

type LoginFormData = z.infer<typeof loginSchemaType>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const navigateTo = useNavigate();

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t("login_page_email_required"))
      .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, t("login_page_email_invalid")),
    password: z.string().min(1, t("login_page_password_required")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const accessToken = await AuthService.login(data);

      if (accessToken != null) {
        navigateTo(`/${locale}/home`);
      }
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : t("login_error_message"),
      });
    }
  };

  return (
    <>
      <ThemeButton />
      <div className="container">
        <div id="login-form-core">
          <div className="logo-container">
            <img src="/images/loginLogo.png" alt={t("login_page_logo_alt")} />
          </div>
          <h1>{t("login_page_title")}</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AuthInput
              type="email"
              placeholder={t("login_page_email_holder")}
              {...register("email")}
            />
            {errors.email && (
              <div className="error-message">
                <p>{errors.email.message}</p>
              </div>
            )}

            <AuthInput
              type="password"
              placeholder={t("login_page_password_holder")}
              {...register("password")}
            />
            {errors.password && (
              <div className="error-message">
                <p>{errors.password.message}</p>
              </div>
            )}

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
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </div>
          </form>
          {errors.root && (
            <div className="error-message">
              <p>{errors.root.message}</p>
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
