import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CategoriesService, { Category } from "../services/CategoriesService";
import CloseIcon from "@mui/icons-material/Close";
import "./styles/FiltersModal.css";

interface FiltersModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedCategories: number[];
  readonly onApplyFilters: (categoryIds: number[]) => void;
  readonly onClearFilters: () => void;
}

export default function FiltersModal({
  isOpen,
  onClose,
  selectedCategories,
  onApplyFilters,
  onClearFilters,
}: FiltersModalProps) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [localSelectedCategories, setLocalSelectedCategories] = useState<number[]>(
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoriesService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedCategories(selectedCategories);
    }
  }, [isOpen, selectedCategories]);

  const toggleCategory = (id: number) => {
    setLocalSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApplyFilters(localSelectedCategories);
    onClose();
  };

  const handleClear = () => {
    setLocalSelectedCategories([]);
    onClearFilters();
    onClose();
  };

  const getLocalizedName = (cat: Category) => {
    switch (i18n.language) {
      case "pl":
        return cat.namePl || cat.nameEn;
      case "de":
        return cat.nameDe || cat.nameEn;
      case "es":
        return cat.nameEs || cat.nameEn;
      default:
        return cat.nameEn;
    }
  };

  return (
    <>
      <button
        type="button"
        className={`filter-modal-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-label={t("common_close")}
      />
      <div className={`filter-modal-content ${isOpen ? "open" : ""}`}>
        <div className="filter-header">
          <h2>{t("filters_title")}</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="filter-body">
          <h3>{t("filter_by_category")}</h3>
          <div className="categories-list">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tag ${
                  localSelectedCategories.includes(cat.id) ? "selected" : ""
                }`}
                onClick={() => toggleCategory(cat.id)}
                style={{
                  borderColor: localSelectedCategories.includes(cat.id)
                    ? cat.color
                    : "var(--border)",
                  color: localSelectedCategories.includes(cat.id)
                    ? "#fff"
                    : "var(--text-secondary)",
                  backgroundColor: localSelectedCategories.includes(cat.id)
                    ? cat.color
                    : "transparent",
                }}
              >
                {getLocalizedName(cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-footer">
          <button className="clear-button" onClick={handleClear}>
            {t("clear_filters")}
          </button>
          <button className="apply-button" onClick={handleApply}>
            {t("apply_filters")}
          </button>
        </div>
      </div>
    </>
  );
}
