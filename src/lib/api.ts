// Простой API клиент для работы с бэкендом

// На GitHub Pages бэкенд недоступен, используем localStorage
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3001/api');

// Получить токен из localStorage
function getToken(): string | null {
  const session = localStorage.getItem('session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.token || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Базовая функция для запросов
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ===== ОБЩЕЖИТИЯ =====
export async function getDorms() {
  return request('/dorms');
}

export async function getDormById(id: string) {
  return request(`/dorms/${id}`);
}

// ===== ПОЛЬЗОВАТЕЛИ =====
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const result = await request<{ id: string; name: string; email: string }>('/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result;
}

export async function loginUser(email: string, password: string) {
  const result = await request<{ user: any; token: string }>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Сохраняем сессию в localStorage для совместимости
  if (result.token) {
    localStorage.setItem('session', JSON.stringify({
      userId: result.user.id,
      token: result.token,
      createdAt: new Date().toISOString()
    }));
  }
  
  return result;
}

// ===== ЗАЯВКИ =====
export async function getRequests() {
  return request('/requests');
}

export async function createRequest(data: {
  dormId: string;
  dormName: string;
  fullName: string;
  university: string;
  contactType: 'email' | 'telegram';
  contactValue: string;
  roomType: string;
  budget: number;
  moveInMonth: string;
}) {
  return request('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteRequest(id: string) {
  return request(`/requests/${id}`, {
    method: 'DELETE',
  });
}

// ===== ПЛАТЕЖИ =====
export async function getPayments() {
  return request('/payments');
}

export async function createPayment(data: {
  requestId?: string;
  dormId: string;
  dormName: string;
  amount: number;
  status: 'success' | 'declined';
}) {
  return request('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Health check
export async function checkHealth() {
  return request('/health');
}

