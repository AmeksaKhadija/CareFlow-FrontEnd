import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiClient } from "../api/client";

type Role =
  | "Admin"
  | "Doctor"
  | "Nurse"
  | "Patient"
  | "Pharmacist"
  | "Lab"
  | "Staff";
type User = {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialty?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  hasRole: (roles: string[] | Role[]) => boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("cf_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Essayer plusieurs endpoints pour récupérer le profil utilisateur
      (async () => {
        try {
          const res = await apiClient.get("/auth/me");
          setUser(res.data);
          setIsLoading(false);
          return;
        } catch (e: any) {
          // ignore and try fallback
          // but keep the error for possible status checks
        }

        try {
          const res2 = await apiClient.get("/users/me");
          setUser(res2.data);
          setIsLoading(false);
          return;
        } catch (e: any) {
          // If the failure is an unauthorized (401), clear the auth state.
          const status = e?.response?.status;
          if (status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("cf_token");
          }
          // For other errors (404 endpoint not present etc.) try to recover user from token
          // by decoding the JWT payload. This allows session persistence across refresh
          // even if the backend does not expose a /auth/me endpoint.
          try {
            const parseJwt = (t: string) => {
              try {
                const payload = t.split(".")[1];
                const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
                const json = decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map(
                      (c) =>
                        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
                );
                return JSON.parse(json);
              } catch {
                return null;
              }
            };

            const claims = parseJwt(token as string);
            if (claims) {
              const maybeUser: any = {};
              maybeUser.id =
                claims.sub || claims.id || claims.userId || claims.uid;
              maybeUser.email =
                claims.email || claims.upn || claims.preferred_username;
              maybeUser.name =
                claims.name ||
                claims.fullname ||
                claims.preferred_username ||
                maybeUser.email;
              // roles can be in different claim names
              maybeUser.roles =
                claims.roles || claims.role || claims.authorities || [];
              // normalize single role string to array
              if (maybeUser.roles && typeof maybeUser.roles === "string") {
                maybeUser.roles = [maybeUser.roles];
              }
              setUser(maybeUser as any);
            }
          } catch {
            // failed to recover from token
          }
          setIsLoading(false);
        }
      })();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const t = res.data?.token || res.data?.accessToken;
      if (t) {
        localStorage.setItem("cf_token", t);
        setToken(t);

        // Après avoir stocké le token, essayer de récupérer le profil via plusieurs endpoints
        try {
          const prof = await apiClient.get("/auth/me");
          setUser(prof.data);
          return prof.data;
        } catch (e) {
          // essai fallback
        }

        try {
          const prof2 = await apiClient.get("/users/me");
          setUser(prof2.data);
          return prof2.data;
        } catch (e) {
          // Si le serveur ne propose pas d'endpoint pour le profil,
          // tenter d'extraire les données renvoyées directement par /auth/login
          const possibleUser =
            res.data?.user || res.data?.profile || res.data?.data;
          if (possibleUser) {
            setUser(possibleUser);
            return possibleUser;
          }

          // Aucun profil récupéré : on garde le token mais on retourne null
          return null;
        }
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur de connexion");
    }
  };

  const logout = () => {
    apiClient.post("/auth/logout").catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem("cf_token");
  };

  const hasRole = (roles: string[] | Role[]) => {
    if (!user) return false;
    const userRoles = (user as any).roles;
    if (!Array.isArray(userRoles) || userRoles.length === 0) return false;
    return roles.some((r) => userRoles.includes(r as Role));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, hasRole, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
