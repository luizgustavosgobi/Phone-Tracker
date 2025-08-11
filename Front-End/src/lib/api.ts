import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const noAuthRoutes = ["/auth"];

    if (
      config.url &&
      !noAuthRoutes.some((route) => config.url?.startsWith(route))
    ) {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  });
}
