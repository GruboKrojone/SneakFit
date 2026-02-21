import { useState, useEffect } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import DishesService from "../services/DishesService";

interface DishRatingSectionProps {
  readonly initialRating: number;
  readonly dishId: number;
  readonly onRatingUpdated: (newRating: number) => void;
}

export default function DishRatingSection({
  initialRating,
  dishId,
  onRatingUpdated,
}: DishRatingSectionProps) {
  const { t } = useTranslation();
  const [isRatingEditing, setIsRatingEditing] = useState(false);
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!isRatingEditing) {
      setRating(initialRating);
    }
  }, [initialRating, isRatingEditing]);

  const handleRate = async (newRating: number) => {
    try {
      await DishesService.rateDish(dishId, newRating);
      onRatingUpdated(newRating);
      toast.success(t("rating_saved_success") || "Rating saved!");
    } catch (error) {
      toast.error(t("service_unknown_error\n" + error));
    }
  };

  const handleSaveRating = () => {
    handleRate(rating);
    setIsRatingEditing(false);
    setHoverRating(0);
  };

  const incrementRating = () => setRating((prev) => Math.min(5, prev + 0.5));
  const decrementRating = () => setRating((prev) => Math.max(0.5, prev - 0.5));

  const renderStars = (value: number, interactive: boolean) => {
    return [1, 2, 3, 4, 5].map((starValue) => {
      const ratingToUse = interactive && hoverRating > 0 ? hoverRating : value;
      const filled = ratingToUse >= starValue;
      const half = ratingToUse > starValue - 1 && ratingToUse < starValue;

      let icon = <StarBorderIcon fontSize="inherit" />;
      if (filled) icon = <StarIcon fontSize="inherit" />;
      else if (half) icon = <StarHalfIcon fontSize="inherit" />;

      return (
        <button
          key={starValue}
          className={`star-icon ${filled ? "filled" : ""} ${half ? "half" : ""} ${interactive ? "interactive" : ""}`}
          style={{
            fontSize: "2rem",
            display: "inline-flex",
            background: "none",
            border: "none",
            padding: 0,
          }}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          type="button"
          disabled={!interactive}
          aria-label={`Rate ${starValue} out of 5`}
        >
          {icon}
        </button>
      );
    });
  };

  if (isRatingEditing) {
    return (
      <div className="rating-edit-mode">
        <div className="rating-controls">
          <button className="rating-adjust-btn" onClick={decrementRating}>
            -
          </button>
          <fieldset
            className="stars-wrapper"
            style={{ border: "none", padding: 0, margin: 0 }}
            onMouseLeave={() => setHoverRating(0)}
          >
            {renderStars(rating, true)}
          </fieldset>
          <button className="rating-adjust-btn" onClick={incrementRating}>
            +
          </button>
        </div>
        <div className="rating-value">{rating.toFixed(1)}</div>
        <div className="rating-actions">
          <button className="rating-save-btn" onClick={handleSaveRating}>
            {t("save_rating")}
          </button>
          <button
            className="rating-cancel-btn"
            onClick={() => setIsRatingEditing(false)}
          >
            {t("common_close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-view-mode">
      <div className="stars-wrapper">{renderStars(initialRating, false)}</div>
      <div className="rating-value">{(initialRating || 0).toFixed(1)}</div>
      <button
        className="rating-edit-btn"
        onClick={() => setIsRatingEditing(true)}
      >
        {t("rate_dish")}
      </button>
    </div>
  );
}
