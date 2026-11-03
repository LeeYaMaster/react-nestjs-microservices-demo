const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3000';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  productName: string;
  amount: number;
  createdAt: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg =
      (body as { message?: string | string[] })?.message ||
      res.statusText ||
      '请求失败';
    const message = Array.isArray(msg) ? msg.join('; ') : String(msg);
    throw new Error(message);
  }
  return body as T;
}

export const api = {
  health: () => request<{ gateway: string; users: unknown; orders: unknown }>('/health'),
  listUsers: () => request<User[]>('/users'),
  createUser: (data: { name: string; email: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  listOrders: () => request<Order[]>('/orders'),
  createOrder: (data: { userId: string; productName: string; amount: number }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
};
