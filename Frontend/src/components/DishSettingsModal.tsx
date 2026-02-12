import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Close from "@mui/icons-material/Close";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Restaurant from "@mui/icons-material/Restaurant";

import Description from "@mui/icons-material/Description";
import FitnessCenter from "@mui/icons-material/FitnessCenter";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import CategoryIcon from "@mui/icons-material/Category";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { toast } from "react-toastify";

import DishesService, { Dish } from "../services/DishesService";
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

type ViewState = "menu" | "ingredients" | "macros" | "photos" | "description" | "categories";

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
  const [view, setView] = useState<ViewState>("menu");
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(false);

  const [descText, setDescText] = useState("");
  const [macros, setMacros] = useState({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientDesc, setNewIngredientDesc] = useState("");
  const [addingIngredient, setAddingIngredient] = useState(false);

  const [images, setImages] = useState<ImageSlot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
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
      const [dishData, categoriesData] = await Promise.all([
        DishesService.getDishById(dishId),
        CategoriesService.getAllCategories()
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
        
        // Assuming dishData has categories array
        if (dishData.categories) {
           setSelectedCategoryIds(dishData.categories.map((c: any) => c.id));
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

  const handleUpdateDescription = async () => {
    if (!dish) return;
    try {
      await DishesService.updateDish(dish.id, {
        name: dish.name,
        description: descText,
        ...macros,
      });
      toast.success(t("update_dish_description_success"));
      if (onUpdate) onUpdate();
      onClose();
    } catch {
      toast.error(t("update_dish_description_error"));
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
      toast.success(t("update_dish_macros_success"));
      if (onUpdate) onUpdate();
      onClose();
    } catch {
      toast.error(t("update_dish_macros_error"));
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
      navigate("/dishes");
      if (onUpdate) onUpdate();
    } catch {
      toast.error(t("dish_settings_modal_delete_error"));
    }
  };

  const handleToggleCategory = async (categoryId: number) => {
    if (!dish) return;
    
    const isSelected = selectedCategoryIds.includes(categoryId);
    
    if (!isSelected && selectedCategoryIds.length >= 5) {
      toast.warn(t("create_dish_modal_max_categories"));
      return;
    }

    // Optimistic update
    if (isSelected) {
      setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
    } else {
      setSelectedCategoryIds(prev => [...prev, categoryId]);
    }

    try {
      if (isSelected) {
        await CategoriesService.unassignFromDish(categoryId, dish.id);
      } else {
        await CategoriesService.assignToDish(categoryId, dish.id);
      }
      setCategoriesChanged(true);
    } catch {
      // Revert on error
      if (isSelected) {
        setSelectedCategoryIds(prev => [...prev, categoryId]);
      } else {
        setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
      }
      toast.error(t("categories_service_update_failed"));
    }
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

  const renderCategories = () => (
    <div className="form-container" style={{ display: 'flex', flexDirection: 'column' }}>
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
                 color: selectedCategoryIds.includes(category.id) ? '#fff' : category.color,
                 background: selectedCategoryIds.includes(category.id) ? category.color : `${category.color}15`
               }}
             >
               {getCategoryName(category)}
             </button>
           ))
         )}
       </div>
    </div>
  );

  const renderMenu = () => (
    <div className="settings-menu">
      <button className="menu-button" onClick={() => setView("description")}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Description />
          {t("dish_settings_modal_edit_description")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("ingredients")}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Restaurant />
          {t("dish_settings_modal_edit_ingredients")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("macros")}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FitnessCenter />
          {t("dish_settings_modal_edit_macronutrients")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("photos")}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AddPhotoAlternate />
          {t("dish_settings_modal_edit_photos")}
        </div>
        <ChevronRight />
      </button>
      <button className="menu-button" onClick={() => setView("categories")}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <CategoryIcon />
           {t("dish_settings_modal_edit_categories")}
         </div>
         <ChevronRight />
      </button>
      <button className="menu-button delete-button" onClick={handleDeleteDish} style={{ borderColor: '#ff4b4b', color: '#ff4b4b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <p style={{ textAlign: 'center', color: '#888' }}>{t("create_dish_modal_no_ingredients")}</p>
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
          <Add /> {addingIngredient ? t("submitting") : t("create_dish_modal_add_ingredient")}
        </button>
      </div>
    </div>
  );





  return (
    <div 
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={handleModalClose}
    >
      <div className="modal-content" onPointerDown={(e) => e.stopPropagation()}>
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
          </h2>

          <button className="close-button" onClick={handleModalClose}>
            <Close />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
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
      </div>
    </div>
  );
}
