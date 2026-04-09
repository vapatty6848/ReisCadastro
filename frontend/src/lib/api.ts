import axios from "axios";

const normalizeApiBaseUrl = (rawUrl?: string) => {
  if (!rawUrl) return "";

  const trimmed = rawUrl.trim().replace(/\/+$/, "");

  try {
    const url = new URL(trimmed);

    // Corrige configuração comum incorreta: frontend em :3000 apontando para API
    if (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.port === "3000"
    ) {
      url.port = "3001";
    }

    // Mantém base sem sufixo /api para evitar /api/api/*
    if (url.pathname.endsWith("/api")) {
      url.pathname = url.pathname.slice(0, -4) || "/";
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return trimmed.replace(/\/api\/?$/, "");
  }
};

export const getApiUrl = () => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("github.dev")
  ) {
    if (
      !process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_URL.includes("localhost")
    ) {
      return `https://${window.location.hostname.replace("-3000", "-3001")}`;
    }
  }

  const envUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  return envUrl || "http://localhost:3001";
};

const api = axios.create({
  baseURL: getApiUrl(),
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("@Corporacao:token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
