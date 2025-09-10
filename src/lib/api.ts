import { cookies } from "next/headers";

export const API_BASE_URL = "https://webhook.storeprodigital.site/webhook/bet";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const headers: HeadersInit = {
    ...(init.headers || {}),
  } as any;
  if (token) (headers as any).Authorization = `Bearer ${token}`;
  if (!(headers as any)["Content-Type"] && (init.method === "POST" || init.method === "PUT" || init.method === "PATCH")) {
    (headers as any)["Content-Type"] = "application/json";
  }
  const url = `${API_BASE_URL}${path}`;
  return fetch(url, { ...init, headers, cache: "no-store" });
}
