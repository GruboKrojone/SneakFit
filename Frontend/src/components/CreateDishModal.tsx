import { useState } from "react";
import Close from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import DishesService from "../services/DishesService";
import type { Dish } from "../services/DishesService";
import "./styles/CreateDishModal.css";

interface CreateDishModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onDishAdded?: () => void;
}

export default function CreateDishModal({
  isOpen,
  onClose,
  onDishAdded,
}: CreateDishModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    carbs: "",
    protein: "",
    fat: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("create_dish_modal_name_required");
    }

    if (!formData.calories || Number.isNaN(Number(formData.calories))) {
      newErrors.calories = t("create_dish_modal_calories_must_be_number");
    } else if (Number(formData.calories) <= 0) {
      newErrors.calories = t("create_dish_modal_calories_must_be_positive");
    }

    if (!formData.carbs || Number.isNaN(Number(formData.carbs))) {
      newErrors.carbs = t("create_dish_modal_carbs_must_be_number");
    } else if (Number(formData.carbs) < 0) {
      newErrors.carbs = t("create_dish_modal_carbs_cannot_be_negative");
    }

    if (!formData.protein || Number.isNaN(Number(formData.protein))) {
      newErrors.protein = t("create_dish_modal_protein_must_be_number");
    } else if (Number(formData.protein) < 0) {
      newErrors.protein = t("create_dish_modal_protein_cannot_be_negative");
    }

    if (!formData.fat || Number.isNaN(Number(formData.fat))) {
      newErrors.fat = t("create_dish_modal_fat_must_be_number");
    } else if (Number(formData.fat) < 0) {
      newErrors.fat = t("create_dish_modal_fat_cannot_be_negative");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("create_dish_modal_description_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (
      ["calories", "carbs", "protein", "fat"].includes(name) &&
      value &&
      Number.isNaN(Number(value))
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const newDish: Omit<Dish, "id"> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        calories: Number(formData.calories),
        carbs: Number(formData.carbs),
        protein: Number(formData.protein),
        fat: Number(formData.fat),
        rates: 0,
        ownerId: 0,
        ownerName: "",
        isPublic: false,
        categories: [],
        mainImageId: 1,
        secondaryImageId: null,
        thirdImageId: null,
      };

      await DishesService.createDish(newDish);

      if (onDishAdded) {
        onDishAdded();
      }

      setFormData({
        name: "",
        calories: "",
        carbs: "",
        protein: "",
        fat: "",
        description: "",
      });

      toast.success(t("create_dish_modal_success"), {
        position: "top-center",
        autoClose: 2000,
      });

      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("create_dish_modal_error");

      toast.error("✗ " + errorMessage, {
        position: "top-center",
        autoClose: 2000,
      });

      setErrors({
        submit: errorMessage,
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
          title={t("create_dish_modal_close_button")}
        >
          <Close className="close-icon" />
        </button>

        <h2 className="modal-title">{t("create_dish_modal_title")}</h2>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="name">{t("create_dish_modal_name")}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t("create_dish_modal_name_placeholder")}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calories">
                {t("create_dish_modal_calories")}
              </label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                placeholder={t("create_dish_modal_calories_placeholder")}
              />
              {errors.calories && (
                <span className="error-text">{errors.calories}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="protein">{t("create_dish_modal_protein")}</label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                placeholder={t("create_dish_modal_protein_placeholder")}
              />
              {errors.protein && (
                <span className="error-text">{errors.protein}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="carbs">{t("create_dish_modal_carbs")}</label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                placeholder={t("create_dish_modal_carbs_placeholder")}
              />
              {errors.carbs && (
                <span className="error-text">{errors.carbs}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fat">{t("create_dish_modal_fat")}</label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                placeholder={t("create_dish_modal_fat_placeholder")}
              />
              {errors.fat && <span className="error-text">{errors.fat}</span>}
            </div>
          </div>

          <div className="form-group-description">
            <label htmlFor="description">
              {t("create_dish_modal_description")}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t("create_dish_modal_description_placeholder")}
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </div>

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <button type="submit" className="submit-button">
            {t("create_dish_modal_submit_button")}
          </button>
        </form>
      </div>
    </div>
  );
}
