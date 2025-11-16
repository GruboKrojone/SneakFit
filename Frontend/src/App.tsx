import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DishesPage from "./pages/DishesPage";
import ProfilePage from "./pages/ProfilePage";
import ShoppingList from "./pages/ShoppingList";
import ProtectedLayout from "./components/ProtectedLayout";
import BedtimeOutlined from "@mui/icons-material/BedtimeOutlined";

function App() {
  return (
    <BrowserRouter>
      <button className="theme-toggle-btn" onClick={() => {}}>
        <BedtimeOutlined sx={{ fontSize: 40 }} />
      </button>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedLayout>
              <HomePage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dishes"
          element={
            <ProtectedLayout>
              <DishesPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <ProfilePage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/shopping-list"
          element={
            <ProtectedLayout>
              <ShoppingList />
            </ProtectedLayout>
          }
        />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
