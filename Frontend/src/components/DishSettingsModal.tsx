import Close from "@mui/icons-material/Close";
import "./styles/DishSettingsModal.css";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DishesService from "../services/DishesService";
import { toast } from "react-toastify";

interface DishSettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isPublic: boolean;
  readonly onChangePublic: (value: boolean) => void;
  readonly dishId: number;
}

const SWAL_CUSTOM_CLASS = {
  popup: "swal2-popup-custom",
  confirmButton: "swal2-confirm-btn-custom",
  cancelButton: "swal2-cancel-btn-custom",
};

interface SettingOption {
  titleKey: string;
  onClick: () => void;
}

export default function DishSettingsModal({
  isOpen,
  onClose,
  isPublic,
  onChangePublic,
  dishId,
}: DishSettingsModalProps) {
  const { t } = useTranslation();
  const [tempPrivacy, setTempPrivacy] = useState(isPublic);
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTempPrivacy(isPublic);
  }, [isPublic]);

  const handlePrivacyChange = async (newValue: boolean) => {
    const result = await Swal.fire({
      title: t("dish_settings_modal_confirm_change_title"),
      text: t("dish_settings_modal_confirm_change_message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("dish_settings_modal_confirm_yes"),
      cancelButtonText: t("dish_settings_modal_confirm_no"),
      customClass: SWAL_CUSTOM_CLASS,
    });

    if (result.isConfirmed) {
      try {
        if (newValue) {
          await DishesService.setDishPublic(dishId);
        } else {
          await DishesService.updateDish(dishId, { isPublic: false });
        }
        onChangePublic(newValue);
        toast.success(t("dish_settings_modal_privacy_updated"));
      } catch (error) {
        console.error("Error updating dish privacy:", error);
        toast.error(t("dish_settings_modal_privacy_update_error"));
      }
    }
  };

  const handleEditDescription = async () => {
    const { value: newDescription } = await Swal.fire({
      title: t("dish_settings_modal_edit_description"),
      input: "textarea",
      inputValue: description,
      inputPlaceholder: t("dish_settings_modal_edit_description_placeholder"),
      inputAttributes: {
        "aria-label": t("dish_settings_modal_edit_description_aria_label"),
        maxlength: "500",
      },
      inputValidator: (value) => {
        if (value && value.length > 500) {
          return t("dish_settings_modal_edit_description_validation");
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: t("dish_settings_modal_edit_description_save"),
      cancelButtonText: t("dish_settings_modal_edit_description_cancel"),
      width: "700px",
      padding: "2.5rem",
      customClass: {
        ...SWAL_CUSTOM_CLASS,
        input: "swal2-textarea-custom",
      },
      didOpen: () => {
        const textarea = Swal.getInput();
        if (textarea) {
          textarea.style.minHeight = "500px";
          textarea.style.resize = "vertical";

          const counter = document.createElement("div");
          counter.className = "swal-character-counter";
          counter.textContent = `${textarea.value.length}/500`;
          textarea.parentNode?.appendChild(counter);

          textarea.addEventListener("input", () => {
            counter.textContent = `${textarea.value.length}/500`;
          });
        }
      },
    });

    if (newDescription !== undefined && newDescription !== description) {
      try {
        await DishesService.updateDish(dishId, { description: newDescription });
        setDescription(newDescription);
        toast.success(t("dish_settings_modal_edit_description_success"));
      } catch (error) {
        console.error("Error updating dish description:", error);
        toast.error(t("dish_settings_modal_edit_description_error"));
      }
    }
  };

  const settingOptions: SettingOption[] = [
    { titleKey: "dish_settings_modal_edit_photos", onClick: () => {} },
    { titleKey: "dish_settings_modal_edit_categories", onClick: () => {} },
    { titleKey: "dish_settings_modal_edit_description", onClick: handleEditDescription },
    { titleKey: "dish_settings_modal_edit_ingredients", onClick: () => {} },
    { titleKey: "dish_settings_modal_edit_macronutrients", onClick: () => {} },
  ];

  const renderSettingGroup = ({ titleKey, onClick }: SettingOption) => (
    <div className="dish-settings-modal-group" key={titleKey}>
      <div className="dish-settings-modal-group-title">
        {t(titleKey)}
      </div>
      <div className="dish-settings-modal-group-content">
        <button
          className="dish-settings-modal-edit-btn"
          onClick={onClick}
        >
          {t(titleKey)}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`dish-settings-modal-overlay${isOpen ? " open" : ""}`}
      onPointerDown={onClose}
    >
      <div
        className="dish-settings-modal-content"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className="dish-settings-modal-close-btn"
          onClick={onClose}
          title={t("dish_settings_modal_close_title")}
        >
          <Close className="dish-settings-modal-close-icon" />
        </button>
        <h2 className="dish-settings-modal-title">
          {t("dish_settings_modal_title")}
        </h2>

        <div className="dish-settings-modal-grid">
          <div className="dish-settings-modal-group">
            <div className="dish-settings-modal-group-title">
              {t("dish_settings_modal_privacy_title")}
            </div>
            <div className="dish-settings-modal-settings-group">
              <p>{t("dish_settings_modal_current_privacy")}</p>
              <select
                className="dish-settings-modal-select"
                value={tempPrivacy ? "public" : "private"}
                onChange={(e) => {
                  const newValue = e.target.value === "public";
                  handlePrivacyChange(newValue);
                }}
              >
                <option value="public">
                  {t("dish_settings_modal_public")}
                </option>
                <option value="private">
                  {t("dish_settings_modal_private")}
                </option>
              </select>
            </div>
          </div>

          {settingOptions.map(renderSettingGroup)}
        </div>
      </div>
    </div>
  );
}
