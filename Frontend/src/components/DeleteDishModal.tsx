import { useState, useEffect } from "react";
import Close from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "./styles/DeleteDishModal.css";

interface DeleteDishModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export default function DeleteDishModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteDishModalProps) {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after render
      let rafId2: number;

      const rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          setShouldShow(true);
        });
      });

      return () => {
        if (rafId1) cancelAnimationFrame(rafId1);
        if (rafId2) cancelAnimationFrame(rafId2);
      };
    } else {
      setShouldShow(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsChecked(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isVisible, onClose]);

  const handleConfirm = () => {
    if (isChecked) {
      onConfirm();
    } else {
      toast.warning(t("delete_dish_modal_checkbox_required"));
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`delete-modal-overlay ${shouldShow ? "show" : ""}`}>
      <dialog
        className={`delete-modal-content ${shouldShow ? "show" : ""}`}
        aria-labelledby="delete-modal-title"
        open
      >
        <button
          className="delete-modal-close-button"
          onClick={handleClose}
          aria-label="Close"
        >
          <Close className="delete-modal-close-icon" />
        </button>

        <h2 id="delete-modal-title" className="delete-modal-title">
          {t("delete_dish_modal_title")}
        </h2>

        <div className="delete-modal-checkbox-container">
          <label className="delete-modal-checkbox-label">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="delete-modal-checkbox"
            />
            <span className="delete-modal-checkbox-text">
              {t("delete_dish_modal_checkbox")}
            </span>
          </label>
        </div>

        <div className="delete-modal-buttons">
          <button
            className={`delete-modal-button delete-modal-button-delete ${
              isChecked ? "" : "disabled"
            }`}
            onClick={handleConfirm}
            disabled={!isChecked}
          >
            {t("delete_dish_modal_delete")}
          </button>
          <button
            className="delete-modal-button delete-modal-button-cancel"
            onClick={handleClose}
          >
            {t("delete_dish_modal_cancel")}
          </button>
        </div>
      </dialog>
    </div>
  );
}
