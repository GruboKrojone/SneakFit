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

class ImagesService {
  private static readonly baseUrl = "https://localhost:7059";

  private static readonly imageCache = new Map<number, string | null>();
  private static readonly imageInFlight = new Map<number, Promise<string | null>>();

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
      
        let id = 0;
      if (typeof result === 'number') {
        id = result;
      } else if (result && typeof result === 'object') {
        id = result.id || result.imageId || result.Id || 0;
      }

      return {
        id: id,
        url: result.url || result.Url || "",
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
    // Return cached result immediately
    if (this.imageCache.has(dishId)) {
      return this.imageCache.get(dishId) ?? null;
    }

    // Deduplicate concurrent requests for the same dishId
    if (this.imageInFlight.has(dishId)) {
      return this.imageInFlight.get(dishId)!;
    }

    const request = (async (): Promise<string | null> => {
      try {
        const response = await fetch(`${this.baseUrl}/image/${dishId}/main`, {
          method: "GET",
          headers: {
            accept: "application/json",
            ...AuthService.getAuthHeader(),
          },
        });

        const url = response.ok ? (await response.json()).url ?? null : null;
        this.imageCache.set(dishId, url);
        return url;
      } catch (error) {
        console.error("Error fetching main image:", error);
        this.imageCache.set(dishId, null);
        return null;
      } finally {
        this.imageInFlight.delete(dishId);
      }
    })();

    this.imageInFlight.set(dishId, request);
    return request;
  }

  /** Call this when a dish's image is updated so the cache is invalidated. */
  static invalidateImageCache(dishId: number): void {
    this.imageCache.delete(dishId);
    this.imageInFlight.delete(dishId);
  }

  static async getSecondaryImage(dishId: number): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/image/${dishId}/secondary`, {
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
      console.error("Error fetching secondary image:", error);
      return null;
    }
  }

  static async getThirdImage(dishId: number): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/image/${dishId}/third`, {
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
      console.error("Error fetching third image:", error);
      return null;
    }
  }

  static async getAllImages(dishId: number): Promise<ImageResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/image/${dishId}/all`, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map((item: Record<string, unknown>) => ({
          id: (item.id ?? item.imageId ?? item.Id ?? 0) as number,
          url: (item.url ?? item.Url ?? "") as string,
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching all images:", error);
      return [];
    }
  }


  static async unassignImageFromDish(imageId: number, dishId: number): Promise<void> {
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

export default ImagesService;
