'use client';

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiCreateOrder } from '@/lib/api';
import {
  clearCart,
  formatCurrency,
  getUser,
  showToast,
} from '@/lib/helpers';

interface CartItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  category?: string;
  image?: string;
}

const paymentOptions = [
  { value: 'cash', label: 'Efectivo', description: 'Paga al entregar o durante la sesión.' },
  { value: 'yappy', label: 'Yappy', description: 'Confirma tu reserva con pago inmediato.' },
] as const;

const getCartSnapshot = (): string => {
  if (typeof window === 'undefined') return '[]';
  return window.localStorage.getItem('ps_cart') ?? '[]';
};

const parseCart = (snapshot: string): CartItem[] => {
  try {
    const raw = JSON.parse(snapshot);
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is CartItem =>
      item && typeof item._id === 'string' && typeof item.name === 'string' && typeof item.price === 'number'
    );
  } catch {
    return [];
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const cartSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('cart-updated', onStoreChange);
      window.addEventListener('storage', onStoreChange);
      return () => {
        window.removeEventListener('cart-updated', onStoreChange);
        window.removeEventListener('storage', onStoreChange);
      };
    },
    getCartSnapshot,
    () => '[]'
  );
  const isAuth = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('auth-updated', onStoreChange);
      window.addEventListener('storage', onStoreChange);
      return () => {
        window.removeEventListener('auth-updated', onStoreChange);
        window.removeEventListener('storage', onStoreChange);
      };
    },
    () => {
      if (typeof window === 'undefined') return false;
      return !!window.localStorage.getItem('ps_token') && !!window.localStorage.getItem('ps_user');
    },
    () => false
  );
  const cart = parseCart(cartSnapshot);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'yappy'>('cash');
  const [yappyPhone, setYappyPhone] = useState('');

  const storedUser = getUser();
  const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((count, item) => count + (item.quantity || 1), 0), [cart]);
  const authReturnTo = '/checkout';
  const contactDefaults = {
    fullName: storedUser?.name || '',
    email: storedUser?.email || '',
    phone: storedUser?.phone || '',
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Tu carrito está vacío', 'error');
      return;
    }

    if (paymentMethod === 'yappy' && !yappyPhone.trim()) {
      showToast('Agrega tu número de Yappy para continuar.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await apiCreateOrder({
        packages: cart.map((item) => ({
          packageId: item._id,
          quantity: item.quantity || 1,
        })),
        fullName: formData.fullName || contactDefaults.fullName,
        email: formData.email || contactDefaults.email,
        phone: formData.phone || contactDefaults.phone,
        paymentMethod,
        yappyPhone: paymentMethod === 'yappy' ? yappyPhone : undefined,
        notes: formData.notes,
      });
      showToast('¡Orden creada exitosamente!', 'success');
      clearCart();
      router.push('/dashboard');
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Error al crear la orden', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-8 shadow-[0_30px_90px_-60px_rgba(59,130,246,0.6)]">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Requiere acceso
            </div>
            <h1 className="mt-5 text-4xl font-black text-white">Inicia sesión o crea tu cuenta para continuar</h1>
            <p className="mt-4 max-w-2xl text-neutral-400 leading-relaxed">
              Tu carrito ya está listo. Para completar la reserva, necesitamos tu cuenta para confirmar la orden y enviarte los detalles de tu sesión.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/login?returnTo=${authReturnTo}`}
                className="rounded-full bg-primary px-6 py-4 text-center font-bold text-primary-foreground transition hover:scale-[1.01]"
              >
                Iniciar sesión
              </Link>
              <Link
                href={`/login?returnTo=${authReturnTo}&mode=register`}
                className="rounded-full border border-neutral-700 bg-neutral-900 px-6 py-4 text-center font-bold text-white transition hover:bg-white/5"
              >
                Crear cuenta
              </Link>
              <Link
                href="/cart"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center font-bold text-white transition hover:bg-white/10"
              >
                Volver al carrito
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MiniBadge label="Artículos" value={String(cart.length)} />
              <MiniBadge label="Unidades" value={String(itemCount)} />
              <MiniBadge label="Total" value={formatCurrency(subtotal)} />
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Resumen rápido</div>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item._id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="mt-1 text-xs text-neutral-400">{item.quantity || 1} unidad{(item.quantity || 1) > 1 ? 'es' : ''}</div>
                  </div>
                  <div className="text-sm font-bold text-primary">{formatCurrency(item.price * (item.quantity || 1))}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-neutral-950/80 p-10 text-center shadow-[0_30px_90px_-60px_rgba(59,130,246,0.4)]">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-4 text-2xl font-bold text-white">Tu carrito está vacío</h2>
          <p className="mb-8 text-neutral-400">Agrega un paquete para continuar con el checkout y completar tu reserva.</p>
          <Link href="/#paquetes" className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
            Ver Paquetes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
          Checkout seguro
        </div>
        <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">Finalizar compra</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Confirma tus datos, revisa tu carrito y completa la reserva con el método de pago que prefieras.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Información de contacto</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Paso 1 de 3
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nombre completo" value={formData.fullName || contactDefaults.fullName} name="fullName" onChange={handleChange} />
              <Field label="Email" value={formData.email || contactDefaults.email} name="email" onChange={handleChange} type="email" />
              <Field label="Teléfono" value={formData.phone || contactDefaults.phone} name="phone" onChange={handleChange} type="tel" />
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-neutral-300 md:col-span-2">
                {isAuth ? 'Tu cuenta está conectada y los datos se pueden autocompletar.' : 'Conecta tu cuenta para completar la compra más rápido.'}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Detalles de la sesión</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Paso 2 de 3
              </span>
            </div>
            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-white">Notas adicionales</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Cuéntanos sobre tu sesión, preferencias especiales, horarios o locación."
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Método de pago</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Paso 3 de 3
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    paymentMethod === option.value
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold">{option.label}</div>
                  <div className="mt-1 text-xs text-neutral-400">{option.description}</div>
                </button>
              ))}
            </div>

            {paymentMethod === 'yappy' && (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-white">Número de Yappy</label>
                <input
                  type="tel"
                  value={yappyPhone}
                  onChange={(e) => setYappyPhone(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-primary"
                  placeholder="6111-2222"
                />
              </div>
            )}
          </div>
        </form>

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-neutral-950/85 p-6 shadow-[0_30px_90px_-60px_rgba(59,130,246,0.45)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Resumen</div>
                  <h3 className="mt-2 text-2xl font-black text-white">Tu orden</h3>
                </div>
                <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {cart.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="mt-1 text-xs text-neutral-400">{item.quantity || 1} x {formatCurrency(item.price)}</div>
                      </div>
                      <div className="text-sm font-bold text-primary">{formatCurrency(item.price * (item.quantity || 1))}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                <LineItem label="Subtotal" value={formatCurrency(subtotal)} />
                <LineItem label="Envío" value="Gratis" />
                <LineItem label="Impuestos" value="Incluidos" />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4">
                <span className="text-sm font-semibold text-white">Total a pagar</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(subtotal)}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="mt-5 w-full rounded-full bg-primary px-6 py-4 font-bold text-primary-foreground transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Procesando...' : 'Confirmar y pagar'}
              </button>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-neutral-300">
                Te enviaremos un correo de confirmación con todos los detalles de tu reserva.
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-neutral-950/70 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Atajos</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/cart" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  Volver al carrito
                </Link>
                <Link href="/#paquetes" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  Seguir viendo paquetes
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-white">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-primary"
      />
    </div>
  );
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function MiniBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{label}</div>
      <div className="mt-2 text-lg font-black text-white">{value}</div>
    </div>
  );
}
