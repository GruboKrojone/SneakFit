import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import { useTranslation } from "react-i18next";
import "./styles/ProfilePage.css";

export default function ProfilePage() {
  useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="profile-page">
      <div className="page-title">{useTranslation().t("profile")}</div>
      <button
        className="settings-gear-btn"
        onClick={() => setIsModalOpen(true)}
        title={useTranslation().t("profile_settings_title")}
      >
        <SettingsIcon className="settings-gear-icon" />
      </button>

      <div>
        <p>User profile content</p>
      </div>

      <ProfileSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
