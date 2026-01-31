import { useNavigate, NavLink, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import AuthService from "../services/AuthService";
import { Language, languageToLocale, localeToLanguage } from "../services/UserService";
import "./styles/NavBar.css";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { useTheme } from "../hooks/useTheme";

const flagEmojis: Record<Language, string> = {
  EN: "🇺🇸",
  PL: "🇵🇱",
  DE: "🇩🇪",
  ES: "🇪🇸",
};

export default function NavBar() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langSelectorRef = useRef<HTMLDivElement>(null);

  const currentLanguage: Language = localeToLanguage[locale || "en"] || "EN";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langSelectorRef.current && !langSelectorRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };

    if (isLangDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  const handleLogout = () => {
    AuthService.logout();
    navigate(`/${locale}/login`);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  const handleLanguageChange = async (lang: Language) => {
    try {
      const newLocale = languageToLocale[lang];
      const currentPath = location.pathname;
      const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, "");
      navigate(`/${newLocale}${pathWithoutLocale}`);
      
      setIsLangDropdownOpen(false);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <nav className={`nav-bar ${isOpen ? "open" : ""}`}>
      <div className="nav-language-selector" ref={langSelectorRef}>
        <button
          className="language-btn"
          onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
          aria-label="Select language"
        >
          <span className="flag-emoji">{flagEmojis[currentLanguage]}</span>
        </button>
        {isLangDropdownOpen && (
          <div className="language-dropdown">
            {(Object.keys(flagEmojis) as Language[]).map((lang) => (
              <button
                key={lang}
                className={`language-option ${lang === currentLanguage ? "active" : ""}`}
                onClick={() => handleLanguageChange(lang)}
              >
                <span className="flag-emoji">{flagEmojis[lang]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="nav-profile-icon">
        <NavLink to={`/${locale}/profile`}>
          <AccountCircleRoundedIcon id="profile-icon" />
        </NavLink>
      </div>

      <ul className="nav-list">
        <li>
          <NavLink to={`/${locale}/home`} onClick={closeNav}>
            <HomeOutlinedIcon />
          </NavLink>
        </li>
        <li>
          <NavLink to={`/${locale}/dishes`} onClick={closeNav}>
            <RestaurantMenuOutlinedIcon />
          </NavLink>
        </li>
        <li>
          <NavLink to={`/${locale}/shopping-list`} onClick={closeNav}>
            <ShoppingBagOutlinedIcon />
          </NavLink>
        </li>
      </ul>

      <div className="nav-footer">
        <button 
          className="theme-btn" 
          onClick={toggleTheme}
          aria-label={t(theme === 'light' ? 'theme_switch_to_dark' : 'theme_switch_to_light')}
          title={t(theme === 'light' ? 'theme_switch_to_dark' : 'theme_switch_to_light')}
        >
          {theme === 'light' ? <BedtimeOutlinedIcon /> : <WbSunnyOutlinedIcon />}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <LogoutOutlinedIcon />
        </button>
      </div>
    </nav>
  );
}
