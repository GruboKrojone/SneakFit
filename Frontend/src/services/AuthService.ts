interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  age: number;
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
  private static baseUrl = "https://localhost:7059/auth";
  private static TOKEN_KEY = "accessToken";

  static async login(credentials: LoginCredentials): Promise<string> {
    try {
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
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async register(credentials: RegisterCredentials): Promise<string> {
    try {
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

      const data: AuthResponse = await response.json();

      this.setToken(data.accessToken);

      return data.accessToken;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
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
}

export default AuthService;
