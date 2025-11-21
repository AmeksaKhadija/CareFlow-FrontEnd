import axios from "axios";

// Configuration de base pour toutes les requêtes API
export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token automatiquement
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("cf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur modifié - ne redirige plus automatiquement
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Commenter cette ligne pour éviter la redirection automatique
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("cf_token");
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);
