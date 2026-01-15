import Close from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import "./styles/CreateDishModal.css";

interface ProfileSettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
}: ProfileSettingsModalProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={onClose}
    >
      <div className="modal-content" onPointerDown={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={onClose}
          title={t("profile_settings_close")}
        >
          <Close className="close-icon" />
        </button>

        <h2 className="modal-title">{t("profile_settings_title")}</h2>

        <form className="form-container">
          <div className="form-group">
            <label htmlFor="name">{t("profile_settings_name")}</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder={t("profile_settings_name_placeholder")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">{t("profile_settings_age")}</label>
            <input
              type="number"
              id="age"
              name="age"
              placeholder={t("profile_settings_age_placeholder")}
            />
          </div>

          <button className="submit-button">
            {t("profile_settings_save")}
          </button>
        </form>
      </div>
    </div>
  );
}
