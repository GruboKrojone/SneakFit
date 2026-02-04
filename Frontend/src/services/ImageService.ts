import AuthService from "./AuthService";
import i18n from "../translations/service/i18n";

export interface ImageResponse {
  id: number;
  url: string;
}

export interface PreviewImage {
  id: string;
  url: string;
  file: File;
}

class ImageService {
  private static readonly baseUrl = "https://localhost:7059";

  static async uploadImage(file: File): Promise<ImageResponse> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${this.baseUrl}/image`, {
        method: "POST",
        headers: {
          ...AuthService.getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", response.status, errorText);
        throw new Error(`${i18n.t("image_service_upload_failed")} (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      
      // Ensure we return the correct structure
      return {
        id: result.id || result,
        url: result.url || "",
      };
    } catch (error) {
      console.error("Error in uploadImage:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(i18n.t("image_service_upload_failed"));
    }
  }

  static async assignImagesToDish(dishId: number, imageIds: number[]): Promise<void> {
    // API expects: mainId, secondId, thirdId as query parameters
    const params = new URLSearchParams();
    
    if (imageIds.length > 0) params.append("mainId", imageIds[0].toString());
    if (imageIds.length > 1) params.append("secondId", imageIds[1].toString());
    if (imageIds.length > 2) params.append("thirdId", imageIds[2].toString());

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseUrl}/image/${dishId}/assign?${queryString}` 
      : `${this.baseUrl}/image/${dishId}/assign`;
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        accept: "application/json",
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Assign images failed:", response.status, errorText);
      throw new Error(i18n.t("image_service_assign_failed"));
    }
  }

  static async getMainImage(dishId: number): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/image/${dishId}/main`, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error fetching main image:", error);
      return null;
    }
  }

  static async unassignImageFromDish(imageId: number, dishId: number): Promise<void> {
    // The user wrote: DELETE baseUrl/ingredient/{id}/unassignFromDish/{dishId}
    // But description says: usuwanie przypisania zdjęcia do dania
    // I will use what they wrote but it's suspicious. Actually, I'll follow the exact path they gave.
    const response = await fetch(`${this.baseUrl}/ingredient/${imageId}/unassignFromDish/${dishId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(i18n.t("image_service_unassign_failed"));
    }
  }
}

export default ImageService;
