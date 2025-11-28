import { useTranslation } from "react-i18next";
import DishSlider from "../components/DishSlider";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="home-title">{t("home_page_welcome_message")}</h1>
      <div className="slider-container">
        <DishSlider />
      </div>
    </>
  );
}
