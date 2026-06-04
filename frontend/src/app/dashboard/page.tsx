'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetMyOrders } from '@/lib/api';
import { formatCurrency, formatDate, getToken, logout, type User } from '@/lib/helpers';

interface OrderPackage {
  name?: string;
  quantity?: number;
  price?: number;
  package?: {
    name?: string;
    category?: string;
    image?: string;
  };
}

interface Order {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  total: number;
  status: string;
  paymentMethod?: 'cash' | 'yappy';
  packages: OrderPackage[];
}

const getUserSnapshot = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('ps_user');
};

const parseUserSnapshot = (snapshot: string | null): User | null => {
  if (!snapshot) return null;
  try {
    return JSON.parse(snapshot) as User;
  } catch {
    return null;
  }
};

const statusMeta: Record<
  string,
  { label: string; tone: string }
> = {
  pending: { label: 'Pendiente', tone: 'bg-amber-500/15 text-amber-200 border-amber-500/20' },
  confirmed: { label: 'Confirmada', tone: 'bg-primary/15 text-primary border-primary/20' },
  in_progress: { label: 'En proceso', tone: 'bg-sky-500/15 text-sky-200 border-sky-500/20' },
  completed: { label: 'Completada', tone: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20' },
  cancelled: { label: 'Cancelada', tone: 'bg-rose-500/15 text-rose-200 border-rose-500/20' },
};

export default function DashboardPage() {
  const router = useRouter();
  const userSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('auth-updated', onStoreChange);
      window.addEventListener('storage', onStoreChange);
      return () => {
        window.removeEventListener('auth-updated', onStoreChange);
        window.removeEventListener('storage', onStoreChange);
      };
    },
    getUserSnapshot,
    () => null
  );
  const user = parseUserSnapshot(userSnapshot);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isAuth = useMemo(() => !!getToken() && !!user, [user]);

  useEffect(() => {
    if (!isAuth) {
      router.replace('/auth?returnTo=/dashboard');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await apiGetMyOrders();
        setOrders((data.data || data) as Order[]);
      } catch (error) {
        console.error('Error loading orders:', error);
        setLoadError('No pudimos cargar tus órdenes en este momento.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuth, router]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const { totalSpent, averageOrder, latestOrder, statusBreakdown, monthlyRevenue, topPackages } = useMemo(() => {
    const totalSpentValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = orders.length ? totalSpentValue / orders.length : 0;
    const latestOrderValue = orders[0] ?? null;

    const statusAcc = orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const packageMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach((order) => {
      (order.packages || []).forEach((item) => {
        const name = item.name || item.package?.name || 'Servicio';
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const current = packageMap.get(name) || { name, quantity: 0, revenue: 0 };
        current.quantity += quantity;
        current.revenue += price * quantity;
        packageMap.set(name, current);
      });
    });

    const monthMap = new Map<number, { label: string; value: number; key: number }>();
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = date.getFullYear() * 12 + date.getMonth();
      const label = date.toLocaleDateString('es-PA', { month: 'short' });
      const current = monthMap.get(key) || { label, value: 0, key };
      current.value += order.total || 0;
      monthMap.set(key, current);
    });

    return {
      totalSpent: totalSpentValue,
      averageOrder: averageOrderValue,
      latestOrder: latestOrderValue,
      statusBreakdown: statusAcc,
      monthlyRevenue: Array.from(monthMap.values()).sort((a, b) => a.key - b.key).slice(-6),
      topPackages: Array.from(packageMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4),
    };
  }, [orders]);

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12 space-y-8">
        <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900/80 p-8 animate-pulse">
          <div className="h-4 w-32 rounded-full bg-neutral-800" />
          <div className="mt-4 h-10 w-3/5 rounded-2xl bg-neutral-800" />
          <div className="mt-3 h-5 w-2/3 rounded-full bg-neutral-800" />
          <div className="mt-8 flex gap-3">
            <div className="h-11 w-36 rounded-full bg-neutral-800" />
            <div className="h-11 w-36 rounded-full bg-neutral-800" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[145px] rounded-[1.75rem] border border-neutral-800 bg-neutral-900/80 p-6 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6 shadow-[0_30px_90px_-60px_rgba(59,130,246,0.45)] lg:sticky lg:top-24 lg:self-start">
          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            Panel del cliente
          </div>
          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15 text-2xl text-primary">
              👤
            </div>
            <div className="min-w-0">
              <div className="text-sm uppercase tracking-[0.25em] text-neutral-500">Cuenta activa</div>
              <div className="truncate text-2xl font-black text-white">{user.name}</div>
              <div className="truncate text-sm text-neutral-400">{user.email}</div>
              <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-200">
                {user.role === 'admin' ? 'Administrador' : 'Cliente'}
              </div>
              <Link href="/cuenta" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Editar perfil
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <SidebarMetric label="Órdenes" value={String(orders.length)} />
            <SidebarMetric label="Gasto total" value={formatCurrency(totalSpent)} />
            <SidebarMetric label="Promedio" value={formatCurrency(averageOrder)} />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Última orden</div>
            {latestOrder ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-neutral-300">{latestOrder.orderNumber || latestOrder._id.slice(-8)}</span>
                  <StatusBadge status={latestOrder.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-400">{formatDate(latestOrder.createdAt)}</span>
                  <span className="font-bold text-white">{formatCurrency(latestOrder.total)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-neutral-400">Aún no tienes órdenes registradas.</div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Link href="/checkout" className="block rounded-full bg-primary px-5 py-3 text-center font-bold text-primary-foreground transition hover:scale-[1.01]">
              Ir al checkout
            </Link>
            <Link href="/#paquetes" className="block rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10">
              Ver paquetes
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-200 transition hover:bg-red-500/20"
            >
              Salir
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 shadow-[0_30px_90px_-60px_rgba(59,130,246,0.35)]">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Dashboard premium
            </div>
            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Tus reservas en un solo lugar</h1>
                <p className="mt-4 max-w-2xl text-neutral-400 leading-relaxed">
                  Revisa estados, controla tus compras y vuelve al checkout cuando necesites completar una nueva reserva.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/checkout" className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition hover:scale-[1.01]">
                  Continuar compra
                </Link>
                <Link href="/cart" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10">
                  Ver carrito
                </Link>
              </div>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Órdenes totales" value={String(orders.length)} />
            <MetricCard label="Gasto total" value={formatCurrency(totalSpent)} />
            <MetricCard label="Ticket promedio" value={formatCurrency(averageOrder)} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <ChartCard title="Ingresos por mes" subtitle="Últimos movimientos de tu cuenta">
              <BarChart data={monthlyRevenue} />
            </ChartCard>
            <ChartCard title="Estado de tus órdenes" subtitle="Distribución actual de reservas">
              <StatusBreakdownChart statusBreakdown={statusBreakdown} />
            </ChartCard>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <ChartCard title="Paquetes más pedidos" subtitle="Servicios que más aparecen en tus compras">
              <div className="space-y-3">
                {topPackages.length > 0 ? (
                  topPackages.map((item, index) => (
                    <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="mt-1 text-xs text-neutral-400">{item.quantity} unidades · {formatCurrency(item.revenue)}</div>
                        </div>
                        <div className="text-sm font-bold text-primary">#{index + 1}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Aún no hay suficiente actividad para mostrar paquetes destacados." />
                )}
              </div>
            </ChartCard>

            <ChartCard title="Acciones rápidas" subtitle="Atajos para continuar sin perder tiempo">
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickAction href="/checkout" label="Ir al checkout" description="Terminar una compra pendiente" />
                <QuickAction href="/#paquetes" label="Explorar paquetes" description="Elegir un nuevo servicio" />
                <QuickAction href="/cart" label="Abrir carrito" description="Revisar productos guardados" />
                <QuickAction href="/contacto" label="Contactar" description="Pedir ayuda o cotización" />
              </div>
            </ChartCard>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Mis órdenes</h2>
                <p className="mt-2 text-sm text-neutral-400">Historial de reservas, estados y montos.</p>
              </div>
              <div className="text-sm text-neutral-400">{loading ? 'Actualizando…' : `${orders.length} órdenes registradas`}</div>
            </div>

            {loadError && (
              <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {loadError}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900/80 p-6 animate-pulse">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="h-16 rounded-2xl bg-neutral-800/70" />
                      <div className="h-16 rounded-2xl bg-neutral-800/70" />
                      <div className="h-16 rounded-2xl bg-neutral-800/70" />
                      <div className="h-16 rounded-2xl bg-neutral-800/70" />
                    </div>
                    <div className="mt-4 h-6 w-1/2 rounded-full bg-neutral-800/70" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900/80 p-10 text-center">
                <div className="mb-4 text-4xl">📋</div>
                <p className="font-semibold text-neutral-200">No tienes órdenes aún</p>
                <p className="mt-2 text-sm text-neutral-400">Cuando hagas una reserva, aparecerá aquí con su estado y total.</p>
                <Link href="/#paquetes" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
                  Ver paquetes
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <article key={order._id} className="rounded-[1.75rem] border border-white/10 bg-neutral-950/80 p-6 transition hover:border-primary/40">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="font-mono text-xs text-neutral-500">{order.orderNumber || order._id.slice(-8)}</div>
                          <StatusBadge status={order.status} />
                          {order.paymentMethod && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-200 uppercase tracking-[0.2em]">
                              {order.paymentMethod}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white">{formatDate(order.createdAt)}</h3>
                        <p className="text-sm text-neutral-400">
                          {order.packages?.length || 0} paquete{(order.packages?.length || 0) !== 1 ? 's' : ''} en esta orden
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Total</div>
                        <div className="mt-2 text-2xl font-black text-white tabular-nums">{formatCurrency(order.total)}</div>
                      </div>
                    </div>

                    {order.packages && order.packages.length > 0 && (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {order.packages.map((item, index) => {
                          const itemName = item.name || item.package?.name || 'Servicio';
                          const itemPrice = item.price || 0;
                          const itemQuantity = item.quantity || 1;
                          return (
                            <div key={`${itemName}-${index}`} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                              <div className="font-semibold text-white">{itemName}</div>
                              <div className="mt-1 text-sm text-neutral-400">
                                {itemQuantity} x {formatCurrency(itemPrice)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-neutral-950/80 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)]">
      <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{label}</div>
      <div className="mt-3 text-3xl font-black text-white tabular-nums">{value}</div>
    </div>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{label}</div>
      <div className="mt-2 text-xl font-black text-white tabular-nums">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)]">
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  if (data.length === 0) {
    return <EmptyState text="Aún no hay ventas suficientes para mostrar una gráfica mensual." />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {data.map((item) => {
        const height = `${Math.max(16, Math.round((item.value / max) * 100))}%`;
        return (
          <div key={item.label} className="flex min-h-48 flex-col justify-end rounded-2xl border border-white/5 bg-white/5 p-3">
            <div className="flex min-h-36 items-end">
              <div className="w-full rounded-2xl bg-gradient-to-t from-primary/70 to-primary" style={{ height }} />
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.3em] text-neutral-500">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-white tabular-nums">{formatCurrency(item.value)}</div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBreakdownChart({ statusBreakdown }: { statusBreakdown: Record<string, number> }) {
  const entries = Object.entries(statusBreakdown).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return <EmptyState text="Cuando entren órdenes nuevas verás aquí los estados más frecuentes." />;
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="space-y-3">
      {entries.map(([status, count]) => {
        const meta = statusMeta[status] || { label: status, tone: 'bg-white/10 text-white border-white/10' };
        const width = `${Math.max(8, Math.round((count / total) * 100))}%`;

        return (
          <div key={status} className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${meta.tone}`}>{meta.label}</span>
              <span className="text-sm font-semibold text-white">{count}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const meta = status ? statusMeta[status] : undefined;
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${meta?.tone || 'border-white/10 bg-white/5 text-white'}`}>
      {meta?.label || status || 'Pendiente'}
    </span>
  );
}

function QuickAction({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
      <div className="font-semibold text-white">{label}</div>
      <div className="mt-1 text-sm text-neutral-400">{description}</div>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-neutral-400">
      {text}
    </div>
  );
}
