export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "studysafe_token";

function readStoredToken(): string | null {
  const fromSession = sessionStorage.getItem(TOKEN_KEY);
  if (fromSession) return fromSession;

  const legacy = localStorage.getItem(TOKEN_KEY);
  if (legacy) {
    sessionStorage.setItem(TOKEN_KEY, legacy);
    localStorage.removeItem(TOKEN_KEY);
    return legacy;
  }
  return null;
}

export function getToken(): string | null {
  return readStoredToken();
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TOKEN_KEY);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = body.detail;
    const message =
      typeof detail === "object" && detail?.message
        ? detail.message
        : typeof detail === "string"
          ? detail
          : `Request failed (${res.status})`;
    const code = typeof detail === "object" ? detail?.code : undefined;
    throw new ApiError(message, res.status, code);
  }

  return body as T;
}
