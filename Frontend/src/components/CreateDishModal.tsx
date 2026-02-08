import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Close from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import DishesService from "../services/DishesService";
import ImagesService from "../services/ImagesService";
import IngredientsService from "../services/IngredientsService";
import CategoriesService, { Category } from "../services/CategoriesService";
import type { Dish } from "../services/DishesService";
import type { PreviewImage } from "../services/ImagesService";
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

interface LocalIngredient {
  id: string;
  name: string;
  description: string;
}

export default function CreateDishModal({
  isOpen,
  onClose,
  onDishAdded,
}: CreateDishModalProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [dishFormData, setDishFormData] = useState<CreateDishFormData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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

  const step2Schema = z.object({
    ingredientName: z
      .string()
      .trim()
      .min(1, t("create_dish_modal_ingredient_name_required")),
    ingredientDescription: z
      .string()
      .trim()
      .min(1, t("create_dish_modal_ingredient_quantity_required")),
    ingredientsList: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
        })
      )
      .min(1, t("create_dish_modal_min_ingredients_required")),
  });

  type Step2FormData = z.infer<typeof step2Schema>;

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 },
    reset: resetStep1,
    watch: watchStep1,
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

  const {
    register: registerStep2,
    formState: { errors: errorsStep2 },
    trigger: triggerStep2,
    setValue: setValueStep2,
    watch: watchStep2,
    reset: resetStep2,
    getValues: getValuesStep2,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      ingredientsList: [],
      ingredientName: "",
      ingredientDescription: "",
    },
  });

  const description = watchStep1("description");
  const ingredients = watchStep2("ingredientsList");
  const ingredientName = watchStep2("ingredientName");
  const ingredientDescription = watchStep2("ingredientDescription");

  const step3Schema = z.object({
    imagesList: z
      .array(z.any())
      .min(1, t("create_dish_modal_images_required")),
  });

  type Step3FormData = z.infer<typeof step3Schema>;

  const {
    formState: { errors: errorsStep3 },
    setValue: setValueStep3,
    watch: watchStep3,
    trigger: triggerStep3,
    reset: resetStep3,
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      imagesList: [],
    },
  });

  const images = watchStep3("imagesList");

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await CategoriesService.getAllCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cId) => cId !== id);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, id];
    });
  };



  const onStep1Submit = (data: CreateDishFormData) => {
    setDishFormData(data);
    setStep(2);
  };

  const handleAddIngredient = async () => {
    const isValid = await triggerStep2(["ingredientName", "ingredientDescription"]);
    
    if (isValid) {
      const newIngredient: LocalIngredient = {
        id: crypto.randomUUID(),
        name: ingredientName.trim(),
        description: ingredientDescription.trim(),
      };

      const currentIngredients = getValuesStep2("ingredientsList");
      setValueStep2("ingredientsList", [...currentIngredients, newIngredient], {
        shouldValidate: true,
      });
      setValueStep2("ingredientName", "");
      setValueStep2("ingredientDescription", "");
    }
  };

  const handleRemoveIngredient = (id: string) => {
    const currentIngredients = getValuesStep2("ingredientsList");
    setValueStep2(
      "ingredientsList",
      currentIngredients.filter((ing) => ing.id !== id),
      { shouldValidate: true }
    );
  };
  
  const handleStep2Next = async () => {
    const isValid = await triggerStep2("ingredientsList");
    if (isValid) {
      setStep(3);
    }
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

    setValueStep3("imagesList", [...images, ...newImages], { shouldValidate: true });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setValueStep3(
      "imagesList",
      images.filter((img) => img.id !== imageId),
      { shouldValidate: true }
    );
  };

  const handleStep3Next = async () => {
    const isValid = await triggerStep3("imagesList");
    if (isValid) {
      setStep(4);
    }
  };

  const handleFinish = async () => {
    if (!dishFormData) return;
    

    setIsUploading(true);

    try {
      if (selectedCategoryIds.length === 0) {
        toast.error(t("create_dish_modal_category_required"));
        setIsUploading(false);
        return;
      }

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

      const uploadPromises = images.map(img => ImagesService.uploadImage(img.file));
      const uploadResults = await Promise.all(uploadPromises);
      
      const uploadedImageIds = uploadResults.map((result) => result.id);
      
      if (uploadedImageIds.length > 0) {
        await ImagesService.assignImagesToDish(dishId, uploadedImageIds);
      }

      const currentIngredients = getValuesStep2("ingredientsList");
      if (currentIngredients.length > 0) {
        const ingredientIds: number[] = [];
        
        for (const ing of currentIngredients) {
          const result = await IngredientsService.addIngredient({
            name: ing.name,
            description: ing.description,
          });
          ingredientIds.push(result.id);
        }
        
        await IngredientsService.assignMultipleIngredientsToDish(ingredientIds, dishId);
      }

      if (selectedCategoryIds.length > 0) {
        for (const catId of selectedCategoryIds) {
          await CategoriesService.assignToDish(catId, dishId);
        }
      }
      
      
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
    
    resetStep1();
    resetStep2();
    resetStep3();
    setStep(1);
    setSelectedCategoryIds([]);
    setDishFormData(null);
    onClose();
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("index", index.toString());
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = Number.parseInt(e.dataTransfer.getData("index"), 10);
    if (sourceIndex === targetIndex) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(sourceIndex, 1);
    newImages.splice(targetIndex, 0, movedImage);
    setValueStep3("imagesList", newImages, { shouldValidate: true });
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleKeyboardReorder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(index, 1);
    newImages.splice(targetIndex, 0, movedImage);
    setValueStep3("imagesList", newImages, { shouldValidate: true });
  };

  const handleImageCardKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      handleKeyboardReorder(index, 'up');
    } else if (e.key === 'ArrowDown' && index < images.length - 1) {
      e.preventDefault();
      handleKeyboardReorder(index, 'down');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return t("create_dish_modal_step_1");
      case 2:
        return t("create_dish_modal_step_2");
      case 3:
        return t("create_dish_modal_step_3");
      case 4:
        return t("create_dish_modal_step_4");
      default:
        return "";
    }
  };

  const getStepClass = (stepNumber: 1 | 2 | 3 | 4) => {
    if (step === stepNumber) return 'active';
    if (step > stepNumber) return 'completed';
    return '';
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

        <h2 className="modal-title">{getStepTitle()}</h2>

        <ol className="step-markers">
          <li className={`step-item ${getStepClass(1)}`} aria-current={step === 1 ? 'step' : undefined}>
            <div className="step-marker" aria-label={`${t("create_dish_modal_step")} 1`}></div>
          </li>
          <li className={`step-item ${getStepClass(2)}`} aria-current={step === 2 ? 'step' : undefined}>
            <div className="step-marker" aria-label={`${t("create_dish_modal_step")} 2`}></div>
          </li>
          <li className={`step-item ${getStepClass(3)}`} aria-current={step === 3 ? 'step' : undefined}>
            <div className="step-marker" aria-label={`${t("create_dish_modal_step")} 3`}></div>
          </li>
          <li className={`step-item ${getStepClass(4)}`} aria-current={step === 4 ? 'step' : undefined}>
            <div className="step-marker" aria-label={`${t("create_dish_modal_step")} 4`}></div>
          </li>
        </ol>

        {step === 1 && (
          <form onSubmit={handleSubmitStep1(onStep1Submit)} className="form-container">
            <div className="form-group">
              <label htmlFor="name">{t("create_dish_modal_name")}:
                <span className="required-indicator"> *</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder={t("create_dish_modal_name_placeholder")}
                {...registerStep1("name")}
              />
              {errorsStep1.name && <span className="error-text">{errorsStep1.name.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="calories">  
                {t("create_dish_modal_calories")}:
                <span className="required-indicator"> *</span>
              </label>
              <input
                type="number"
                id="calories"
                placeholder={t("create_dish_modal_calories_placeholder")}
                {...registerStep1("calories")}
              />
              {errorsStep1.calories && (
                <span className="error-text">{errorsStep1.calories.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="protein">{t("create_dish_modal_protein")}:</label>
              <input
                type="number"
                id="protein"
                placeholder={t("create_dish_modal_protein_placeholder")}
                {...registerStep1("protein")}
              />
              {errorsStep1.protein && (
                <span className="error-text">{errorsStep1.protein.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="carbs">{t("create_dish_modal_carbs")}:</label>
              <input
                type="number"
                id="carbs"
                placeholder={t("create_dish_modal_carbs_placeholder")}
                {...registerStep1("carbs")}
              />
              {errorsStep1.carbs && (
                <span className="error-text">{errorsStep1.carbs.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fat">{t("create_dish_modal_fat")}:</label>
              <input
                type="number"
                id="fat"
                placeholder={t("create_dish_modal_fat_placeholder")}
                {...registerStep1("fat")}
              />
              {errorsStep1.fat && <span className="error-text">{errorsStep1.fat.message}</span>}
            </div>

            <div
              className="form-group"
              style={{ position: "relative" }}
            >
              <label htmlFor="description">
                {t("create_dish_modal_description")}:
                <span className="required-indicator"> *</span>
              </label>
              <textarea
                id="description"
                placeholder={t("create_dish_modal_description_placeholder")}
                maxLength={500}
                style={{ paddingBottom: "2.2rem" }}
                {...registerStep1("description")}
              />
              <div className="char-count">
                {description.length}/500
              </div>
              {errorsStep1.description && (
                <span className="error-text">{errorsStep1.description.message}</span>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isSubmittingStep1}>
              {isSubmittingStep1 ? t("submitting") : t("create_dish_modal_next_button")}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="ingredients-step-container">
            <p className="step-hint">{t("create_dish_modal_ingredients_hint")}
              <span className="required-indicator"> *</span>
            </p>
            
            <div className="ingredient-input-group">
              <div className="form-group">
                <label htmlFor="ingredient-name">{t("create_dish_modal_ingredient_name")}:
                  <span className="required-indicator"> *</span>
                </label>
                <input
                  type="text"
                  id="ingredient-name"
                  placeholder={t("create_dish_modal_ingredient_name_placeholder")}
                  {...registerStep2("ingredientName")}
                />
                {errorsStep2.ingredientName && (
                  <span className="error-text">{errorsStep2.ingredientName.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="ingredient-quantity">{t("create_dish_modal_ingredient_quantity")}:
                  <span className="required-indicator"> *</span>
                </label>
                <input
                  type="text"
                  id="ingredient-quantity"
                  placeholder={t("create_dish_modal_ingredient_quantity_placeholder")}
                  {...registerStep2("ingredientDescription")}
                />
                {errorsStep2.ingredientDescription && (
                  <span className="error-text">{errorsStep2.ingredientDescription.message}</span>
                )}
              </div>
              
              <button 
                type="button"
                className="add-ingredient-button" 
                onClick={handleAddIngredient}
              >
                <AddIcon /> {t("create_dish_modal_add_ingredient")}
              </button>
            </div>

            <div className="ingredients-list">
              {ingredients.length === 0 ? (
                <p className="no-ingredients-text">{t("create_dish_modal_no_ingredients")}</p>
              ) : (
                ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="ingredient-item">
                    <div className="ingredient-info">
                      <span className="ingredient-name">{ingredient.name}</span>
                      <span className="ingredient-quantity">{ingredient.description}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-ingredient-btn"
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                      aria-label={`${t("remove")} ${ingredient.name}`}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
            {errorsStep2.ingredientsList && (
              <div className="error-text" style={{ marginTop: "1rem", textAlign: "center" }}>
                {errorsStep2.ingredientsList.message}
              </div>
            )}

            <div className="step-actions">
              <button 
                className="back-button" 
                onClick={() => setStep(1)}
              >
                {t("create_dish_modal_back_button")}
              </button>
              <button 
                className="submit-button" 
                onClick={handleStep2Next}
              >
                {t("create_dish_modal_next_button")}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="image-step-container">
            <p className="step-hint">
              {t("create_dish_modal_main_image_hint")}
              <span className="required-indicator"> *</span>
            </p>
            <p className="step-subhint">{t("create_dish_modal_drag_hint")}</p>
            
            <ul className={`images-grid ${images.length === 0 ? 'empty' : ''}`}>
              {images.map((image, index) => {
                const mainImageLabel = index === 0 ? ` - ${t("create_dish_modal_main_image")}` : '';
                const imageLabel = `${t("create_dish_modal_image")} ${index + 1}${mainImageLabel}. ${t("create_dish_modal_use_arrows_to_reorder")}`;
                return (
                  <li key={image.id} className={`image-card-wrapper ${index === 0 ? 'main' : ''}`}>
                    <button
                      type="button"
                      className={`image-card ${draggedIndex === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onKeyDown={(e) => handleImageCardKeyDown(e, index)}
                      aria-label={imageLabel}
                    >
                      <div className="drag-handle" aria-hidden="true">
                        <DragIndicatorIcon />
                      </div>
                      <img src={image.url} alt={`${t("create_dish_modal_dish_image")} ${index + 1}`} />
                      {index === 0 && <span className="main-badge" aria-label={t("create_dish_modal_main_image")}>MAIN</span>}
                    </button>
                    <button 
                      type="button"
                      className="remove-image-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      aria-label={`${t("remove")} ${t("create_dish_modal_image")} ${index + 1}`}
                      title={t("remove")}
                    >
                      <DeleteIcon />
                    </button>
                  </li>
                );
              })}
              
              {images.length < 3 && (
                <li className="add-image-wrapper">
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
                </li>
              )}
            </ul>

            {errorsStep3.imagesList && (
              <div className="error-text" style={{ marginTop: "1rem", textAlign: "center" }}>
                {errorsStep3.imagesList.message}
              </div>
            )}

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
                onClick={() => setStep(2)}
              >
                {t("create_dish_modal_back_button")}
              </button>
              <button 
                className="submit-button" 
                onClick={handleStep3Next}
                disabled={isUploading}
              >
                {t("create_dish_modal_next_button")}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="categories-step-container">
            <p className="step-hint">
              {t("create_dish_modal_categories_hint")}
              <span className="required-indicator"> *</span>
            </p>
            <p className="step-subhint">{selectedCategoryIds.length}/5</p>

            <div className="categories-list">
              {categories.length === 0 ? (
                <p className="no-categories-text">{t("create_dish_modal_no_categories")}</p>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`category-tag ${selectedCategoryIds.includes(category.id) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(category.id)}
                    style={{ 
                      borderColor: category.color,
                      color: selectedCategoryIds.includes(category.id) ? '#fff' : category.color,
                      background: selectedCategoryIds.includes(category.id) ? category.color : `${category.color}15`,
                      padding: "0.5rem 1rem",
                      fontSize: "0.8rem"
                    }}
                  >
                    {i18n.language === "pl" ? category.namePl :
                     i18n.language === "de" ? category.nameDe :
                     i18n.language === "es" ? category.nameEs :
                     category.nameEn}
                  </button>
                ))
              )}
            </div>

            <div className="step-actions">
              <button 
                className="back-button" 
                onClick={() => setStep(3)}
              >
                {t("create_dish_modal_back_button")}
              </button>
              <button 
                className="submit-button" 
                onClick={handleFinish}
                disabled={isUploading}
              >
                {isUploading ? t("submitting") : t("create_dish_modal_save_finish")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
