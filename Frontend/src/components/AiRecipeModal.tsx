import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Close from "@mui/icons-material/Close";
import AiService, { AiGeneratedDishProperties, DishTaste, KitchenItem, Lang } from "../services/AiService";
import CategoriesService from "../services/CategoriesService";
import { Category } from "../services/DishesService";
import { toast } from "react-toastify";
import "./styles/AiRecipeModal.css";
import { useNavigate, useParams } from "react-router-dom";

interface AiRecipeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function AiRecipeModal({ isOpen, onClose }: AiRecipeModalProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedTastes, setSelectedTastes] = useState<DishTaste[]>([]);
  const [selectedTools, setSelectedTools] = useState<KitchenItem[]>([]);
  
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => setIsVisible(true));
      loadCategories();
    } else {
      setIsClosing(true);
      setIsVisible(false);
      closeTimerRef.current = setTimeout(() => {
        setIsClosing(false);
      }, 500);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const data = await CategoriesService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const handleGenerate = async () => {
    if (selectedCategoryIds.length === 0) {
      toast.warn(t("ai_modal_select_category_warn") || "Please select at least one category");
      return;
    }

    setLoading(true);
    try {
      const selectedCats = categories.filter(c => selectedCategoryIds.includes(c.id));
      
      let currentLang = Lang.EN;
      if (i18n.language === "pl") currentLang = Lang.PL;
      else if (i18n.language === "de") currentLang = Lang.DE;
      else if (i18n.language === "es") currentLang = Lang.ES;

      const props: AiGeneratedDishProperties = {
        categories: selectedCats,
        tastes: selectedTastes,
        requiredTools: selectedTools,
        lang: currentLang
      };

      const result = await AiService.askAi(props);
      
      onClose();
      setSelectedCategoryIds([]);
      setSelectedTastes([]);
      setSelectedTools([]);
      navigate(`/${locale}/ai-dish`, { state: { recipe: result, params: props } });

    } catch (error) {
      toast.error(t("ai_modal_error") || "Failed to generate recipe");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTaste = (taste: DishTaste) => {
    setSelectedTastes(prev => 
      prev.includes(taste) ? prev.filter(t => t !== taste) : [...prev, taste]
    );
  };

  const toggleTool = (tool: KitchenItem) => {
    setSelectedTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 450);
  };

  return (
    <div
      className={`ai-modal-overlay ${isVisible ? "open" : ""} ${isClosing ? "closing" : ""}`}
      onPointerDown={handleClose}
    >
      <div className="ai-modal-content" onPointerDown={(e) => e.stopPropagation()}>
        <button className="ai-close-button" onClick={handleClose}>
          <Close />
        </button>
        
        <h2 className="ai-modal-title">{t("ai_modal_title") || "AI Recipe Generator"}</h2>

        <div className="ai-setup-container">
          <div className="ai-section">
            <h3>{t("ai_modal_categories") || "Categories"}</h3>
            <div className="ai-tags-grid">
              {categories.map(c => (
                <button 
                  key={c.id} 
                  className={`ai-tag ${selectedCategoryIds.includes(c.id) ? "active" : ""}`}
                  onClick={() => toggleCategory(c.id)}
                  style={{ borderColor: c.color }}
                >
                  {i18n.language === "pl" ? c.namePl : c.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-section">
            <h3>{t("ai_modal_tastes") || "Tastes"}</h3>
            <div className="ai-tags-grid">
              {Object.values(DishTaste)
                .filter((v): v is DishTaste => typeof v === "number")
                .map((tId) => (
                  <button 
                    key={tId} 
                    className={`ai-tag ${selectedTastes.includes(tId) ? "active" : ""}`}
                    onClick={() => toggleTaste(tId)}
                  >
                    {t(`dish_taste_${DishTaste[tId].toLowerCase()}`)}
                  </button>
                ))}
            </div>
          </div>

          <div className="ai-section">
            <h3>{t("ai_modal_tools") || "Kitchen Tools"}</h3>
            <div className="ai-tags-grid">
              {Object.values(KitchenItem)
                .filter((v): v is KitchenItem => typeof v === "number")
                .map((toolId) => (
                  <button 
                    key={toolId} 
                    className={`ai-tag ${selectedTools.includes(toolId) ? "active" : ""}`}
                    onClick={() => toggleTool(toolId)}
                  >
                    {t(`kitchen_item_${KitchenItem[toolId].toLowerCase()}`)}
                  </button>
                ))}
            </div>
          </div>

          <button 
            className="ai-generate-button" 
            onClick={handleGenerate} 
            disabled={loading}
          >
            {loading ? t("ai_modal_generating") || "Generating..." : t("ai_modal_generate") || "Generate Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
