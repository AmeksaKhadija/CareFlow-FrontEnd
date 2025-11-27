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
  console.log(
    "🔑 [apiClient] Token from localStorage:",
    token ? `${token.substring(0, 20)}...` : "NO TOKEN"
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(
      "🔑 [apiClient] Added Authorization header:",
      `Bearer ${token.substring(0, 20)}...`
    );
  } else {
    console.warn(
      "⚠️ [apiClient] No token found - request will be unauthorized"
    );
  }
  // In dev, log outgoing requests to help debug server 403/404 on /patients
  if (import.meta.env.DEV) {
    try {
      // avoid logging very large or binary payloads
      const safeData =
        typeof config.data === "object" && config.data !== null
          ? JSON.parse(JSON.stringify(config.data))
          : config.data;
      // eslint-disable-next-line no-console
      console.debug("[apiClient] OUT ->", config.method, config.url, {
        headers: {
          ...(config.headers || {}),
          Authorization: config.headers?.Authorization,
        },
        data: safeData,
      });
    } catch (e) {}
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
    if (import.meta.env.DEV) {
      try {
        // eslint-disable-next-line no-console
        console.debug(
          "[apiClient] ERR <-",
          error.config?.method,
          error.config?.url,
          {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          }
        );
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);
