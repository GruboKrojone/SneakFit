import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import FavouritesModal from "../components/FavouritesModal";
import { useTranslation } from "react-i18next";
import "./styles/ProfilePage.css";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavouriteModalOpen, setIsFavouriteModalOpen] = useState(false);

  return (
    <div className="profile-page">
      <div className="page-title">{t("profile")}</div>
      <button
        className="settings-gear-btn"
        onClick={() => setIsModalOpen(true)}
        title={t("profile_settings_title")}
      >
        <SettingsIcon className="settings-gear-icon" />
      </button>

      <button
        className="favourites-button"
        onClick={() => setIsFavouriteModalOpen(true)}
      >
        {t("favourites")}
      </button>

      <ProfileSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <FavouritesModal
        isOpen={isFavouriteModalOpen}
        onClose={() => setIsFavouriteModalOpen(false)}
      />
    </div>
  );
}
