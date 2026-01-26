import { useTranslation } from "react-i18next";
import DishSlider from "../components/DishSlider";
import HistoryIcon from "@mui/icons-material/History";
import "./styles/HomePage.css";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="page-title">{t("home_page_welcome_message")}</div>
      <div className="dish-slider-container">
        <DishSlider />
      </div>
      <div className="page-footer">
        <button className="history-btn">
          <HistoryIcon className="history-icon" />
        </button>
      </div>
    </>
  );
}
