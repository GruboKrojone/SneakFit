import { useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import AuthService from "../services/AuthService";
import "./styles/NavBar.css";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

export default function NavBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  return (
    <>
      <nav className={`nav-bar ${isOpen ? "open" : ""}`}>
        <div className="nav-profile-icon">
          <NavLink to="/profile">
            <AccountCircleRoundedIcon id="profile-icon" />
          </NavLink>
        </div>
        <ul className="nav-list">
          <li onClick={closeNav}>
            <NavLink to="/home">
              <HomeOutlinedIcon />
            </NavLink>
          </li>
          <li onClick={closeNav}>
            <NavLink to="/dishes">
              <RestaurantMenuOutlinedIcon />
            </NavLink>
          </li>
          <li onClick={closeNav}>
            <NavLink to="/shopping-list">
              <ShoppingBagOutlinedIcon />
            </NavLink>
          </li>
        </ul>

        <div className="nav-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlinedIcon />
          </button>
        </div>
      </nav>
    </>
  );
}
