import Close from "@mui/icons-material/Close";
import DeleteSweep from "@mui/icons-material/DeleteSweep";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useCleanTempLists } from "../hooks/useCleanTempLists";
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
  const { clearAllChoices } = useCleanTempLists();

  const handleClearChoices = async () => {
    try {
      await clearAllChoices();
      toast.success(t("choices_cleared_message"), {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Error clearing choices", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

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

          <div className="form-group" style={{ marginTop: "1.5rem" }}>
            <label>{t("profile_settings_clear_choices")}</label>
            <button
              type="button"
              className="submit-button"
              style={{
                backgroundColor: "#dc3545",
              }}
              onClick={handleClearChoices}
              title={t("profile_settings_clear_choices_hint")}
            >
              <DeleteSweep style={{ marginRight: "0.5rem" }} />
              {t("profile_settings_clear_choices_button")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
