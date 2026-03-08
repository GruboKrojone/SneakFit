import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CategoriesService, { Category } from "../services/CategoriesService";
import CloseIcon from "@mui/icons-material/Close";
import "./styles/FiltersModal.css";

interface FiltersModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedCategories: number[];
  readonly onApplyFilters: (categoryIds: number[]) => void;
  readonly onClearFilters: () => void;
  readonly selectedSort: string;
  readonly onApplySort: (sort: string) => void;
  readonly minRating: number;
  readonly onApplyMinRating: (rating: number) => void;
}

export default function FiltersModal({
  isOpen,
  onClose,
  selectedCategories,
  onApplyFilters,
  onClearFilters,
  selectedSort,
  onApplySort,
  minRating,
  onApplyMinRating,
}: FiltersModalProps) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [localSelectedCategories, setLocalSelectedCategories] = useState<number[]>(
    []
  );
  const [localSort, setLocalSort] = useState<string>("none");
  const [localMinRating, setLocalMinRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

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
      setLocalSort(selectedSort);
      setLocalMinRating(minRating);
    }
  }, [isOpen, selectedCategories, selectedSort, minRating]);

  const toggleCategory = (id: number) => {
    setLocalSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApplyFilters(localSelectedCategories);
    onApplySort(localSort);
    onApplyMinRating(localMinRating);
    onClose();
  };

  const handleClear = () => {
    setLocalSelectedCategories([]);
    setLocalSort("none");
    setLocalMinRating(0);
    onClearFilters();
    onApplySort("none");
    onApplyMinRating(0);
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
          <h3>{t("sort_by")}</h3>
          <div className="sort-options">
            <button
              className={`sort-tag ${localSort === "none" ? "selected" : ""}`}
              onClick={() => setLocalSort("none")}
            >
              {t("sort_default")}
            </button>
            <button
              className={`sort-tag ${localSort === "rating_desc" ? "selected" : ""}`}
              onClick={() => setLocalSort("rating_desc")}
            >
              {t("sort_rating_desc")}
            </button>
            <button
              className={`sort-tag ${localSort === "rating_asc" ? "selected" : ""}`}
              onClick={() => setLocalSort("rating_asc")}
            >
              {t("sort_rating_asc")}
            </button>
          </div>

          <fieldset className="rating-fieldset" onMouseLeave={() => setHoverRating(0)}>
            <h3>{t("filter_min_rating")}</h3>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || localMinRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    className={`rating-star-btn ${isActive ? "active" : ""}`}
                    onClick={() => setLocalMinRating(star === localMinRating ? 0 : star)}
                    onMouseEnter={() => setHoverRating(star)}
                  >
                    {isActive ? (
                      <StarIcon className="rating-star-icon" />
                    ) : (
                      <StarBorderIcon className="rating-star-icon" />
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

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
