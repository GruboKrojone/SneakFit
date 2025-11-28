import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedLayout from "./components/ProtectedLayout";
import DishDetails from "./pages/DishDetails";
import DishesPage from "./pages/DishesPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ShoppingList from "./pages/ShoppingList";
import I18nProvider from "./translations/components/i18nProvider";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/en/login" replace />} />
        <Route
          path="/:locale/*"
          element={
            <I18nProvider>
              <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route
                  path="home"
                  element={
                    <ProtectedLayout>
                      <HomePage />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="dishes"
                  element={
                    <ProtectedLayout>
                      <DishesPage />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="dish/:id"
                  element={
                    <ProtectedLayout>
                      <DishDetails />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedLayout>
                      <ProfilePage />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="shopping-list"
                  element={
                    <ProtectedLayout>
                      <ShoppingList />
                    </ProtectedLayout>
                  }
                />
              </Routes>
            </I18nProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
