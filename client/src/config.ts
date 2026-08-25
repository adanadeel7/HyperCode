// Centralized API and Backend Configuration

const getBackendUrl = (): string => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // Runtime detection: if running on Vercel or any non-localhost domain, always use production Render backend
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://hypercode-18ib.onrender.com";
  }

  return "http://localhost:8000";
};

export const BACKEND_URL = getBackendUrl();
