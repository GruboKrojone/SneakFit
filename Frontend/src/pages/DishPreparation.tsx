import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DishesService, { PreparationStep } from "../services/DishesService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./styles/DishPreparation.css";

export default function DishPreparation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [steps, setSteps] = useState<PreparationStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showBonAppetit, setShowBonAppetit] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const currentStepParam = Math.max(1, Number.parseInt(searchParams.get("step") ?? "1", 10));
  const currentStepIndex = Math.max(0, currentStepParam - 1);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      const data = await DishesService.getSteps(Number(id));
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setSteps(sorted);
      setIsLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (steps.length === 0) return;
    const clamped = Math.min(Math.max(currentStepParam, 1), steps.length);
    if (clamped !== currentStepParam) {
      setSearchParams({ step: String(clamped) }, { replace: true });
    }
  }, [steps, currentStepParam, setSearchParams]);

  const goToStep = useCallback(
    (stepNumber: number) => {
      setSearchParams({ step: String(stepNumber) });
    },
    [setSearchParams]
  );

  const goNext = () => {
    if (currentStepParam < steps.length) {
      const stepToMark = steps[currentStepIndex];
      goToStep(currentStepParam + 1);
      if (stepToMark) {
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.add(stepToMark.id);
          return next;
        });
      }
    }
  };

  const goPrev = () => {
    if (currentStepParam > 1) {
      goToStep(currentStepParam - 1);
    }
  };



  const handleBack = () => {
    navigate(`..`, { relative: "path" });
  };

  const handleFinish = () => {
    const lastStep = steps[steps.length - 1];
    if (lastStep) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(lastStep.id);
        return next;
      });
    }
    setShowBonAppetit(true);
    setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        navigate(`..`, { relative: "path" });
      }, 600);
    }, 2000);
  };



  if (isLoading) {
    return (
      <div className="dish-prep-page">
        <div className="dish-prep-loading">
          <div className="dish-prep-spinner" />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="dish-prep-page">
        <div className="dish-prep-empty">
          <h2>{t("dish_preparation_no_steps")}</h2>
          <button className="dish-prep-back-btn" onClick={handleBack}>
            <ArrowBackIcon />
            {t("dish_details_page_back_button")}
          </button>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const isCompleted = completedSteps.has(currentStep.id);
  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className="dish-prep-page">
      <div className="dish-prep-header">
        <button
          className="dish-prep-back-btn"
          onClick={handleBack}
          aria-label={t("dish_details_page_back_button")}
        >
          <ArrowBackIcon />
        </button>
        <div className="dish-prep-header-center">
          <h1 className="dish-prep-title">{t("dish_preparation_title")}</h1>
          <p className="dish-prep-subtitle">
            {t("dish_preparation_step_of", {
              current: currentStepParam,
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
            {steps.map((s, i) => (
              <li key={s.id}>
                <button
                  className={`dish-prep-step-item ${i === currentStepIndex ? "active" : ""} ${completedSteps.has(s.id) ? "done" : ""}`}
                  onClick={() => goToStep(i + 1)}
                >
                  <span className="dish-prep-step-item-num">{i + 1}</span>
                  <span className="dish-prep-step-item-name">{s.name}</span>
                  {completedSteps.has(s.id) && (
                    <CheckCircleIcon className="dish-prep-step-item-check" />
                  )}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <div className="dish-prep-main">
          <div className="dish-prep-dots" role="tablist" aria-label={t("dish_preparation_steps_nav")}>
            {steps.map((s, i) => (
              <button
                key={s.id}
                className={`dish-prep-dot ${i === currentStepIndex ? "active" : ""} ${completedSteps.has(s.id) ? "done" : ""}`}
                onClick={() => goToStep(i + 1)}
                role="tab"
                aria-selected={i === currentStepIndex}
                aria-label={`${t("dish_preparation_step_label")} ${i + 1}`}
                title={s.name}
              />
            ))}
          </div>

          <div className="dish-prep-card-wrapper">
            <div className={`dish-prep-card ${isCompleted ? "completed" : ""}`}>
              <h2 className="dish-prep-step-name">{t("dish_preparation_step", { step: currentStepIndex + 1 })}</h2>
              <p className="dish-prep-step-description">{currentStep.description}</p>
            </div>
          </div>

          <div className="dish-prep-nav">
            <button
              className="dish-prep-nav-btn prev"
              onClick={goPrev}
              disabled={currentStepParam <= 1}
              aria-label={t("dish_preparation_prev")}
            >
              <ArrowBackIcon />
              {t("dish_preparation_prev")}
            </button>

            {currentStepParam < steps.length ? (
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
