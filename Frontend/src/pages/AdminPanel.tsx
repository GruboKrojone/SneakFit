import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import AdminOnly from "../components/AdminOnly";
import CategoriesService, { Category } from "../services/CategoriesService";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { HexColorPicker, HexColorInput } from "react-colorful";
import "./styles/AdminPanel.css";

export default function AdminPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [newCategoryNames, setNewCategoryNames] = useState({
    en: "",
    pl: "",
    de: "",
    es: ""
  });
  const [selectedColor, setSelectedColor] = useState("#ff6b35");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await CategoriesService.getAllCategories();
      setCategories(data);
    } catch {
      toast.error(t("categories_service_fetch_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const { en, pl, de, es } = newCategoryNames;
    if (!en.trim() || !pl.trim() || !de.trim() || !es.trim()) {
      toast.warning(t("please_fill_all_languages"));
      return;
    }

    try {
      const existingCategory = categories.find(
        (c) => c.nameEn.toLowerCase() === en.trim().toLowerCase()
      );

      if (existingCategory) {
        toast.info(t("create_dish_modal_category_already_exists_selected"));
        return;
      }

      await CategoriesService.addCategory(en.trim(), pl.trim(), de.trim(), es.trim(), selectedColor);
      
      setNewCategoryNames({ en: "", pl: "", de: "", es: "" });
      setSelectedColor("#ff6b35");
      toast.success(t("create_dish_modal_category_added"));
      fetchCategories();
    } catch (error) {
      toast.error(t("create_dish_modal_category_add_error") + "\n" + error);
    }
  };

  return (
    <AdminOnly fallback={<div className="admin-error">Access Denied</div>}>
      <div className="admin-panel">
        <button 
          className="back-btn" 
          onClick={() => navigate(`/${locale}/profile`)}
          title={t("back_to_profile")}
        >
          <ArrowBackIcon />
        </button>
        
        <h1 className="page-title">{t("admin_panel")}</h1>
        
        <div className="admin-content">
          <section className="admin-card">
            <h2 className="section-subtitle">{t("manage_categories")}:</h2>
            <div className="category-creation-row">
              <div className="category-input-group">
                <div className="lang-inputs-grid">
                  <div className="lang-input-wrapper">
                    <span className="lang-label">EN</span>
                    <input
                      type="text"
                      value={newCategoryNames.en}
                      onChange={(e) => setNewCategoryNames({ ...newCategoryNames, en: e.target.value })}
                      placeholder="Category name in English"
                    />
                  </div>
                  <div className="lang-input-wrapper">
                    <span className="lang-label">PL</span>
                    <input
                      type="text"
                      value={newCategoryNames.pl}
                      onChange={(e) => setNewCategoryNames({ ...newCategoryNames, pl: e.target.value })}
                      placeholder="Nazwa kategorii po polsku"
                    />
                  </div>
                  <div className="lang-input-wrapper">
                    <span className="lang-label">DE</span>
                    <input
                      type="text"
                      value={newCategoryNames.de}
                      onChange={(e) => setNewCategoryNames({ ...newCategoryNames, de: e.target.value })}
                      placeholder="Kategoriename auf Deutsch"
                    />
                  </div>
                  <div className="lang-input-wrapper">
                    <span className="lang-label">ES</span>
                    <input
                      type="text"
                      value={newCategoryNames.es}
                      onChange={(e) => setNewCategoryNames({ ...newCategoryNames, es: e.target.value })}
                      placeholder="Nombre de la categoría en español"
                    />
                  </div>
                </div>
              </div>

              <div className="color-picker-section">
                <div className="color-picker-controls">
                  <label className="color-label">{t("category_color")}:</label>
                  <div className="selected-color-info">
                    <div 
                      className="color-preview-large" 
                      style={{ background: selectedColor }} 
                    />
                    <div className="color-code-wrapper">
                      <span className="color-label-small">{t("selected_color")}:</span>
                      <div className="hex-input-container">
                        <span className="hex-prefix">#</span>
                        <HexColorInput 
                          color={selectedColor} 
                          onChange={setSelectedColor} 
                          className="hex-input"
                          prefixed={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="library-picker-container">
                  <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                </div>
              </div>

              <div className="admin-actions-centered">
                <button
                  type="button"
                  className="add-category-button-large"
                  onClick={handleAddCategory}
                  disabled={!newCategoryNames.en.trim() || !newCategoryNames.pl.trim() || !newCategoryNames.de.trim() || !newCategoryNames.es.trim()}
                >
                  <AddIcon />
                  <span>{t("create_dish_modal_add_category_placeholder")}</span>
                </button>
              </div>
            </div>

            <div className="categories-preview">
              <h3 className="preview-title">{t("existing_categories")}:</h3>
              {isLoading ? (
                <div className="admin-loader">
                  <div className="spinner-small" />
                </div>
              ) : (
                <div className="categories-grid-admin">
                  {categories.length === 0 ? (
                    <p className="no-data-text">{t("create_dish_modal_no_categories")}</p>
                  ) : (
                    categories.map((cat) => {
                      let localizedName;
                      switch (locale) {
                        case "pl": localizedName = cat.namePl; break;
                        case "de": localizedName = cat.nameDe; break;
                        case "es": localizedName = cat.nameEs; break;
                        default: localizedName = cat.nameEn;
                      }
                        
                      return (
                        <span 
                          key={cat.id} 
                          className="admin-category-tag"
                          style={{ 
                            borderColor: cat.color,
                            color: cat.color,
                            background: `${cat.color}15`
                          }}
                        >
                          {localizedName}
                        </span>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminOnly>
  );
}
