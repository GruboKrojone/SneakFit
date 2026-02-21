import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Close from "@mui/icons-material/Close";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Restaurant from "@mui/icons-material/Restaurant";

import Description from "@mui/icons-material/Description";
import FitnessCenter from "@mui/icons-material/FitnessCenter";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Delete from "@mui/icons-material/Delete";

import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import CategoryIcon from "@mui/icons-material/Category";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";

import DishesService, { Dish, PreparationStep } from "../services/DishesService";
import IngredientsService from "../services/IngredientsService";
import ImagesService from "../services/ImagesService";
import CategoriesService, { Category } from "../services/CategoriesService";
import "./styles/DishSettingsModal.css";

interface DishSettingsModalProps {
  readonly dishId: number | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onUpdate?: () => void;
}

type ViewState = "menu" | "ingredients" | "macros" | "photos" | "description" | "categories" | "visibility" | "steps";

interface ImageSlot {
  id: number;
  url: string;
}

export default function DishSettingsModal({
  dishId,
  isOpen,
  onClose,
  onUpdate,
}: DishSettingsModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [view, setView] = useState<ViewState>("menu");
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(false);

  const [descText, setDescText] = useState("");
  const [macros, setMacros] = useState({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientDesc, setNewIngredientDesc] = useState("");
  const [addingIngredient, setAddingIngredient] = useState(false);

  const [steps, setSteps] = useState<PreparationStep[]>([]);
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);
  const [stepsToDelete, setStepsToDelete] = useState<number[]>([]);
  const [stepErrors, setStepErrors] = useState<Set<number>>(new Set());
  const [savingSteps, setSavingSteps] = useState(false);

  const [images, setImages] = useState<ImageSlot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [initialCategoryIds, setInitialCategoryIds] = useState<number[]>([]);
  const [categoriesChanged, setCategoriesChanged] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowDeleteConfirm(false);
    setCategoriesChanged(false);
    if (isOpen && dishId) {
      loadDish();
      setView("menu");
    }
  }, [isOpen, dishId]);

  const loadDish = async () => {
    if (!dishId) return;
    setLoading(true);
    try {
      const [dishData, categoriesData, stepsData] = await Promise.all([
        DishesService.getDishById(dishId),
        CategoriesService.getAllCategories(),
        DishesService.getSteps(dishId)
      ]);

      if (dishData) {
        setDish(dishData);
        setDescText(dishData.description || "");
        setMacros({
          calories: dishData.calories || 0,
          protein: dishData.protein || 0,
          fat: dishData.fat || 0,
          carbs: dishData.carbs || 0,
        });

        if (categoriesData) {
          setCategories(categoriesData);
        }

        if (stepsData) {
          setSteps([...stepsData].sort((a, b) => a.order - b.order));
        }
        
        if (dishData.categories) {
           const ids = dishData.categories.map((c: any) => c.id);
           setSelectedCategoryIds(ids);
           setInitialCategoryIds(ids);
        }

        try {
          const allImages = await ImagesService.getAllImages(dishId);
          const priorityIds = [dishData.mainImageId, dishData.secondaryImageId, dishData.thirdImageId];
          const sortedImages: ImageSlot[] = [];

          priorityIds.forEach(id => {
            if (!id) return;
            const img = allImages.find(ai => String(ai.id) === String(id));
            if (img && !sortedImages.some(s => s.id === img.id)) {
              sortedImages.push({ id: img.id, url: img.url });
            }
          });

          allImages.forEach(img => {
            if (!sortedImages.some(existing => existing.id === img.id)) {
              sortedImages.push({ id: img.id, url: img.url });
            }
          });

          setImages(sortedImages);
        } catch (imgError) {
           console.error("Failed to load images", imgError);
        }
      }
    } catch (error) {
      toast.error(t("error_loading_dish\n"+error));
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (categoriesChanged && onUpdate) {
      onUpdate();
    }
    onClose();
  };

  const handleBack = () => {
    setView("menu");
  };

  const handleGoToSteps = () => {
    setStepsToDelete([]);
    setExpandedStepId(null);
    setStepErrors(new Set());
    setView("steps");
  };

  const handleUpdateDescription = async () => {
    if (!dish) return;
    try {
      await DishesService.updateDish(dish.id, {
        name: dish.name,
        description: descText,
        ...macros,
      });
      toast.success(t("dish_settings_modal_edit_description_success"));
      if (onUpdate) onUpdate();
      onClose();
    } catch {
      toast.error(t("dish_settings_modal_edit_description_error"));
    }
  };

  const handleUpdateMacros = async () => {
    if (!dish) return;
    try {
      await DishesService.updateDish(dish.id, {
        name: dish.name,
        description: descText,
        ...macros,
      });
      toast.success(t("dish_settings_modal_edit_macros_success"));
      if (onUpdate) onUpdate();
      onClose();
    } catch {
      toast.error(t("dish_settings_modal_edit_macros_error"));
    }
  };

  const handleDeleteIngredient = async (ingredientId: number) => {
    if (!dish) return;
    try {
      await IngredientsService.unassignFromDish(ingredientId, dish.id);
      toast.success(t("update_dish_ingredient_success"));
      loadDish();
    } catch {
      toast.error(t("update_dish_ingredient_error"));
    }
  };

  const handleAddIngredient = async () => {
    if (!dish || !newIngredientName.trim() || !newIngredientDesc.trim()) return;
    setAddingIngredient(true);
    try {
      const newIng = await IngredientsService.addIngredient({
        name: newIngredientName,
        description: newIngredientDesc
      });
      await IngredientsService.assignToDish(newIng.id, dish.id);
      setNewIngredientName("");
      setNewIngredientDesc("");
      toast.success(t("update_dish_ingredient_success"));
      loadDish();
    } catch {
      toast.error(t("update_dish_ingredient_error"));
    } finally {
      setAddingIngredient(false);
    }
  };

  const handleStepChange = (id: number, field: 'name' | 'description', value: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    if (field === 'description' && value.trim()) {
      setStepErrors(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleAddEmptyStep = () => {
    const newId = -Math.abs(globalThis.crypto.getRandomValues(new Int32Array(1))[0] || Date.now());
    setSteps(prev => [...prev, { 
      id: newId, 
      name: "", 
      description: "", 
      order: prev.length + 1 
    }]);
    setExpandedStepId(newId);
  };

  const handleRemoveStep = (id: number) => {
    if (id > 0) {
      setStepsToDelete(prev => [...prev, id]);
    }
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveAllSteps = async () => {
    if (!dish) return;

    const emptyStep = steps.find(s => !s.description.trim());
    if (emptyStep) {
      const errorIds = new Set(steps.filter(s => !s.description.trim()).map(s => s.id));
      setStepErrors(errorIds);
      toast.error(t("dish_settings_modal_step_description_required"));
      setExpandedStepId(emptyStep.id);
      return;
    }

    setSavingSteps(true);
    try {
      for (const id of stepsToDelete) {
        try {
          await DishesService.deleteStep(id);
        } catch (error_) {
          console.warn("Could not delete step", id, error_);
        }
      }
      
      for (const step of steps) {
        const stepName = step.name || `${t("create_dish_modal_step")} ${steps.indexOf(step) + 1}`;

        if (step.id > 0) {
           await DishesService.updateStep(step.id, stepName, step.description);
        } else {
           await DishesService.addStep(dish.id, stepName, step.description);
        }
      }
      
      toast.success(t("dish_settings_modal_steps_saved"));
      const updatedSteps = await DishesService.getSteps(dish.id);
      setSteps([...updatedSteps].sort((a, b) => a.order - b.order));
      setStepsToDelete([]);
    } catch (error) {
      console.error(error);
      toast.error(t("dish_settings_modal_steps_save_error"));
    } finally {
      setSavingSteps(false);
    }
  };



  const handleSavePhotos = async () => {
    if (!dish) return;
    setUploading(true);
    try {
      const imageIds = images
        .map(img => {
          const id = Number(img.id);
          return Number.isNaN(id) ? 0 : id;
        })
        .filter(id => id > 0);

      await ImagesService.assignImagesToDish(dish.id, imageIds);
      toast.success(t("update_dish_photos_success"));
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error(t("update_dish_photos_error\n"+error));
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dish || !e.target.files || e.target.files.length === 0) return;

    if (images.length + e.target.files.length > 3) {
      toast.warn(t("create_dish_modal_max_images"));
      return;
    }
    
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const uploadPromises = files.map(file => ImagesService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const newImages = results.map(result => ({ id: result.id, url: result.url }));
      setImages([...images, ...newImages]);
    } catch {
      toast.error(t("image_service_upload_failed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
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
    
    setImages(newImages);
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };



  const handleDeleteDish = () => {
    if (!dish) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!dish) return;
    try {
      await DishesService.deleteDish(dish.id);
      toast.success(t("dish_settings_modal_delete_success"));
      setShowDeleteConfirm(false);
      onClose();
      navigate(`/${locale || "en"}/dishes`);
      // No onUpdate() here after delete, because we are navigating away and the dish is gone.
    } catch {
      toast.error(t("dish_settings_modal_delete_error"));
    }
  };
  
  const handlePrivacyToggle = () => {
    if (!dish) return;
    
    if (!dish.isPublic && steps.length === 0) {
      toast.error(t("dish_settings_modal_privacy_public_no_steps_error"));
      return;
    }

    if (!dish.isPublic && images.length === 0) {
      toast.error(t("dish_settings_modal_privacy_public_no_photos_error"));
      return;
    }
    
    setShowPrivacyConfirm(true);
  };

  const confirmPrivacyChange = async () => {
    if (!dish) return;
    try {
      if (dish.isPublic) {
        await DishesService.setDishPrivate(dish.id);
      } else {
        await DishesService.setDishPublic(dish.id);
      }
      toast.success(t("dish_settings_modal_privacy_updated"));
      setShowPrivacyConfirm(false);
      loadDish();
    } catch (error) {
       toast.error(`${t("dish_settings_modal_privacy_update_error")}\n${error}`);
    }
  };

  const handleSaveCategories = async () => {
    if (!dish) return;

    if (selectedCategoryIds.length === 0) {
      toast.error(t("create_dish_modal_category_required"));
      return;
    }

    const toAdd = selectedCategoryIds.filter((id) => !initialCategoryIds.includes(id));
    const toRemove = initialCategoryIds.filter((id) => !selectedCategoryIds.includes(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      setView("menu");
      return;
    }

    try {
      const promises = [
        ...toAdd.map((id) => CategoriesService.assignToDish(id, dish.id)),
        ...toRemove.map((id) => CategoriesService.unassignFromDish(id, dish.id)),
      ];

      await Promise.all(promises);

      toast.success(t("dish_settings_modal_categories_updated_success"));
      setInitialCategoryIds(selectedCategoryIds);

      loadDish();
      if (onUpdate) onUpdate();
      setView("menu");
    } catch (error) {
      console.error("Failed to update categories", error);
      toast.error(t("dish_settings_modal_categories_updated_error"));
    }
  };

  const handleToggleCategory = (categoryId: number) => {
    if (!dish) return;
    
    const isSelected = selectedCategoryIds.includes(categoryId);
    
    if (!isSelected && selectedCategoryIds.length >= 5) {
      toast.warn(t("create_dish_modal_max_categories"));
      return;
    }

    if (isSelected) {
      setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
    } else {
      setSelectedCategoryIds(prev => [...prev, categoryId]);
    }
    
    setCategoriesChanged(true); 
  };

  const renderPhotos = () => (
    <div className="image-step-container">
       <p className="step-hint">
         {t("create_dish_modal_main_image_hint")}
       </p>
       <p className="step-subhint">{t("create_dish_modal_drag_hint")}</p>

       <ul className={`images-grid ${images.length === 0 ? 'empty' : ''}`}>
         {images.map((img, index) => {
           const mainImageLabel = index === 0 ? ` - ${t("create_dish_modal_main_image")}` : '';
           const imageLabel = `${t("create_dish_modal_image")} ${index + 1}${mainImageLabel}`;
           return (
             <li key={img.id} className={`image-card-wrapper ${index === 0 ? 'main' : ''}`}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div
                  className={`image-card ${draggedIndex === index ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  aria-label={imageLabel}
                >
                 <div className="drag-handle" aria-hidden="true">
                   <DragIndicatorIcon />
                 </div>
                 <img src={img.url} alt={`${t("dish_alt_text")} ${index + 1}`} />
                 {index === 0 && <span className="main-badge">{t("dish_main_badge")}</span>}
               </div>
               <button 
                 type="button"
                 className="remove-image-btn" 
                 onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                 }}
               >
                 <Close fontSize="small" />
               </button>
             </li>
           );
         })}
         {images.length < 3 && (
            <li className="add-image-wrapper">
              <button 
                className="add-image-card" 
                onClick={handleAddPhotoClick}
                disabled={uploading}
              >
                {uploading ? (
                  <div className="spinner-small" />
                ) : (
                  <>
                    <AddPhotoAlternate className="add-photo-icon" />
                    <span>{t("create_dish_modal_upload_images")}</span>
                  </>
                )}
              </button>
            </li>
         )}
       </ul>
       
       <input 
         type="file" 
         ref={fileInputRef} 
         hidden 
         accept="image/*"
         multiple
         onChange={handleFileChange}
       />

       <button className="save-button" onClick={handleSavePhotos} disabled={uploading}>
         {uploading ? t("submitting") : t("profile_settings_save")}
       </button>
    </div>
  );

  const getCategoryName = (category: Category) => {
    switch (i18n.language) {
      case "pl": return category.namePl;
      case "de": return category.nameDe;
      case "es": return category.nameEs;
      default: return category.nameEn;
    }
  };

  const renderVisibility = () => (
    <div className="form-container">
       <div className="visibility-status">
          {dish?.isPublic ? (
             <>
               <PublicIcon className="visibility-icon--public" />
               <h3>{t("dish_settings_modal_public")}</h3>
             </>
          ) : (
             <>
               <LockIcon className="visibility-icon--private" />
               <h3>{t("dish_settings_modal_private")}</h3>
             </>
          )}
       </div>

       <div className="form-group">
           <p className="visibility-text">
             {t("dish_settings_modal_current_privacy")} <strong>{dish?.isPublic 
                ? t("dish_settings_modal_public")
                : t("dish_settings_modal_private")
             }</strong>
          </p>
          
           <button 
            onClick={handlePrivacyToggle}
            className={`save-button ${dish?.isPublic ? 'toggle-btn--public' : 'toggle-btn--private'}`}
          >
             {dish?.isPublic ? t("dish_settings_modal_private") : t("dish_settings_modal_public")}
          </button>
       </div>
    </div>
  );

  const renderCategories = () => (
    <div className="form-container form-container--flex">
       <p className="step-hint">
          {t("create_dish_modal_categories_hint")}
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
               onClick={() => handleToggleCategory(category.id)}
               style={{ 
                 borderColor: category.color,
                 color: selectedCategoryIds.includes(category.id) ? '#ffffff' : category.color,
                 background: selectedCategoryIds.includes(category.id) ? category.color : `${category.color}15`
               }}
             >
               {getCategoryName(category)}
             </button>
           ))
         )}
       </div>

       <div className="categories-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
            <button 
                className="save-button" 
                onClick={handleSaveCategories}
            >
                {t("dish_settings_modal_edit_description_save")}
            </button>
        </div>
    </div>
  );

  const renderMenu = () => (
    <div className="settings-menu">
      <button className="menu-button" onClick={() => setView("description")}>
        <div className="menu-button-content">
          <Description />
          {t("dish_settings_modal_edit_description")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("ingredients")}>
        <div className="menu-button-content">
          <Restaurant />
          {t("dish_settings_modal_edit_ingredients")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("macros")}>
        <div className="menu-button-content">
          <FitnessCenter />
          {t("dish_settings_modal_edit_macronutrients")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("photos")}>
        <div className="menu-button-content">
          <AddPhotoAlternate />
          {t("dish_settings_modal_edit_photos")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={handleGoToSteps}>
        <div className="menu-button-content">
          <FormatListNumbered />
          {t("dish_settings_modal_edit_steps")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("categories")}>
         <div className="menu-button-content">
           <CategoryIcon />
           {t("dish_settings_modal_edit_categories")}
         </div>
         <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("visibility")}>
         <div className="menu-button-content">
           <Visibility />
           {t("dish_settings_modal_privacy_title")}
         </div>
         <ChevronRight />
      </button>
      <button className="menu-button delete-button menu-button--delete" onClick={handleDeleteDish}>
        <div className="menu-button-content">
          <Delete />
          {t("dish_settings_modal_delete_button")}
        </div>
      </button>
    </div>
  );

  const renderDescription = () => (
    <div className="form-container">
      <div className="form-group">
        <label>{t("create_dish_modal_name")}</label>
        <input
          value={dish?.name || ""}
          onChange={(e) => setDish(dish ? { ...dish, name: e.target.value } : null)}
          placeholder={t("create_dish_modal_name_placeholder")}
        />
      </div>
      <div className="form-group">
        <label>{t("create_dish_modal_description")}</label>
        <textarea
          rows={6}
          value={descText}
          onChange={(e) => setDescText(e.target.value)}
          placeholder={t("create_dish_modal_description_placeholder")}
        />
      </div>
      <button className="save-button" onClick={handleUpdateDescription}>
        {t("profile_settings_save")}
      </button>
    </div>
  );

  const renderMacros = () => (
    <div className="form-container">
      <div className="form-group">
        <label>{t("create_dish_modal_calories")}</label>
        <input
          type="number"
          value={macros.calories}
          onChange={(e) => setMacros({...macros, calories: Number(e.target.value)})}
        />
      </div>
      <div className="form-group">
        <label>{t("create_dish_modal_protein")}</label>
        <input
          type="number"
          value={macros.protein}
          onChange={(e) => setMacros({...macros, protein: Number(e.target.value)})}
        />
      </div>
      <div className="form-group">
        <label>{t("create_dish_modal_fat")}</label>
        <input
          type="number"
          value={macros.fat}
          onChange={(e) => setMacros({...macros, fat: Number(e.target.value)})}
        />
      </div>
      <div className="form-group">
        <label>{t("create_dish_modal_carbs")}</label>
        <input
          type="number"
          value={macros.carbs}
          onChange={(e) => setMacros({...macros, carbs: Number(e.target.value)})}
        />
      </div>
      <button className="save-button" onClick={handleUpdateMacros}>
        {t("profile_settings_save")}
      </button>
    </div>
  );

  const renderIngredients = () => (
    <div className="form-container">
      <div className="ingredient-list">
        {dish?.ingredients?.map((ing) => (
          <div key={ing.id} className="ingredient-item">
            <div>
              <h4>{ing.name}</h4>
              <p>{ing.description}</p>
            </div>
            <button className="delete-btn" onClick={() => handleDeleteIngredient(ing.id)}>
              <Delete fontSize="small" />
            </button>
          </div>
        ))}
        {(!dish?.ingredients || dish.ingredients.length === 0) && (
          <p className="empty-message">{t("create_dish_modal_no_ingredients")}</p>
        )}
      </div>

      <div className="add-ingredient-form">
        <h4>{t("create_dish_modal_add_ingredient")}</h4>
        <div className="form-group">
           <input 
             placeholder={t("create_dish_modal_ingredient_name")} 
             value={newIngredientName}
             onChange={(e) => setNewIngredientName(e.target.value)}
           />
        </div>
        <div className="form-group">
           <input 
             placeholder={t("create_dish_modal_ingredient_quantity")} 
             value={newIngredientDesc}
             onChange={(e) => setNewIngredientDesc(e.target.value)}
           />
        </div>
        <button 
          className="add-btn" 
          onClick={handleAddIngredient}
          disabled={addingIngredient}
        >
          <AddIcon /> {addingIngredient ? t("submitting") : t("create_dish_modal_add_ingredient")}
        </button>
      </div>
    </div>
  );

  const renderSteps = () => (
    <div className="form-container">
      <div className="ingredient-list">
        {steps.map((step, index) => {
          const isExpanded = expandedStepId === step.id;
          return (
            <div key={step.id} className="step-item-container">
               <button 
                   type="button"
                   className={`step-summary ${isExpanded ? 'expanded' : ''}`}
                   onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                   aria-expanded={isExpanded}
               >
                   <div className="step-summary-left">
                       {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                       <span className="step-summary-label">{step.name || `${t("create_dish_modal_step")} ${index + 1}`}</span>
                   </div>
                   <Delete 
                       onClick={(e: React.MouseEvent) => {
                           e.stopPropagation(); 
                           handleRemoveStep(step.id);
                       }} 
                       className="step-delete-icon"
                   />
               </button>
               <div className={`step-content ${isExpanded ? 'step-content--expanded' : 'step-content--collapsed'}`}>
                   <div className="step-content-overflow">
                       <div className="step-form-group">
                           <input 
                             className="step-name-input"
                             value={step.name}
                             onChange={(e) => handleStepChange(step.id, 'name', e.target.value)}
                             placeholder={t("create_dish_modal_step_name")}
                           />
                            <div className="step-textarea-wrapper">
                              <textarea 
                                  className={`step-description-textarea${stepErrors.has(step.id) ? ' input-error' : ''}`}
                                  value={step.description}
                                  maxLength={500}
                                  onChange={(e) => {
                                      handleStepChange(step.id, 'description', e.target.value);
                                      e.target.style.height = "auto";
                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                  }}
                                  ref={(el) => {
                                      if (el) {
                                          el.style.height = "auto";
                                          el.style.height = `${el.scrollHeight}px`;
                                      }
                                  }}
                                  placeholder={t("create_dish_modal_step_description_placeholder")}
                              />
                              {stepErrors.has(step.id) && (
                                <span className="error-text">
                                  {t("dish_settings_modal_step_description_required")}
                                </span>
                              )}
                              <div className={`step-char-count ${step.description.length >= 500 ? 'limit' : ''}`}>
                                  {step.description.length}/500
                              </div>
                            </div>
                       </div>
                   </div>
               </div>
            </div>
          );
        })}
        {steps.length === 0 && (
          <p className="empty-message">{t("create_dish_modal_no_steps")}</p>
        )}
      </div>

      <button 
          type="button" 
          className="add-btn" 
          onClick={handleAddEmptyStep}
      >
           <AddIcon /> {t("create_dish_modal_add_step")}
      </button>

      <button 
        className="save-button" 
        onClick={handleSaveAllSteps} 
        disabled={savingSteps}
      >
        {savingSteps ? t("submitting") : t("profile_settings_save")}
      </button>
    </div>
  );





  return (
    <div 
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={handleModalClose}
    >
      <div className="modal-content" onPointerDown={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleModalClose}>
          <Close />
        </button>
        <div className="modal-header">
          {view !== "menu" && (
            <button className="back-arrow" onClick={handleBack}>
              <ArrowBack />
            </button>
          )}
          
          <h2 className="modal-title">
            {view === "menu" && t("dish_settings_modal_title")}
            {view === "ingredients" && t("dish_settings_modal_edit_ingredients")}
            {view === "macros" && t("dish_settings_modal_edit_macronutrients")}
            {view === "photos" && t("dish_settings_modal_edit_photos")}
            {view === "categories" && t("dish_settings_modal_edit_categories")}
            {view === "description" && t("dish_settings_modal_edit_description")}
            {view === "steps" && t("dish_settings_modal_edit_steps")}
            {view === "visibility" && t("dish_settings_modal_privacy_title")}
          </h2>
        </div>

        {loading ? (
          <div className="modal-loading">
            <p>{t("loading")}</p>
          </div>
        ) : (
          <>
            {view === "menu" && renderMenu()}
            {view === "ingredients" && renderIngredients()}
            {view === "macros" && renderMacros()}
            {view === "photos" && renderPhotos()}
            {view === "categories" && renderCategories()}
            {view === "description" && renderDescription()}
            {view === "steps" && renderSteps()}
            {view === "visibility" && renderVisibility()}
          </>
        )}

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay" onPointerDown={(e) => e.stopPropagation()}>
            <div className="delete-confirm-modal">
              <h4>{t("delete_dish_modal_title")}</h4>
              <p>{t("delete_dish_modal_message")}</p>
              <div className="delete-confirm-actions">
                <button
                  className="delete-confirm-btn cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  className="delete-confirm-btn confirm"
                  onClick={confirmDelete}
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPrivacyConfirm && (
          <div className="delete-confirm-overlay" onPointerDown={(e) => e.stopPropagation()}>
            <div className="delete-confirm-modal">
              <h4>{t("dish_settings_modal_confirm_change_title")}</h4>
              <p>{t("dish_settings_modal_confirm_change_message")}</p>
              <div className="delete-confirm-actions">
                <button
                  className="delete-confirm-btn cancel"
                  onClick={() => setShowPrivacyConfirm(false)}
                >
                  {t("dish_settings_modal_confirm_no")}
                </button>
                <button
                  className="delete-confirm-btn confirm"
                  onClick={confirmPrivacyChange}
                >
                  {t("dish_settings_modal_confirm_yes")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
