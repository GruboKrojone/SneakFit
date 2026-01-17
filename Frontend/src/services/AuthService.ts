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
      throw new Error("Authentication failed");
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
      throw new Error("Registration failed");
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

  static getCurrentUser(): { id: number; email: string; name: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: Number.parseInt(payload.sub || payload.id || payload.userId),
        email: payload.email || '',
        name: payload.name || payload.unique_name || ''
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
}

export default AuthService;
