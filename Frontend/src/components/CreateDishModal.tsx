import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const createDishSchemaType = z.object({
  name: z.string(),
  calories: z.coerce.number(),
  protein: z.coerce.number(),
  carbs: z.coerce.number(),
  fat: z.coerce.number(),
  description: z.string(),
});

type CreateDishFormData = z.infer<typeof createDishSchemaType>;

export default function CreateDishModal({
  isOpen,
  onClose,
  onDishAdded,
}: CreateDishModalProps) {
  const { t } = useTranslation();

  const createDishSchema = z.object({
    name: z.string().min(1, t("create_dish_modal_name_required")).trim(),
    calories: z.coerce
      .number()
      .positive(t("create_dish_modal_calories_must_be_positive")),
    protein: z.coerce
      .number()
      .min(0, t("create_dish_modal_protein_cannot_be_negative")),
    carbs: z.coerce
      .number()
      .min(0, t("create_dish_modal_carbs_cannot_be_negative")),
    fat: z.coerce
      .number()
      .min(0, t("create_dish_modal_fat_cannot_be_negative")),
    description: z
      .string()
      .min(1, t("create_dish_modal_description_required"))
      .max(500, t("create_dish_modal_description_max"))
      .trim(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateDishFormData>({
    resolver: zodResolver(createDishSchema) as any,
    defaultValues: {
      name: "",
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      description: "",
    },
  });

  const description = watch("description");

  const onSubmit = async (data: CreateDishFormData) => {
    try {
      const newDish: Omit<Dish, "id"> = {
        name: data.name,
        description: data.description,
        calories: data.calories,
        carbs: data.carbs,
        protein: data.protein,
        fat: data.fat,
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

      reset();

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

        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
          <div className="form-group">
            <label htmlFor="name">{t("create_dish_modal_name")}</label>
            <input
              type="text"
              id="name"
              placeholder={t("create_dish_modal_name_placeholder")}
              {...register("name")}
            />
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calories">
                {t("create_dish_modal_calories")}
              </label>
              <input
                type="number"
                id="calories"
                placeholder={t("create_dish_modal_calories_placeholder")}
                {...register("calories")}
              />
              {errors.calories && (
                <span className="error-text">{errors.calories.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="protein">{t("create_dish_modal_protein")}</label>
              <input
                type="number"
                id="protein"
                placeholder={t("create_dish_modal_protein_placeholder")}
                {...register("protein")}
              />
              {errors.protein && (
                <span className="error-text">{errors.protein.message}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="carbs">{t("create_dish_modal_carbs")}</label>
              <input
                type="number"
                id="carbs"
                placeholder={t("create_dish_modal_carbs_placeholder")}
                {...register("carbs")}
              />
              {errors.carbs && (
                <span className="error-text">{errors.carbs.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fat">{t("create_dish_modal_fat")}</label>
              <input
                type="number"
                id="fat"
                placeholder={t("create_dish_modal_fat_placeholder")}
                {...register("fat")}
              />
              {errors.fat && <span className="error-text">{errors.fat.message}</span>}
            </div>
          </div>

          <div
            className="form-group-description"
            style={{ position: "relative" }}
          >
            <label htmlFor="description">
              {t("create_dish_modal_description")}
            </label>
            <textarea
              id="description"
              placeholder={t("create_dish_modal_description_placeholder")}
              maxLength={500}
              style={{ paddingBottom: "2.2rem" }}
              {...register("description")}
            />
            <div
              style={{
                position: "absolute",
                bottom: "0.5rem",
                right: "1rem",
                fontSize: "0.95rem",
                color: "#888",
                pointerEvents: "none",
              }}
            >
              {description.length}/500
            </div>
            {errors.description && (
              <span className="error-text">{errors.description.message}</span>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("create_dish_modal_submit_button")}
          </button>
        </form>
      </div>
    </div>
  );
}
