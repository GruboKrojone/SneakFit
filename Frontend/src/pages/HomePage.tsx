import { useTranslation } from "react-i18next";
import DishSlider from "../components/DishSlider";
import "./styles/HomePage.css";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="home-title">{t("home_page_welcome_message")}</h1>
      <div className="dish-slider-container">
        <DishSlider />
      </div>
      <div className="home-footer"></div>
    </>
  );
}
