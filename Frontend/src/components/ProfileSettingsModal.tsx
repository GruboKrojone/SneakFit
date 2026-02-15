import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Close from "@mui/icons-material/Close";
import DeleteSweep from "@mui/icons-material/DeleteSweep";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useCleanTempLists } from "../hooks/useCleanTempLists";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import "./styles/ProfileSettingsModal.css";

interface ProfileSettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const profileSchemaType = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  oldPassword: z.string().optional(),
});

type ProfileSettingsFormData = z.infer<typeof profileSchemaType>;

type ViewState = "main" | "basic-settings" | "edit-name" | "edit-email" | "edit-password";

export default function ProfileSettingsModal({
  isOpen,
  onClose,
}: ProfileSettingsModalProps) {
  const { t } = useTranslation();
  const { clearAllChoices } = useCleanTempLists();
  const [view, setView] = useState<ViewState>("main");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const currentUser = AuthService.getCurrentUser();

  const nameSchema = z.object({
    name: z.string().min(1, { message: t("profile_settings_name_required") }),
  });

  const emailSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: t("login_page_email_invalid") }),
  });

  const passwordSchema = z.object({
    oldPassword: z.string().min(1, { message: t("profile_settings_password_required") }),
    password: z.string().min(6, { message: t("register_page_password_min_length") }),
    confirmPassword: z.string().min(1, { message: t("register_page_confirm_password_required") }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("register_page_passwords_do_not_match"),
    path: ["confirmPassword"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<ProfileSettingsFormData>({
    resolver: (values, context, options) => {
      if (view === "edit-name") return zodResolver(nameSchema)(values as any, context, options as any);
      if (view === "edit-email") return zodResolver(emailSchema)(values as any, context, options as any);
      if (view === "edit-password") return zodResolver(passwordSchema)(values as any, context, options as any);
      return zodResolver(z.object({}))(values as any, context, options as any);
    },
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      oldPassword: "",
    },
  });

  useEffect(() => {
    if (isOpen && currentUser) {
      reset({
        name: currentUser.name || currentUser.email || "",
        email: currentUser.email || "",
        password: "",
        confirmPassword: "",
        oldPassword: "",
      });
      setView("main");
    }
  }, [isOpen]);

  useEffect(() => {
    clearErrors();
  }, [view, clearErrors]);

  const handleNameUpdate = async (data: ProfileSettingsFormData) => {
    if (data.name) {
      await UserService.updateSettings(currentUser!.id, { name: data.name });
      toast.success(t("profile_settings_success"));
    }
  };

  const handleEmailUpdate = async (data: ProfileSettingsFormData) => {
    if (data.email) {
      await UserService.changeEmail(currentUser!.id, { newEmail: data.email });
      toast.success(t("profile_settings_success"));
      AuthService.logout();
      globalThis.location.reload();
    }
  };

  const handlePasswordUpdate = async (data: ProfileSettingsFormData) => {
    if (data.oldPassword && data.password) {
      await UserService.changePassword(currentUser!.id, {
        oldPassword: data.oldPassword,
        newPassword: data.password,
      });
      toast.success(t("profile_settings_success"));
    }
  };

  const onSubmit = async (data: ProfileSettingsFormData) => {
    if (!currentUser) return;
    try {
      if (view === "edit-name") {
        await handleNameUpdate(data);
      } else if (view === "edit-email") {
        await handleEmailUpdate(data);
        return;
      } else if (view === "edit-password") {
        await handlePasswordUpdate(data);
      }

      onClose();
      globalThis.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("Email already taken")) {
        toast.error(t("profile_settings_email_taken"));
      } else {
        toast.error(t("profile_settings_error") + ": " + errorMessage);
      }
    }
  };

  const handleClearChoices = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChoices = async () => {
    try {
      await clearAllChoices();
      toast.success(t("choices_cleared_message"));
      setShowClearConfirm(false);
    } catch (error) {
      toast.error(`${t("error_clearing_choices")}: ${error}`);
    }
  };

  const handleClose = () => {
    setView("main");
    onClose();
  };

  const handleBack = () => {
    if (["edit-name", "edit-email", "edit-password"].includes(view)) {
      setView("basic-settings");
    } else {
      setView("main");
    }
  };

  const renderMenu = () => (
    <div className="profile-menu-list">
      <button 
        type="button"
        className="profile-menu-item"
        onClick={() => setView("basic-settings")}
      >
        <div className="profile-menu-item-icon">
            <ManageAccountsIcon />
        </div>
        <div className="profile-menu-item-text">
            <span className="profile-menu-item-title">{t("profile_settings_basic_account") || "Basic Account Settings"}</span>
            <span className="profile-menu-item-desc">{t("profile_settings_basic_account_desc") || "Changes name, email and password"}</span>
        </div>
      </button>

      <button
        type="button"
        className="profile-menu-item profile-clear-button-item"
        onClick={handleClearChoices}
      >
          <div className="profile-menu-item-icon delete-icon-wrapper">
            <DeleteSweep />
          </div>
          <div className="profile-menu-item-text">
            <span className="profile-menu-item-title">{t("profile_settings_clear_choices_button")}</span>
            <span className="profile-menu-item-desc">{t("profile_settings_clear_choices_hint")}</span>
          </div>
      </button>
    </div>
  );

  const renderBasicMenu = () => (
    <div className="profile-menu-list">
      <button 
        type="button"
        className="profile-menu-item"
        onClick={() => setView("edit-name")}
      >
        <div className="profile-menu-item-icon">
            <PermIdentityIcon />
        </div>
        <div className="profile-menu-item-text">
            <span className="profile-menu-item-title">{t("profile_settings_name") || "Name"}</span>
        </div>
      </button>

      <button 
        type="button"
        className="profile-menu-item"
        onClick={() => setView("edit-email")}
      >
        <div className="profile-menu-item-icon">
            <MailOutlineIcon />
        </div>
        <div className="profile-menu-item-text">
            <span className="profile-menu-item-title">{t("register_page_email_holder") || "Email"}</span>
        </div>
      </button>

      <button 
        type="button"
        className="profile-menu-item"
        onClick={() => setView("edit-password")}
      >
        <div className="profile-menu-item-icon">
            <VpnKeyIcon />
        </div>
        <div className="profile-menu-item-text">
            <span className="profile-menu-item-title">{t("register_page_password_holder") || "Password"}</span>
        </div>
      </button>
    </div>
  );

  const renderEditName = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-form-container">
      <div className="profile-form-group">
        <label htmlFor="name">{t("profile_settings_name")}</label>
        <input
          type="text"
          id="name"
          placeholder={t("profile_settings_name_placeholder")}
          {...register("name")}
        />
        {errors.name && (
          <span className="profile-error-text">{errors.name.message}</span>
        )}
      </div>
      <button type="submit" className="profile-submit-button" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("profile_settings_save")}
      </button>
    </form>
  );

  const renderEditEmail = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-form-container">
      <div className="profile-form-group">
        <label htmlFor="email">{t("register_page_email_holder")}</label>
        <input
          type="email"
          id="email"
          placeholder={t("login_page_email_holder")}
          {...register("email")}
        />
        {errors.email && (
          <span className="profile-error-text">{errors.email.message}</span>
        )}
      </div>
      <button type="submit" className="profile-submit-button" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("profile_settings_save")}
      </button>
    </form>
  );

  const renderEditPassword = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-form-container">
       <div className="profile-form-group">
        <label htmlFor="oldPassword">{t("profile_settings_current_password") || "Current Password"}</label>
        <input
          type="password"
          id="oldPassword"
          placeholder={t("profile_settings_current_password_placeholder") || "Enter current password"}
          {...register("oldPassword")}
        />
        {errors.oldPassword && (
          <span className="profile-error-text">{errors.oldPassword.message}</span>
        )}
      </div>

      <div className="profile-form-group">
        <label htmlFor="password">{t("register_page_password_holder")}</label>
        <input
          type="password"
          id="password"
          placeholder={t("register_page_password_holder")}
          {...register("password")}
        />
        {errors.password && (
          <span className="profile-error-text">{errors.password.message}</span>
        )}
      </div>
      <div className="profile-form-group">
        <label htmlFor="confirmPassword">{t("register_page_confirm_password_holder")}</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder={t("register_page_confirm_password_holder")}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <span className="profile-error-text">{errors.confirmPassword.message}</span>
        )}
      </div>
      <button type="submit" className="profile-submit-button" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("profile_settings_save")}
      </button>
    </form>
  );

  const getTitle = () => {
    if (view === "main") return t("profile_settings_title");
    if (view === "basic-settings") return t("profile_settings_basic_account") || "Basic Account Settings";
    if (view === "edit-name") return t("profile_settings_name");
    if (view === "edit-email") return t("register_page_email_holder");
    if (view === "edit-password") return t("register_page_password_holder");
    return "";
  };

  return (
    <div
      className={`profile-modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={handleClose}
      aria-hidden={!isOpen}
    >
      <div className="profile-modal-content" onPointerDown={(e) => e.stopPropagation()}>
        <button
          className="profile-close-button"
          onClick={handleClose}
          title={t("profile_settings_close")}
        >
          <Close className="profile-close-icon" />
        </button>

        <div className={`profile-modal-header-with-back ${view === "main" ? "main-view" : ""}`} style={view === "main" ? { justifyContent: "center" } : {}}>
          {view !== "main" && (
            <button 
              className="profile-back-button" 
              onClick={handleBack}
              aria-label={t("back")}
            >
              <ArrowBackIcon />
            </button>
          )}
          <h2 className="profile-modal-title" style={view === "main" ? {} : { margin: 0 }}>
            {getTitle()}
          </h2>
        </div>

        {view === "main" && renderMenu()}
        {view === "basic-settings" && renderBasicMenu()}
        {view === "edit-name" && renderEditName()}
        {view === "edit-email" && renderEditEmail()}
        {view === "edit-password" && renderEditPassword()}

        {showClearConfirm && (
          <div className="profile-delete-confirm-overlay" onPointerDown={(e) => e.stopPropagation()}>
            <div className="profile-delete-confirm-modal">
              <h4>{t("profile_settings_clear_confirm_title")}</h4>
              <p>{t("profile_settings_clear_confirm_message")}</p>
              <div className="profile-delete-confirm-actions">
                <button
                  className="profile-delete-confirm-btn cancel"
                  onClick={() => setShowClearConfirm(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  className="profile-delete-confirm-btn confirm"
                  onClick={confirmClearChoices}
                >
                  {t("profile_settings_clear_confirm_confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
