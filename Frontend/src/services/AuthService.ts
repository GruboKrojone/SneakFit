import i18n from "../translations/service/i18n";
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  password2: string;
  name: string;
  age: number | undefined;
}

interface AuthResponse {
  accessToken: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

class AuthService {
  private static readonly baseUrl = "https://localhost:7059/auth";
  private static readonly TOKEN_KEY = "accessToken";

  static async login(credentials: LoginCredentials): Promise<string> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(i18n.t("auth_service_login_failed"));
    }

    const data: AuthResponse = await response.json();

    this.setToken(data.accessToken);

    return data.accessToken;
  }

  static async register(credentials: RegisterCredentials): Promise<string> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(i18n.t("auth_service_register_failed"));
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data: AuthResponse = await response.json();

      if (data.accessToken) {
        this.setToken(data.accessToken);
        return data.accessToken;
      }
    }

    return "";
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to store token in localStorage", error);
    }
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static getAuthHeader(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static getCurrentUser(): { id: number; email: string; name: string; role: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const nameIdentifierClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
      const emailClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
      const nameClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
      const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      
      return {
        id: Number.parseInt(payload[nameIdentifierClaim] || payload.sub || payload.id || payload.userId),
        email: payload[emailClaim] || payload.email || '',
        name: payload[nameClaim] || payload.name || payload.unique_name || '',
        role: payload[roleClaim] || payload.role || ''
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "Admin";
  }
}

export default AuthService;
