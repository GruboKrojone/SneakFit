import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DishesPage from "./pages/DishesPage";
import DishDetails from "./pages/DishDetails";
import ProfilePage from "./pages/ProfilePage";
import ShoppingList from "./pages/ShoppingList";
import ProtectedLayout from "./components/ProtectedLayout";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
          path="/dish/:id"
          element={
            <ProtectedLayout>
              <DishDetails />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
