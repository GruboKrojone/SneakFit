import { useState } from "react";
import Close from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import DishesService from "../services/DishesService";
import type { Dish } from "../services/DishesService";
import { useFetchDishes } from "../hooks/useFetchDishes";
import "./styles/CreateDishModal.css";

interface CreateDishModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function CreateDishModal({
  isOpen,
  onClose,
}: CreateDishModalProps) {
  const { refetchDishes } = useFetchDishes();
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
      newErrors.name = "Nazwa jest wymagana";
    }

    if (!formData.calories || Number.isNaN(Number(formData.calories))) {
      newErrors.calories = "Kalorie muszą być liczbą";
    } else if (Number(formData.calories) <= 0) {
      newErrors.calories = "Kalorie muszą być większe od 0";
    }

    if (!formData.carbs || Number.isNaN(Number(formData.carbs))) {
      newErrors.carbs = "Węglowodany muszą być liczbą";
    } else if (Number(formData.carbs) < 0) {
      newErrors.carbs = "Węglowodany nie mogą być ujemne";
    }

    if (!formData.protein || Number.isNaN(Number(formData.protein))) {
      newErrors.protein = "Białko musi być liczbą";
    } else if (Number(formData.protein) < 0) {
      newErrors.protein = "Białko nie może być ujemne";
    }

    if (!formData.fat || Number.isNaN(Number(formData.fat))) {
      newErrors.fat = "Tłuszcze muszą być liczbą";
    } else if (Number(formData.fat) < 0) {
      newErrors.fat = "Tłuszcze nie mogą być ujemne";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Opis jest wymagany";
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
      await refetchDishes();

      setFormData({
        name: "",
        calories: "",
        carbs: "",
        protein: "",
        fat: "",
        description: "",
      });

      toast.success("✓ Danie dodane pomyślnie!", {
        position: "top-center",
        autoClose: 2000,
      });

      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Błąd przy dodawaniu dania";

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
        <button className="close-button" onClick={onClose} title="Zamknij">
          <Close className="close-icon" />
        </button>

        <h2 className="modal-title">Dodaj nowe danie</h2>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="name">Nazwa</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Wpisz nazwę dania"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calories">Kalorie</label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                placeholder="0"
              />
              {errors.calories && (
                <span className="error-text">{errors.calories}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="protein">Białko (g)</label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                placeholder="0"
              />
              {errors.protein && (
                <span className="error-text">{errors.protein}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="carbs">Węglowodany (g)</label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                placeholder="0"
              />
              {errors.carbs && (
                <span className="error-text">{errors.carbs}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fat">Tłuszcze (g)</label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                placeholder="0"
              />
              {errors.fat && <span className="error-text">{errors.fat}</span>}
            </div>
          </div>

          <div className="form-group-description">
            <label htmlFor="description">Opis</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Wpisz opis dania"
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </div>

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <button type="submit" className="submit-button">
            Dodaj
          </button>
        </form>
      </div>
    </div>
  );
}
