import { useState, useEffect } from "react";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import ImagesService from "../services/ImagesService";

interface DishImageProps {
  readonly dishId: number;
  readonly alt: string;
  readonly className?: string;
  readonly placeholderClassName?: string;
}

export default function DishImage({ dishId, alt, className, placeholderClassName }: DishImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      setLoading(true);
      try {
        const url = await ImagesService.getMainImage(dishId);
        if (isMounted) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error(`Error fetching image for dish ${dishId}:`, error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [dishId]);

  if (loading) {
    return <div className={`image-loading-placeholder ${className}`} />;
  }

  if (!imageUrl) {
    return <RestaurantMenu className={placeholderClassName || "placeholder-icon"} />;
  }

  return <img src={imageUrl} alt={alt} className={className} />;
}
