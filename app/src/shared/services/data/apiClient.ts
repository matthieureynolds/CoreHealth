import { fetchAuthSession } from "aws-amplify/auth";

export const API_BASE =
  "https://8th6vbql31.execute-api.eu-north-1.amazonaws.com/v1";

async function getToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("Not authenticated");
  return token;
}

async function request<T>(
  method: string,
  path: string,
  body?: object,
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: object) => request<T>("POST", path, body),
  put: <T>(path: string, body: object) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
