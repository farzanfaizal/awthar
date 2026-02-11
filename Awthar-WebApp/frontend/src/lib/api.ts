import { createClient } from "@/lib/supabase/client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function throwIfNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Makes an authenticated API request to the backend
 */
export async function apiRequest(
  method: string,
  path: string,
  data?: unknown
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  const headers: HeadersInit = {
    ...authHeaders,
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfNotOk(res);
  return res;
}

/**
 * GET request helper
 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiRequest("GET", path);
  return res.json();
}

/**
 * POST request helper
 */
export async function apiPost<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiRequest("POST", path, data);
  return res.json();
}

/**
 * PATCH request helper
 */
export async function apiPatch<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiRequest("PATCH", path, data);
  return res.json();
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiRequest("DELETE", path);
  return res.json();
}

/**
 * Upload file(s) to backend
 */
export async function apiUpload(
  path: string,
  formData: FormData
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
  });

  await throwIfNotOk(res);
  return res;
}
