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
      <div className="profile-header">
        <div className="page-title">{useTranslation().t("profile")}</div>
        <SettingsIcon id="settings-icon" onClick={() => setIsModalOpen(true)} />
      </div>

      <div className="profile-content">
        <p>User profile content</p>
      </div>

      <ProfileSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
