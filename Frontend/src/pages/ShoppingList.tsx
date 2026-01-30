import { useTranslation } from "react-i18next";

export default function ShoppingList() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("shopping_list_title")}</h1>
      <p>{t("shopping_list_content")}</p>
    </div>
  );
}
