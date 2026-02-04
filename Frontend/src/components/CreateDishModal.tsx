import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Close from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import DishesService from "../services/DishesService";
import ImageService from "../services/ImageService";
import type { Dish } from "../services/DishesService";
import type { PreviewImage } from "../services/ImageService";
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
  const [step, setStep] = useState<1 | 2>(1);
  const [dishFormData, setDishFormData] = useState<CreateDishFormData | null>(null);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onStep1Submit = (data: CreateDishFormData) => {
    setDishFormData(data);
    setStep(2);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      toast.warn(t("create_dish_modal_max_images"));
      return;
    }

    const newImages: PreviewImage[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file: file,
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const handleFinish = async () => {
    if (!dishFormData) return;
    
    if (images.length === 0) {
      toast.error(t("create_dish_modal_images_required"));
      return;
    }

    setIsUploading(true);

    try {
      const newDish: Omit<Dish, "id"> = {
        name: dishFormData.name,
        description: dishFormData.description,
        calories: dishFormData.calories,
        carbs: dishFormData.carbs,
        protein: dishFormData.protein,
        fat: dishFormData.fat,
        rates: 0,
        ownerId: 0,
        ownerName: "",
        isPublic: false,
        categories: [],
        mainImageId: 1,
        secondaryImageId: null,
        thirdImageId: null,
      };

      const dishResult = await DishesService.createDish(newDish);
      const dishId = dishResult.id;

      const uploadPromises = images.map(img => ImageService.uploadImage(img.file));
      const uploadResults = await Promise.all(uploadPromises);
      
      const uploadedImageIds = uploadResults.map((result) => result.id);
      
      if (uploadedImageIds.length === 0) {
        throw new Error(t("create_dish_modal_invalid_images"));
      }

      await ImageService.assignImagesToDish(dishId, uploadedImageIds);
      
      toast.success(t("create_dish_modal_success"));
      if (onDishAdded) onDishAdded();
      
      handleClose();
    } catch (error) {
      console.error("Error finishing dish creation:", error);
      const errorMessage = error instanceof Error ? error.message : t("create_dish_modal_error");
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    
    reset();
    setStep(1);
    setDishFormData(null);
    setImages([]);
    onClose();
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("index", index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const sourceIndex = Number.parseInt(e.dataTransfer.getData("index"), 10);
    if (sourceIndex === targetIndex) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(sourceIndex, 1);
    newImages.splice(targetIndex, 0, movedImage);
    setImages(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={handleClose}
    >
      <div className="modal-content" onPointerDown={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={handleClose}
          title={t("create_dish_modal_close_button")}
        >
          <Close className="close-icon" />
        </button>

        <h2 className="modal-title">
          {step === 1 ? t("create_dish_modal_step_1") : t("create_dish_modal_step_2")}
        </h2>


        <div className="step-indicator">
          <div className={`step-item ${step === 1 ? 'active' : 'completed'}`}>
            <div className="step-marker"></div>
          </div>
          <div className={`step-item ${step === 2 ? 'active' : ''}`}>
            <div className="step-marker"></div>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit(onStep1Submit)} className="form-container">
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

            <div
              className="form-group"
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
              <div className="char-count">
                {description.length}/500
              </div>
              {errors.description && (
                <span className="error-text">{errors.description.message}</span>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("create_dish_modal_next_button")}
            </button>
          </form>
        ) : (
          <div className="image-step-container">
            <p className="step-hint">
              {t("create_dish_modal_main_image_hint")}
              <span className="required-indicator"> *</span>
            </p>
            <p className="step-subhint">{t("create_dish_modal_drag_hint")}</p>
            
            <div className="images-grid">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`image-card ${index === 0 ? 'main' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  aria-label={index === 0 ? t("create_dish_modal_main_image_hint") : undefined}
                >
                  <div className="drag-handle">
                    <DragIndicatorIcon />
                  </div>
                  <img src={image.url} alt={`Dish ${index + 1}`} />
                  <button 
                    className="remove-image-btn" 
                    onClick={() => removeImage(image.id)}
                    title={t("remove")}
                  >
                    <DeleteIcon />
                  </button>
                  {index === 0 && <span className="main-badge">MAIN</span>}
                </div>
              ))}
              
              {images.length < 3 && (
                <button 
                  className="add-image-card" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="spinner-small" />
                  ) : (
                    <>
                      <AddPhotoAlternateIcon className="add-photo-icon" />
                      <span>{t("create_dish_modal_upload_images")}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              style={{ display: "none" }}
            />

            <div className="step-actions">
              <button 
                className="back-button" 
                onClick={() => setStep(1)}
              >
                {t("create_dish_modal_back_button")}
              </button>
              <button 
                className="submit-button" 
                onClick={handleFinish}
              >
                {t("create_dish_modal_save_finish")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
