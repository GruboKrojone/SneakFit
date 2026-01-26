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
      customClass: {
        popup: "swal2-popup-custom",
        confirmButton: "swal2-confirm-btn-custom",
        cancelButton: "swal2-cancel-btn-custom",
      },
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
      title: "Edytuj opis",
      input: "textarea",
      inputValue: description,
      inputPlaceholder: "Wpisz opis dania...",
      inputAttributes: {
        "aria-label": "Wpisz opis dania",
        maxlength: "500",
      },
      inputValidator: (value) => {
        if (value && value.length > 500) {
          return "Opis nie może przekraczać 500 znaków!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: "Zapisz",
      cancelButtonText: "Anuluj",
      width: "700px",
      padding: "2.5rem",
      customClass: {
        popup: "swal2-popup-custom",
        confirmButton: "swal2-confirm-btn-custom",
        cancelButton: "swal2-cancel-btn-custom",
        input: "swal2-textarea-custom",
      },
      didOpen: () => {
        const textarea = Swal.getInput();
        if (textarea) {
          textarea.style.minHeight = "500px";
          textarea.style.resize = "vertical";

          // Add character counter
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
        toast.success("Opis został zaktualizowany");
      } catch (error) {
        console.error("Error updating dish description:", error);
        toast.error("Nie udało się zaktualizować opisu");
      }
    }
  };

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
              {tempPrivacy ? (
                <>
                  <option value="public">
                    {t("dish_settings_modal_public")}
                  </option>
                  <option value="private">
                    {t("dish_settings_modal_private")}
                  </option>
                </>
              ) : (
                <>
                  <option value="private">
                    {t("dish_settings_modal_private")}
                  </option>
                  <option value="public">
                    {t("dish_settings_modal_public")}
                  </option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="dish-settings-modal-group">
          <div className="dish-settings-modal-group-title">Edytuj opis</div>
          <div className="dish-settings-modal-group-content">
            <button
              className="dish-settings-modal-edit-btn"
              onClick={handleEditDescription}
            >
              Edytuj opis
            </button>
          </div>
        </div>

        <div className="dish-settings-modal-group">
          <div className="dish-settings-modal-group-title">
            Edytuj kategorie
          </div>
          <div className="dish-settings-modal-group-content">
            {/* Tutaj pole do edycji kategorii */}
          </div>
        </div>

        <div className="dish-settings-modal-group">
          <div className="dish-settings-modal-group-title">
            Edytuj makroskładniki
          </div>
          <div className="dish-settings-modal-group-content">
            {/* Tutaj pole do edycji makroskładników */}
          </div>
        </div>
      </div>
    </div>
  );
}
