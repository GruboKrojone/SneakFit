import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import ProtectedLayout from "./components/ProtectedLayout";
import DishDetails from "./pages/DishDetails";
import DishesPage from "./pages/DishesPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import I18nProvider from "./translations/components/i18nProvider";
import NotFoundRedirect from "./services/NotFoundRedirect";
import LocaleValidator from "./translations/service/LocaleValidator";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Navigate to="/en/login" replace />} />
        <Route path="/:locale/*" element={<LocaleValidator />}>
          <Route
            path="*"
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
                        <ShoppingListPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route path="*" element={<NotFoundRedirect />} />
                </Routes>
              </I18nProvider>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/en/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
