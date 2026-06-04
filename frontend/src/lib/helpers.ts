// Utilities - TypeScript
export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'customer' | 'admin';
  createdAt?: string;
}

export interface Package {
  _id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  image?: string;
  images?: string[];
  duration?: string;
  photos?: number;
  details?: string[];
  features?: string[];
}

export interface CartItem extends Package {
  quantity?: number;
}

export type ToastType = 'info' | 'success' | 'error' | 'warning';

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const emitStorageEvent = (name: string, detail?: Record<string, unknown>) => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

const asString = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value : null);

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeCartItem = (value: unknown): CartItem | null => {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const _id = asString(item._id);
  const name = asString(item.name);
  const description = asString(item.description);
  const price = asNumber(item.price);
  if (!_id || !name || !description || price === null || price < 0) return null;

  const quantityRaw = asNumber(item.quantity);
  const quantity = quantityRaw === null ? 1 : Math.max(1, Math.floor(quantityRaw));
  const category = asString(item.category) ?? undefined;
  const image = asString(item.image) ?? undefined;
  const duration = asString(item.duration) ?? undefined;
  const photos = asNumber(item.photos);
  const details = Array.isArray(item.details) ? item.details.filter((detail): detail is string => typeof detail === 'string' && detail.trim().length > 0) : undefined;
  const features = Array.isArray(item.features) ? item.features.filter((feature): feature is string => typeof feature === 'string' && feature.trim().length > 0) : undefined;
  const images = Array.isArray(item.images) ? item.images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0) : undefined;

  return {
    _id,
    name,
    description,
    price,
    quantity,
    category,
    image,
    images,
    duration,
    photos: photos === null ? undefined : photos,
    details,
    features,
  };
};

const normalizeCart = (value: unknown): CartItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeCartItem).filter((item): item is CartItem => item !== null);
};

// Toast notifications
export const showToast = (message: string, type: ToastType = 'info', duration = 3500) => {
  if (typeof window === 'undefined') return;

  let container = document.querySelector('.toast-container') as HTMLElement;
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    padding: 12px 16px;
    margin: 8px;
    border-radius: 6px;
    background-color: ${
      type === 'success'
        ? '#10b981'
        : type === 'error'
          ? '#ef4444'
          : type === 'warning'
            ? '#f59e0b'
            : '#3b82f6'
    };
    color: white;
    animation: slideIn 0.3s ease-in-out;
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
};

// User management
export const saveUser = (user: User) => {
  if (!isBrowser()) return;
  localStorage.setItem('ps_user', JSON.stringify(user));
  emitStorageEvent('auth-updated', { user });
};

export const getUser = (): User | null => {
  if (!isBrowser()) return null;
  try {
    const user = localStorage.getItem('ps_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const logout = () => {
  if (!isBrowser()) return;
  localStorage.removeItem('ps_token');
  localStorage.removeItem('ps_user');
  emitStorageEvent('auth-updated');
  window.location.href = '/auth';
};

export const requireAuth = (): boolean => {
  if (!isBrowser()) return false;
  if (!localStorage.getItem('ps_token') || !getUser()) {
    window.location.href = '/auth';
    return false;
  }
  return true;
};

export const requireAdmin = (): boolean => {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    showToast('Acceso denegado', 'error');
    window.location.href = '/';
    return false;
  }
  return true;
};

// Cart management
export const getCart = (): CartItem[] => {
  if (!isBrowser()) return [];
  try {
    const cart = localStorage.getItem('ps_cart');
    return cart ? normalizeCart(JSON.parse(cart)) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  if (!isBrowser()) return;
  localStorage.setItem('ps_cart', JSON.stringify(normalizeCart(cart)));
  updateCartBadge();
};

export const addToCart = (pkg: Package) => {
  const cart = getCart();
  const exists = cart.find((i) => i._id === pkg._id);
  if (exists) {
    showToast('Este paquete ya está en el carrito', 'info');
    return;
  }
  cart.push({ ...pkg, quantity: 1 });
  saveCart(cart);
  showToast('Paquete agregado al carrito', 'success');
};

export const removeFromCart = (id: string) => {
  const cart = getCart();
  saveCart(cart.filter((i) => i._id !== id));
  showToast('Paquete eliminado del carrito', 'info');
};

export const updateCartQuantity = (id: string, quantity: number) => {
  const cart = getCart();
  const item = cart.find((i) => i._id === id);
  if (item) {
    item.quantity = Math.max(1, Math.floor(quantity));
    saveCart(cart);
  }
};

export const getCartTotal = (): number => {
  return getCart().reduce((total, item) => total + item.price * (item.quantity || 1), 0);
};

export const clearCart = () => {
  if (!isBrowser()) return;
  localStorage.removeItem('ps_cart');
  updateCartBadge();
};

export const updateCartBadge = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: getCart().length } }));
};

// Token management
export const saveToken = (token: string) => {
  if (!isBrowser()) return;
  localStorage.setItem('ps_token', token);
  emitStorageEvent('auth-updated', { token });
};

export const getToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem('ps_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUser();
};

// Format utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const getPackageKey = (pkg: Package): string => {
  const key = (pkg.name || pkg.category || '').toLowerCase();
  if (key.includes('bronce')) return 'bronce';
  if (key.includes('plata')) return 'plata';
  if (key.includes('oro')) return 'oro';
  if (key.includes('diamante')) return 'diamante';
  if (key.includes('vip')) return 'vip';
  if (key.includes('premium')) return 'premium';
  return 'default';
};

const packageImages: Record<string, string> = {
  bronce: '/imagen/bronce.jpeg',
  plata: '/imagen/plata.jpeg',
  oro: '/imagen/oro.jpeg',
  diamante: '/imagen/diamante.jpeg',
  vip: '/imagen/vip.jpeg',
  premium: '/imagen/pic1.jpeg',
  default: '/imagen/pic1.jpeg',
};

const getServerBase = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://photostore-46ci.onrender.com';
  return url.endsWith('/api') ? url.slice(0, -4) : url;
};

export const getPackageImageUrl = (image: string | null | undefined): string => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/uploads/')) return `${getServerBase()}${image}`;
  return image;
};

export const getPackageImage = (pkg: Package): string => {
  if (pkg.image) return getPackageImageUrl(pkg.image);
  if (pkg.images && pkg.images.length > 0) return pkg.images[0];
  return packageImages[getPackageKey(pkg)] || packageImages.default;
};

