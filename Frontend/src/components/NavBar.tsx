import { useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import AuthService from "../services/AuthService";
import "./styles/NavBar.css";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function NavBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className="nav-toggle" onClick={toggleNav}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <nav className={`nav-bar ${isOpen ? "open" : ""}`}>
        <ul className="nav-list">
          <li onClick={closeNav}>
            <NavLink to="/profile">
              <AccountCircleRoundedIcon />
            </NavLink>
          </li>
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
