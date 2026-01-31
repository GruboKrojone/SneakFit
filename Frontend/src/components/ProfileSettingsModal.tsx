import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Close from "@mui/icons-material/Close";
import DeleteSweep from "@mui/icons-material/DeleteSweep";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useCleanTempLists } from "../hooks/useCleanTempLists";
import "./styles/ProfileSettingsModal.css";

interface ProfileSettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const profileSchemaType = z.object({
  name: z.string(),
  age: z.number().optional(),
});

type ProfileSettingsFormData = z.infer<typeof profileSchemaType>;

export default function ProfileSettingsModal({
  isOpen,
  onClose,
}: ProfileSettingsModalProps) {
  const { t } = useTranslation();
  const { clearAllChoices } = useCleanTempLists();

  const profileSettingsSchema = z.object({
    name: z.string().min(1, t("profile_settings_name_required")),
    age: z.coerce
      .number()
      .positive(t("profile_settings_age_must_be_positive"))
      .max(150, t("profile_settings_age_too_high"))
      .optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema) as any,
    defaultValues: {
      name: "",
      age: undefined,
    },
  });

  const onSubmit = async (data: ProfileSettingsFormData) => {
    try {
      console.log("Profile data:", data);

      toast.success(t("profile_settings_success"), {
        position: "bottom-right",
        autoClose: 2000,
      });

      onClose();
    } catch (error) {
      toast.error(t("profile_settings_error" + error), {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const handleClearChoices = async () => {
    try {
      await clearAllChoices();
      toast.success(t("choices_cleared_message"), {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(`${t("error_clearing_choices")}: ${error}`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };



  return (
    <div
      className={`profile-modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={onClose}
    >
      <div className="profile-modal-content" onPointerDown={(e) => e.stopPropagation()}>
        <button
          className="profile-close-button"
          onClick={onClose}
          title={t("profile_settings_close")}
        >
          <Close className="profile-close-icon" />
        </button>

        <h2 className="profile-modal-title">{t("profile_settings_title")}</h2>

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

          <div className="profile-form-group">
            <label htmlFor="age">{t("profile_settings_age")}</label>
            <input
              type="number"
              id="age"
              placeholder={t("profile_settings_age_placeholder")}
              {...register("age")}
            />
            {errors.age && (
              <span className="profile-error-text">{errors.age.message}</span>
            )}
          </div>

          <button type="submit" className="profile-submit-button" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("profile_settings_save")}
          </button>

          <div className="profile-form-group profile-clear-group">
            <label>{t("profile_settings_clear_choices")}</label>
            <button
              type="button"
              className="profile-submit-button profile-clear-button"
              onClick={handleClearChoices}
              title={t("profile_settings_clear_choices_hint")}
            >
              <DeleteSweep className="profile-delete-icon" />
              {t("profile_settings_clear_choices_button")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
