import { useState, useEffect, useMemo } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import FavouritesModal from "../components/FavouritesModal";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AdminOnly from "../components/AdminOnly";
import "./styles/ProfilePage.css";
import AuthService from "../services/AuthService";
import DishesService, { Dish, Category } from "../services/DishesService";
import DishImage from "../components/DishImage";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import StarHalf from "@mui/icons-material/StarHalf";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavouriteModalOpen, setIsFavouriteModalOpen] = useState(false);
  const [userDishes, setUserDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => AuthService.getCurrentUser(), []);

  useEffect(() => {
    const fetchUserDishes = async () => {
      if (!currentUser) return;
      try {
        const allDishes = await DishesService.getAllDishes();

        const myDishes = allDishes.filter(
          (dish) =>
            dish.userId === currentUser.id || dish.ownerId === currentUser.id,
        );
        setUserDishes(myDishes);
      } catch (error) {
        console.error("Failed to fetch user dishes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDishes();
  }, [currentUser]);

  const renderRating = (rating: number = 0) => {
    return (
      <div className="dish-rating">
        {[1, 2, 3, 4, 5].map((starValue) => {
          if (rating >= starValue) {
            return <Star key={starValue} className="star-icon filled" />;
          } else if (rating >= starValue - 0.5) {
            return <StarHalf key={starValue} className="star-icon half" />;
          } else {
            return <StarBorder key={starValue} className="star-icon empty" />;
          }
        })}
      </div>
    );
  };

  const getCategoryName = (category: Category) => {
    if (i18n.language === "pl") return category.namePl;
    if (i18n.language === "de") return category.nameDe;
    if (i18n.language === "es") return category.nameEs;
    return category.nameEn;
  };

  const renderDishesContent = () => {
    if (loading) {
      return <div className="loading-text">{t("loading")}</div>;
    }

    if (userDishes.length > 0) {
      return (
        <div className="dishes-grid profile-dishes-grid">
          {userDishes.map((dish) => (
            <div
              className="dishes-box"
              key={dish.id}
              onPointerUp={() => navigate(`/${locale}/dish/${dish.id}`)}
            >
              <div className="dishes-image-wrap">
                <DishImage
                  dishId={dish.id}
                  alt={dish.name}
                  className="dishes-image"
                  placeholderClassName="dishes-restaurant-icon"
                />
              </div>
              <div
                className="dish-visibility-badge"
                title={dish.isPublic ? t("public_dish") : t("private_dish")}
                style={{
                  backgroundColor: dish.isPublic ? "#4caf50" : "#ff9800",
                }}
              >
                {dish.isPublic ? (
                  <PublicIcon className="visibility-icon" />
                ) : (
                  <LockIcon className="visibility-icon" />
                )}
              </div>
              <div className="dishes-body">
                <div className="dishes-name">{dish.name}</div>
                {renderRating(dish.rates)}
                <div className="dishes-categories">
                  {dish.categories?.map((c) => (
                    <span
                      key={c.id}
                      className="dishes-category-tag"
                      style={{
                        borderColor: c.color,
                        color: c.color,
                        background: `${c.color}15`,
                      }}
                    >
                      {getCategoryName(c)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="no-dishes-text">
        {t("profile_no_dishes") || "You haven't created any dishes yet."}
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <PersonIcon className="profile-avatar-icon" />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{currentUser?.name || "User"}</h1>
          <p className="profile-email">{currentUser?.email}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{userDishes.length}</span>
              <span className="stat-label">
                {t("profile_dishes_count") || "Dishes"}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-actions-top">
          <button
            className="settings-gear-btn-profile"
            onClick={() => setIsModalOpen(true)}
            title={t("profile_settings_title")}
          >
            <SettingsIcon className="settings-gear-icon" />
          </button>
        </div>
      </div>

      <div className="profile-toolbar">
        <button
          className="favourites-button"
          onClick={() => setIsFavouriteModalOpen(true)}
        >
          <FavoriteIcon className="btn-icon" />
          {t("favourites")}
        </button>

        <AdminOnly>
          <button
            className="admin-panel-nav-btn"
            onClick={() => navigate(`/${locale}/admin`)}
            title={t("admin_panel")}
          >
            <AdminPanelSettingsIcon /> {t("admin_panel")}
          </button>
        </AdminOnly>
      </div>

      <div className="profile-content">
        <h2 className="section-title">
          {t("profile_my_dishes") || "My Dishes"}
        </h2>
        {renderDishesContent()}
      </div>

      <ProfileSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <FavouritesModal
        isOpen={isFavouriteModalOpen}
        onClose={() => setIsFavouriteModalOpen(false)}
      />
    </div>
  );
}
