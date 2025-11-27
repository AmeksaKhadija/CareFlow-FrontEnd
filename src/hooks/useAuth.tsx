import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "../api/client";

type Role = "admin" | "secretary" | "patient";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Checking authentication...");
      const token = localStorage.getItem("cf_token");

      if (token) {
        console.log("✅ Token found:", token.substring(0, 20) + "...");

        try {
          // Try to decode JWT token for fallback user info
          const base64Url = token.split(".")[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(function (c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
            );

            const decodedToken = JSON.parse(jsonPayload);
            console.log("📋 Decoded token:", decodedToken);

            // Create user object from token as fallback
            const fallbackUser: User = {
              id:
                decodedToken.sub || decodedToken.userId || decodedToken.id || 1,
              name: decodedToken.name || decodedToken.username || "Admin User",
              email: decodedToken.email || "admin@careflow.com",
              role: decodedToken.role || "admin",
            };

            console.log("👤 Created fallback user:", fallbackUser);

            // First try the backend endpoint
            try {
              console.log("🌐 Trying /auth/me endpoint...");
              const response = await apiClient.get("/auth/me");
              console.log("✅ /auth/me success:", response.data);
              setUser(response.data);
            } catch (authError: any) {
              console.log(
                "❌ /auth/me failed, trying fallback...",
                authError.response?.status
              );

              // If backend is not available, use token data
              if (
                authError.response?.status === 404 ||
                authError.response?.status === 401
              ) {
                console.log("🔄 Using token fallback user:", fallbackUser);
                setUser(fallbackUser);
              } else {
                console.log("🗑️ Removing invalid token");
                localStorage.removeItem("cf_token");
              }
            }
          } else {
            console.log("🗑️ Invalid token format");
            localStorage.removeItem("cf_token");
          }
        } catch (error) {
          console.error("❌ Error processing token:", error);
          localStorage.removeItem("cf_token");
        }
      } else {
        console.log("❌ No token found");
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting login for:", email);

      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      console.log("📩 Login response:", response.data);

      if (response.data.token) {
        localStorage.setItem("cf_token", response.data.token);

        // If user data is provided, use it
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          // If no user data, try to decode from token
          try {
            const base64Url = response.data.token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(function (c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
            );

            const decodedToken = JSON.parse(jsonPayload);

            const tokenUser: User = {
              id:
                decodedToken.sub || decodedToken.userId || decodedToken.id || 1,
              name: decodedToken.name || decodedToken.username || "User",
              email: email, // Use the login email
              role: decodedToken.role || "admin",
            };

            console.log("👤 Created user from token:", tokenUser);
            setUser(tokenUser);
          } catch (tokenError) {
            console.error("❌ Error decoding token:", tokenError);
            return false;
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("cf_token");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
