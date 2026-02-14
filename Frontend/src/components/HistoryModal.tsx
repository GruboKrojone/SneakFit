import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HistoryEntry, getHistory, clearHistory } from "../utils/recipeStorage";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import DishImage from "./DishImage";
import "./styles/HistoryModal.css";

interface HistoryModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setHistory(getHistory());
    }
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (!isOpen) {
      setShouldRender(false);
    }
  };

  const handleClear = () => {
    if (globalThis.confirm(t("confirm_clear_history"))) {
      clearHistory();
      setHistory([]);
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`history-modal-overlay ${isOpen ? "open" : "close"}`} 
      onAnimationEnd={onAnimationEnd}
    >
      <button 
        className="history-modal-backdrop"
        onClick={onClose}
        tabIndex={-1}
        aria-label={t("close")}
      />
      <div className="history-modal-content">
        <div className="history-modal-header">
          <h2>{t("history_title")}</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">{t("history_empty")}</div>
          ) : (
            history.map((item) => (
              <button 
                key={`${item.id}-${item.timestamp}`} 
                className="history-item"
                onClick={() => {
                  onClose();
                  navigate(`/${locale}/dish/${item.id}`);
                }}
              >
                <div className="history-item-image-wrapper">
                    <DishImage dishId={item.id} alt={item.name} className="history-item-image" />
                </div>
                <div className="history-item-info">
                  <span className="history-item-name">{item.name}</span>
                  <div className="history-item-details">
                    <span className={`history-action-badge ${item.action}`}>
                        {item.action.toUpperCase()}
                    </span>
                    <span className="history-item-time">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="history-modal-footer">
            <button className="clear-history-btn" onClick={handleClear}>
              <DeleteIcon fontSize="small" />
              {t("clear_history")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
