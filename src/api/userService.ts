import { apiClient } from "./client";

export type User = {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  specialty?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
};

export type Schedule = {
  day: string;
  from: string;
  to: string;
};

export type Doctor = User & {
  role: "medecin";
  specialty: string;
  schedule?: Schedule[];
};

export const userService = {
  // Récupérer tous les utilisateurs avec filtre par rôle
  getUsers: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const response = await apiClient.get("/users", { params });
    // Normalize response shape: some backends return { data: [...] }, { users: [...] }
    // or the array directly. Prefer the inner array if present.
    const payload = response.data;
    return payload?.users ?? payload?.data ?? payload;
  },

  // Récupérer les médecins spécifiquement
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get("/users", {
      params: { role: "medecin" },
    });
    const payload = response.data;
    return payload?.users ?? payload?.data ?? payload;
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    const payload = response.data;
    return payload?.user ?? payload?.data ?? payload;
  },
};
