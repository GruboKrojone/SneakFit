import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import "./styles/ShoppingListPage.css";
import "./styles/ProfilePage.css";

interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
}

export default function ShoppingListPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem("sneakfit_shopping_list_v3");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    localStorage.setItem("sneakfit_shopping_list_v3", JSON.stringify(items));
  }, [items]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: inputValue.trim(),
      completed: false,
    };
    setItems([newItem, ...items]);
    setInputValue("");
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(items.filter(item => item.id !== id));
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setItems([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="shopping-list-page">
      <div className="page-title">{t("shopping_list_title")}</div>

      <div className="shopping-list-container">
        <form className="shopping-list-input-group" onSubmit={addItem}>
          <input
            className="shopping-list-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("shopping_list_add_placeholder")}
          />
          <button className="shopping-list-add-btn" type="submit">
            {t("shopping_list_add_button")}
          </button>
        </form>

        <div className="shopping-items-list">
          {items.length === 0 ? (
            <div className="shopping-list-empty">
              {t("shopping_list_empty")}
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="shopping-item-wrapper">
                <button
                  className={`shopping-item-row ${item.completed ? "completed" : ""}`}
                  onClick={() => toggleItem(item.id)}
                  aria-label={item.completed ? `Mark ${item.name} as incomplete` : `Mark ${item.name} as complete`}
                >
                  <div className="shopping-item-content">
                    {item.completed ? (
                      <CheckCircleIcon className="shopping-item-checked-icon" />
                    ) : (
                      <RadioButtonUncheckedIcon className="shopping-item-unchecked-icon" />
                    )}
                    <span className="shopping-item-text">{item.name}</span>
                  </div>
                </button>
                <button
                  className="shopping-item-delete-btn"
                  onClick={(e) => deleteItem(item.id, e)}
                  title={t("shopping_list_remove_item")}
                  aria-label={t("shopping_list_remove_item")}
                >
                  <DeleteIcon />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <button className="shopping-list-clear-btn" onClick={clearAll}>
            {t("shopping_list_clear_all")}
          </button>
        )}
      </div>

      {showClearConfirm && (
        <div className="delete-confirm-overlay" onPointerDown={(e) => e.stopPropagation()}>
          <div className="delete-confirm-modal">
            <h4>{t("shopping_list_clear_modal_title")}</h4>
            <p>{t("shopping_list_clear_modal_message")}</p>
            <div className="delete-confirm-actions">
              <button
                className="delete-confirm-btn cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="delete-confirm-btn confirm"
                onClick={confirmClear}
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
