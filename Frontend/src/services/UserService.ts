import AuthService from "./AuthService";

export type Language = "EN" | "PL" | "DE" | "ES";

export const languageToLocale: Record<Language, string> = {
  EN: "en",
  PL: "pl",
  DE: "de",
  ES: "es",
};

export const localeToLanguage: Record<string, Language> = {
  en: "EN",
  pl: "PL",
  de: "DE",
  es: "ES",
};

class UserService {
  private static readonly baseUrl = "https://localhost:7059/user";

  static async setLang(userId: number, lang: Language): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/lang?lang=${lang}`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error setting language:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to set language: ${errorMessage}`);
    }
  }
  static async updateSettings(userId: number, settings: { name?: string; age?: number }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/settings`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update settings: ${errorMessage}`);
    }
  }

  static async changePassword(userId: number, dto: { oldPassword: string; newPassword: string }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/password`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to change password: ${errorMessage}`);
    }
  }

  static async changeEmail(userId: number, dto: { newEmail: string }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/email`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error changing email:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to change email: ${errorMessage}`);
    }
  }
}

export default UserService;
