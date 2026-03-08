import { useState } from "react";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import { useTranslation } from "react-i18next";

interface DishImageCarouselProps {
  readonly imageUrls: string[];
  readonly dishName: string;
}

const getImageStyle = (
  index: number,
  currentImageIndex: number,
  totalImages: number,
) => {
  let offset = index - currentImageIndex;

  if (offset > totalImages / 2) {
    offset -= totalImages;
  } else if (offset < -totalImages / 2) {
    offset += totalImages;
  }

  const absOffset = Math.abs(offset);
  const direction = offset > 0 ? 1 : -1;

  let scale = 0.6;
  let opacity = 0;
  let zIndex = 1;
  let translateX = direction * absOffset * 100;

  switch (absOffset) {
    case 0:
      scale = 0.9;
      opacity = 1;
      zIndex = 10;
      translateX = 0;
      break;
    case 1:
      scale = 0.7;
      opacity = 0.5;
      zIndex = 5;
      break;
    case 2:
      scale = 0.5;
      zIndex = 3;
      break;
  }

  return { scale, opacity, zIndex, translateX };
};

export default function DishImageCarousel({
  imageUrls,
  dishName,
}: DishImageCarouselProps) {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const displayImagesWithIds = imageUrls.length > 0 ? imageUrls.map((url, i) => ({ url, id: `img-${i}` })) : [];
  if (imageUrls.length > 0) {
    while (displayImagesWithIds.length < 5) {
      const currentLen = displayImagesWithIds.length;
      displayImagesWithIds.push(...displayImagesWithIds.map((item, i) => ({ ...item, id: `repeat-${currentLen}-${i}` })));
    }
  }

  const totalImages = displayImagesWithIds.length > 0 ? displayImagesWithIds.length : 1;
  const uniqueCount = imageUrls.length > 0 ? imageUrls.length : 1;

  if (uniqueCount <= 1) {
    return (
      <div className="center-mode-slider">
        <div className="center-mode-container">
          <div
            className="center-mode-item"
            style={{
              transform: "none",
              opacity: 1,
              zIndex: 10,
              cursor: "default",
            }}
          >
            {displayImagesWithIds[0]?.url ? (
              <img src={displayImagesWithIds[0].url} alt={`${dishName} ${t("dish_alt_text")} 1`} />
            ) : (
              <RestaurantMenu className="carousel-placeholder-icon" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="carousel-container">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() =>
            setCurrentImageIndex((prev) =>
              prev === 0 ? totalImages - 1 : prev - 1,
            )
          }
          aria-label={t("carousel_previous_image")}
        >
          <ChevronLeft className="carousel-arrow-icon" />
        </button>

        <div className="center-mode-slider">
          <div className="center-mode-container">
            {displayImagesWithIds.map((item, index) => {
              const { scale, opacity, zIndex, translateX } = getImageStyle(
                index,
                currentImageIndex,
                totalImages,
              );

              return (
                <div
                  key={item.id}
                  className="center-mode-item"
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                  }}
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={`${dishName} ${t("dish_alt_text")} ${index + 1}`}
                    />
                  ) : (
                    <RestaurantMenu className="carousel-placeholder-icon" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() =>
            setCurrentImageIndex((prev) =>
              prev === totalImages - 1 ? 0 : prev + 1,
            )
          }
          aria-label={t("carousel_next_image")}
        >
          <ChevronRight className="carousel-arrow-icon" />
        </button>
      </div>

      <div className="carousel-indicators">
        {imageUrls.map((url, i) => (
          <button
            key={`dot-indicator-${url}`}
            className={`indicator ${
              i === currentImageIndex % uniqueCount ? "active" : ""
            }`}
            onClick={() => setCurrentImageIndex(i)}
            aria-label={`${t("carousel_go_to_image")} ${i + 1}`}
            type="button"
          />
        ))}
      </div>
    </>
  );
}
