const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev ? "http://localhost:8080/api" : "https://mycortex-tr5r.onrender.com/api";
export const SOCKET_URL = isDev ? "http://localhost:8080" : "https://mycortex-tr5r.onrender.com";
