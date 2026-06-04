'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { removeFromCart, updateCartQuantity, getCartTotal, formatCurrency, getPackageImage } from '@/lib/helpers';

interface CartItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  category?: string;
  image?: string;
  images?: string[];
  duration?: string;
  photos?: number;
  details?: string[];
  features?: string[];
}

const getCartSnapshot = (): string => {
  if (typeof window === 'undefined') return '[]';
  return window.localStorage.getItem('ps_cart') ?? '[]';
};

const parseCartSnapshot = (snapshot: string): CartItem[] => {
  try {
    const raw = JSON.parse(snapshot);
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item): CartItem | null => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const _id = typeof record._id === 'string' && record._id.trim() ? record._id : null;
        const name = typeof record.name === 'string' && record.name.trim() ? record.name : null;
        const description = typeof record.description === 'string' && record.description.trim() ? record.description : null;
        const price = typeof record.price === 'number' && Number.isFinite(record.price)
          ? record.price
          : typeof record.price === 'string' && record.price.trim()
            ? Number(record.price)
            : NaN;
        if (!_id || !name || !description || !Number.isFinite(price) || price < 0) return null;

        const quantity = typeof record.quantity === 'number'
          ? Math.max(1, Math.floor(record.quantity))
          : typeof record.quantity === 'string' && record.quantity.trim()
            ? Math.max(1, Math.floor(Number(record.quantity) || 1))
            : 1;

        const stringList = (value: unknown): string[] | undefined => (
          Array.isArray(value)
            ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
            : undefined
        );

        return {
          _id,
          name,
          description,
          price,
          quantity,
          category: typeof record.category === 'string' ? record.category : undefined,
          image: typeof record.image === 'string' ? record.image : undefined,
          images: stringList(record.images),
          duration: typeof record.duration === 'string' ? record.duration : undefined,
          photos: typeof record.photos === 'number' && Number.isFinite(record.photos) ? record.photos : undefined,
          details: stringList(record.details),
          features: stringList(record.features),
        };
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
};

export default function CartPage() {
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
  const cart = parseCartSnapshot(cartSnapshot);

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    updateCartQuantity(id, quantity);
  };

  return (
    <div className="min-h-screen container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Mi Carrito</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-neutral-400 mb-6">¡Agrega paquetes de fotografía para comenzar tu pedido!</p>
          <Link href="/#paquetes" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-transform">
            Ver Paquetes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex gap-6 items-start"
                >
                  <img
                    src={getPackageImage(item)}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                    <p className="text-primary text-lg font-bold mb-4">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-neutral-700 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item._id, Math.max(1, (item.quantity || 1) - 1))}
                          className="px-3 py-1 hover:bg-neutral-800"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 border-l border-r border-neutral-700">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, (item.quantity || 1) + 1)}
                          className="px-3 py-1 hover:bg-neutral-800"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-400 hover:text-red-300 font-bold text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 h-fit sticky top-20">
            <h3 className="text-xl font-bold mb-6">Resumen del Pedido</h3>
            <div className="space-y-3 mb-6 pb-6 border-b border-neutral-800">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Subtotal:</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Impuestos:</span>
                <span>Incluidos</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6 text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary text-xl">{formatCurrency(getCartTotal())}</span>
            </div>
            <Link
              href="/checkout"
              className="w-full block text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Proceder al Checkout
            </Link>
            <Link
              href="/#paquetes"
              className="w-full block text-center mt-3 px-6 py-3 bg-neutral-800 text-white rounded-lg font-bold hover:bg-neutral-700 transition"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
