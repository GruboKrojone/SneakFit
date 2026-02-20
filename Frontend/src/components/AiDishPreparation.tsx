import { useState } from "react";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../pages/styles/DishPreparation.css";

interface AiDishPreparationProps {
  readonly steps: string[];
  readonly onBack: () => void;
}

export default function AiDishPreparation({ steps, onBack }: AiDishPreparationProps) {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showBonAppetit, setShowBonAppetit] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const currentStepNumber = currentStepIndex + 1;

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStepIndex);
        return next;
      });
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = () => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStepIndex);
      return next;
    });
    setShowBonAppetit(true);
    setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        onBack();
      }, 600);
    }, 2000);
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className="dish-prep-page ai-prep">
      <div className="dish-prep-header">
        <button
          className="dish-prep-back-btn"
          onClick={onBack}
          aria-label={t("dish_details_page_back_button")}
        >
          <ArrowBackIcon />
        </button>
        <div className="dish-prep-header-center">
          <h1 className="dish-prep-title">{t("dish_preparation_title")}</h1>
          <p className="dish-prep-subtitle">
            {t("dish_preparation_step_of", {
              current: currentStepNumber,
              total: steps.length,
            })}
          </p>
        </div>
        <div className="dish-prep-header-right" />
      </div>

      <progress
        className="dish-prep-progress-bar-container"
        value={Math.round(progress)}
        max={100}
        aria-label={t("dish_preparation_progress")}
      />

      <div className="dish-prep-columns">
        <aside className="dish-prep-sidebar">
          <h3 className="dish-prep-steps-list-title">{t("dish_preparation_all_steps")}</h3>
          <ol className="dish-prep-steps-ol">
            {steps.map((_, i) => (
              <li key={`sidebar-step-${i}`}>
                <button
                  className={`dish-prep-step-item ${i === currentStepIndex ? "active" : ""} ${completedSteps.has(i) ? "done" : ""}`}
                  onClick={() => goToStep(i)}
                >
                  <span className="dish-prep-step-item-num">{i + 1}</span>
                  <span className="dish-prep-step-item-name">{t("dish_preparation_step_label")} {i + 1}</span>
                  {completedSteps.has(i) && (
                    <CheckCircleIcon className="dish-prep-step-item-check" />
                  )}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <div className="dish-prep-main">
          <div className="dish-prep-dots" role="tablist" aria-label={t("dish_preparation_steps_nav")}>
            {steps.map((_, i) => (
              <button
                key={`dot-step-${i}`}
                className={`dish-prep-dot ${i === currentStepIndex ? "active" : ""} ${completedSteps.has(i) ? "done" : ""}`}
                onClick={() => goToStep(i)}
                role="tab"
                aria-selected={i === currentStepIndex}
                aria-label={`${t("dish_preparation_step_label")} ${i + 1}`}
              />
            ))}
          </div>

          <div className="dish-prep-card-wrapper">
            <div className={`dish-prep-card ${completedSteps.has(currentStepIndex) ? "completed" : ""}`}>
              <h2 className="dish-prep-step-name">{t("dish_preparation_step", { step: currentStepNumber })}</h2>
              <p className="dish-prep-step-description">{steps[currentStepIndex]}</p>
            </div>
          </div>

          <div className="dish-prep-nav">
            <button
              className="dish-prep-nav-btn prev"
              onClick={goPrev}
              disabled={currentStepIndex === 0}
              aria-label={t("dish_preparation_prev")}
            >
              <ArrowBackIcon />
              {t("dish_preparation_prev")}
            </button>

            {currentStepIndex < steps.length - 1 ? (
              <button
                className="dish-prep-nav-btn next"
                onClick={goNext}
                aria-label={t("dish_preparation_next")}
              >
                {t("dish_preparation_next")}
                <ArrowForwardIcon />
              </button>
            ) : (
              <button
                className="dish-prep-nav-btn finish"
                onClick={handleFinish}
                aria-label={t("dish_preparation_finish")}
              >
                {t("dish_preparation_finish")}
                <CheckCircleIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {showBonAppetit && (
        <div className={`dish-prep-bon-overlay ${isLeaving ? "leaving" : ""}`}>
          <div className="dish-prep-bon-content">
            <span className="dish-prep-bon-emoji">🍽️</span>
            <h2 className="dish-prep-bon-text">{t("dish_preparation_bon_appetit")}</h2>
            <p className="dish-prep-bon-sub">{t("dish_preparation_bon_appetit_sub")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
