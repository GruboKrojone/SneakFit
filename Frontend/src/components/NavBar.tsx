import { useNavigate, NavLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import AuthService from "../services/AuthService";
import "./styles/NavBar.css";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { useTheme } from "../hooks/useTheme";

export default function NavBar() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    AuthService.logout();
    navigate(`/${locale}/login`);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  return (
      <nav className={`nav-bar ${isOpen ? "open" : ""}`}>
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
