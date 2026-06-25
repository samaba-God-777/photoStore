// API Service - TypeScript
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://photostore-46ci.onrender.com';
export const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : rawUrl + '/api';

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ps_token');
  }
  return null;
};

const headers = (extra: Record<string, string> = {}): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const authHeaders = (extra: Record<string, string> = {}): Record<string, string> => ({
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleRes = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    throw new Error(`Error del servidor (no JSON): ${res.status} ${res.statusText}`);
  }

  if (!res.ok) throw new Error(data.message || 'Error del servidor');
  return data;
};

const normalizeNetworkError = (error: unknown) => {
  if (error instanceof Error && /failed to fetch|networkerror/i.test(error.message)) {
    return new Error('No se pudo conectar con el servidor. Verifica que el backend esté encendido.');
  }
  return error instanceof Error ? error : new Error('No se pudo conectar con el servidor.');
};

const request = (url: string, init: RequestInit = {}, isFormData = false) =>
  fetch(url, {
    ...init,
    headers: isFormData ? authHeaders(init.headers as Record<string, string> | undefined) : headers(init.headers as Record<string, string> | undefined),
  })
    .then(handleRes)
    .catch((error) => {
      throw normalizeNetworkError(error);
    });

// Auth
export const apiRegister = (body: Record<string, unknown>) =>
  request(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

export const apiLogin = (body: Record<string, unknown>) =>
  request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

export const apiGoogleLogin = (credential: string) =>
  request(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ credential }),
  });

export const apiGetMe = () =>
  request(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: headers(),
  });

export const apiLogout = () => {
  localStorage.removeItem('ps_token');
  localStorage.removeItem('ps_user');
};

// Packages
export const apiGetPackages = () =>
  request(`${BASE_URL}/packages`, {
    method: 'GET',
    headers: headers(),
  });

export const apiGetPackage = (id: string) =>
  request(`${BASE_URL}/packages/${id}`, {
    method: 'GET',
    headers: headers(),
  });

export const apiCreatePackage = (body: Record<string, unknown>) =>
  request(`${BASE_URL}/packages`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiCreatePackageForm = (body: FormData) =>
  request(`${BASE_URL}/packages`, {
    method: 'POST',
    body,
  }, true);

export const apiUpdatePackage = (id: string, body: Record<string, unknown>) =>
  request(`${BASE_URL}/packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const apiUpdatePackageForm = (id: string, body: FormData) =>
  request(`${BASE_URL}/packages/${id}`, {
    method: 'PUT',
    body,
  }, true);

export const apiDeletePackage = (id: string) =>
  request(`${BASE_URL}/packages/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });

// Orders
export const apiCreateOrder = (body: Record<string, unknown>) =>
  request(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

export const apiGetOrders = () =>
  request(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: headers(),
  });

export const apiGetMyOrders = () =>
  request(`${BASE_URL}/orders/me`, {
    method: 'GET',
    headers: headers(),
  });

export const apiGetOrder = (id: string) =>
  request(`${BASE_URL}/orders/${id}`, {
    method: 'GET',
    headers: headers(),
  });

export const apiUpdateOrder = (id: string, body: Record<string, unknown>) =>
  request(`${BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });

export const apiUpdateOrderStatus = (id: string, body: Record<string, unknown>) =>
  request(`${BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const apiSetOrderAppointment = (id: string, appointmentDate: string | null) =>
  request(`${BASE_URL}/orders/${id}/appointment`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ appointmentDate }),
  });

export const apiAddOrderComment = (id: string, content: string) =>
  request(`${BASE_URL}/orders/${id}/comments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content }),
  });

export const apiUpdateProfile = (body: FormData) =>
  request(`${BASE_URL}/auth/me`, {
    method: 'PUT',
    body,
  }, true);

// Password Reset
export const apiForgotPassword = (email: string) =>
  request(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email }),
  });

export const apiResetPassword = (token: string, password: string) =>
  request(`${BASE_URL}/auth/reset-password/${token}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ password }),
  });

// Admin
export const apiGetAdminSummary = () =>
  request(`${BASE_URL}/admin/summary`, { method: 'GET' });

export const apiGetAdminUsers = () =>
  request(`${BASE_URL}/admin/users`, { method: 'GET' });

export const apiGetOnlineUsers = () =>
  request(`${BASE_URL}/admin/users/online`, { method: 'GET' });

export const apiUpdateUserRole = (id: string, role: string) =>
  request(`${BASE_URL}/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });

export const apiDeleteUser = (id: string) =>
  request(`${BASE_URL}/admin/users/${id}`, { method: 'DELETE' });

export const apiDeleteOrder = (id: string) =>
  request(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });

export const apiGetAdminPackages = () =>
  request(`${BASE_URL}/packages/admin/all`, { method: 'GET' });
