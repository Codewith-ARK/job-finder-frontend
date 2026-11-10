import axios from "axios";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function detailFrom(response: unknown): string | undefined {
  const data = (response as { data?: unknown })?.data;
  if (!data || typeof data !== "object") return undefined;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: unknown };
    if (typeof first?.msg === "string") return first.msg;
  }
  return undefined;
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (axios.isAxiosError(error)) {
    const detail = detailFrom(error.response);
    if (detail) return detail;
    if (!error.response)
      return "The API is unreachable. Check that the backend is running.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export const httpClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  if (!["get", "head", "options"].includes(method)) {
    const csrf = readCookie("jf_csrf");
    if (csrf) config.headers.set("X-CSRF-Token", csrf);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const detail = detailFrom(error.response);
      const isAuthRequest = error.config?.url?.startsWith("/auth/") ?? false;
      if (status === 401 && !isAuthRequest && typeof window !== "undefined") {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?next=${encodeURIComponent(next)}`);
      }
      if (detail) throw new ApiError(detail, status);
      if (!error.response) {
        throw new ApiError(
          "The API is unreachable. Check that the backend is running.",
          0,
        );
      }
    }
    throw error;
  },
);
