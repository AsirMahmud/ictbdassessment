// Keep the API origin configurable so the browser can reach the backend in
// local development, containers, and deployed environments.
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export function apiUrl(endpoint: string): string {
  return `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = apiUrl(endpoint);
  
  let authHeader: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dcms_token");
    if (token) {
      authHeader["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeader,
      ...options?.headers,
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.detail || errorJson.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
