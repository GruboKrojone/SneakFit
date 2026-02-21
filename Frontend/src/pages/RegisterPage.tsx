import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import AuthService from "../services/AuthService";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/RegisterPage.css";
import Close from "@mui/icons-material/Close";
import ThemeButton from "../components/ThemeButton";

const registerSchemaType = z.object({
  email: z.string(),
  name: z.string(),
  password: z.string(),
  password2: z.string(),
  age: z.number().optional(),
});

type RegisterFormData = z.infer<typeof registerSchemaType>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigateTo = useNavigate();
  const { locale } = useParams<{ locale: string }>();

  const registerSchema = z
    .object({
      email: z
        .string()
        .min(1, t("login_page_email_required"))
        .regex(/^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, t("login_page_email_invalid")),
      name: z.string().min(1, { message: t("register_page_name_required") }),
      password: z
        .string()
        .min(6, { message: t("register_page_password_min_length") }),
      password2: z
        .string()
        .min(1, { message: t("register_page_confirm_password_required") }),
      age: z.number().optional(),
    })
    .refine((data) => data.password === data.password2, {
      message: t("register_page_passwords_do_not_match"),
      path: ["password2"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      password2: "",
      name: "",
      age: undefined,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await AuthService.register({
        email: data.email,
        password: data.password,
        password2: data.password2,
        name: data.name,
        age: data.age,
      });

      if (response != null) {
        navigateTo(`/${locale}/login`);
      }
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : t("register_error_message"),
      });
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <AuthInput
                type="email"
                placeholder={t("register_page_email_holder")}
                {...register("email")}
              />
              {errors.email && (
                <div className="error-message">
                  <p>{errors.email.message}</p>
                </div>
              )}

              <AuthInput
                type="text"
                placeholder={t("register_page_name_holder")}
                {...register("name")}
              />
              {errors.name && (
                <div className="error-message">
                  <p>{errors.name.message}</p>
                </div>
              )}

              <AuthInput
                type="password"
                placeholder={t("register_page_password_holder")}
                {...register("password")}
              />
              {errors.password && (
                <div className="error-message">
                  <p>{errors.password.message}</p>
                </div>
              )}

              <AuthInput
                type="password"
                placeholder={t("register_page_confirm_password_holder")}
                {...register("password2")}
              />
              {errors.password2 && (
                <div className="error-message">
                  <p>{errors.password2.message}</p>
                </div>
              )}

              <div className="buttons" id="register-buttons">
                <AuthButton
                  id="register"
                  name={t("register_page_register_button")}
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                />
                <AuthButton
                  id="reset"
                  name={t("register_page_clear_button")}
                  type="button"
                  onClick={() => reset()}
                />
              </div>
            </form>
            {errors.root && (
              <div className="error-message">
                <p>{errors.root.message}</p>
              </div>
            )}
          </div>
          <div id="spacer" />
        </div>
        <div id="right">
          <Close
            className="close-button"
            onClick={() => navigateTo(`/${locale}/login`)}
          />
        </div>
      </div>
    </>
  );
}
