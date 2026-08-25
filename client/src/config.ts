// Centralized API and Backend Configuration

const getBackendUrl = (): string => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // Only use localhost in local development mode
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && import.meta.env.DEV) {
    return "http://localhost:8000";
  }

  return "https://hypercode-18ib.onrender.com";
};

export const BACKEND_URL = getBackendUrl();
