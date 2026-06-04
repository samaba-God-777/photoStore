"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  apiCreatePackageForm,
  apiDeleteOrder,
  apiDeletePackage,
  apiDeleteUser,
  apiGetAdminPackages,
  apiGetAdminUsers,
  apiGetOnlineUsers,
  apiGetOrders,
  apiUpdateOrderStatus,
  apiUpdatePackageForm,
  apiUpdateUserRole,
} from "@/lib/api";
import { formatCurrency, formatDate, getPackageImage, getPackageImageUrl, isAuthenticated, logout, showToast, type Package, type User } from "@/lib/helpers";

type AdminTab = "dashboard" | "packages" | "orders" | "users";

type AdminUser = User & {
  phone?: string;
  lastSeen?: string | null;
  isOnline?: boolean;
};

type PackageFormState = {
  name: string;
  description: string;
  price: string;
  category: "exterior" | "studio" | "both";
  duration: string;
  photos: string;
  features: string;
  popular: boolean;
  active: boolean;
};

type AdminPackage = Package & {
  active?: boolean;
  popular?: boolean;
  createdAt?: string;
};

type AdminOrder = {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  total: number;
  status: string;
  paymentMethod?: string;
  user?: { name?: string; email?: string; phone?: string };
  packages?: Array<{ name?: string; quantity?: number; price?: number; package?: { name?: string; category?: string } }>;
};

const emptyPackageForm: PackageFormState = {
  name: "",
  description: "",
  price: "",
  category: "studio",
  duration: "",
  photos: "",
  features: "",
  popular: false,
  active: true,
};

const parseSnapshot = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const getUserSnapshot = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("ps_user");
};

const getFriendlyLastSeen = (lastSeen?: string | null) => {
  if (!lastSeen) return "Sin actividad";
  return formatDate(lastSeen);
};

const toDateValue = (value: string) => (value ? new Date(`${value}T00:00:00`) : null);

const inDateRange = (dateValue: string, from: string, to: string) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const start = from ? toDateValue(from) : null;
  const end = to ? new Date(`${to}T23:59:59.999`) : null;

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};

const chartColors = ["#60a5fa", "#f59e0b", "#34d399", "#f472b6", "#a78bfa", "#fb7185", "#22d3ee", "#c084fc"];



export default function AdminPage() {
  const router = useRouter();
  const userSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("auth-updated", onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener("auth-updated", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    getUserSnapshot,
    () => null,
  );
  const currentUser = useMemo(() => parseSnapshot<AdminUser>(userSnapshot), [userSnapshot]);

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [editingPackageImageUrl, setEditingPackageImageUrl] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState<PackageFormState>(emptyPackageForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadWarning, setLoadWarning] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadWarning(null);
    try {
      const [packagesRes, ordersRes, usersRes, onlineRes] = await Promise.allSettled([
        apiGetAdminPackages(),
        apiGetOrders(),
        apiGetAdminUsers(),
        apiGetOnlineUsers(),
      ]);

      const packagesData = packagesRes.status === "fulfilled" ? (packagesRes.value.data || packagesRes.value) : [];
      const ordersData = ordersRes.status === "fulfilled" ? (ordersRes.value.data || ordersRes.value) : [];
      const usersData = usersRes.status === "fulfilled" ? (usersRes.value.data || usersRes.value) : [];
      const onlineData = onlineRes.status === "fulfilled" ? (onlineRes.value.data || onlineRes.value) : [];

      setPackages(packagesData);
      setOrders(ordersData);
      setUsers(usersData);
      setOnlineUsers(onlineData);

      const failed = [packagesRes, ordersRes, usersRes, onlineRes].some((item) => item.status === "rejected");
      if (failed) {
        setLoadWarning("Algunos datos no pudieron cargarse. El panel sigue funcionando con la información disponible.");
      }
    } catch (error) {
      console.error(error);
      setPackages([]);
      setOrders([]);
      setUsers([]);
      setOnlineUsers([]);
      setLoadWarning("No se pudo conectar con el servidor. Revisa que el backend esté encendido.");
      showToast(error instanceof Error ? error.message : "No se pudo cargar el panel admin", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth");
      return;
    }
    if (!currentUser) return;
    if (currentUser.role !== "admin") {
      router.replace("/auth");
      return;
    }
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentUser, router]);

  const resetPackageForm = () => {
    setEditingPackageId(null);
    setPackageImage(null);
    setEditingPackageImageUrl(null);
    setPackageForm(emptyPackageForm);
  };

  const handlePackageField = (field: keyof PackageFormState, value: string | boolean) => {
    setPackageForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPackageFormData = () => {
    const formData = new FormData();
    formData.append("name", packageForm.name.trim());
    formData.append("description", packageForm.description.trim());
    formData.append("price", packageForm.price.trim());
    formData.append("category", packageForm.category);
    formData.append("duration", packageForm.duration.trim());
    formData.append("photos", packageForm.photos.trim() || "0");
    formData.append("features", packageForm.features);
    formData.append("popular", packageForm.popular ? "true" : "false");
    formData.append("active", packageForm.active ? "true" : "false");
    if (packageImage) formData.append("image", packageImage);
    return formData;
  };

  const handlePackageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!packageForm.name.trim() || !packageForm.description.trim()) {
      showToast("Completa nombre y descripción del paquete", "warning");
      return;
    }

    setBusyId("package-save");
    try {
      const formData = buildPackageFormData();
      if (editingPackageId) {
        await apiUpdatePackageForm(editingPackageId, formData);
        showToast("Paquete actualizado", "success");
      } else {
        await apiCreatePackageForm(formData);
        showToast("Paquete creado", "success");
      }
      resetPackageForm();
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo guardar el paquete", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleEditPackage = (pkg: AdminPackage) => {
    setEditingPackageId(pkg._id);
    setPackageImage(null);
    setEditingPackageImageUrl(pkg.image || null);
    setPackageForm({
      name: pkg.name || "",
      description: pkg.description || "",
      price: String(pkg.price ?? ""),
      category: (pkg.category as PackageFormState["category"]) || "studio",
      duration: pkg.duration || "",
      photos: String(pkg.photos ?? ""),
      features: (pkg.features || []).join(", "),
      popular: !!pkg.popular,
      active: pkg.active !== false,
    });
    setActiveTab("packages");
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("¿Eliminar este paquete?")) return;
    setBusyId(id);
    try {
      await apiDeletePackage(id);
      showToast("Paquete eliminado", "success");
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar el paquete", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleOrderStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await apiUpdateOrderStatus(id, { status });
      showToast("Estado actualizado", "success");
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo actualizar la orden", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("¿Eliminar esta orden?")) return;
    setBusyId(id);
    try {
      await apiDeleteOrder(id);
      showToast("Orden eliminada", "success");
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar la orden", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleUserRole = async (id: string, role: "user" | "admin") => {
    setBusyId(id);
    try {
      await apiUpdateUserRole(id, role);
      showToast("Rol actualizado", "success");
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo actualizar el usuario", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Eliminar este usuario y sus órdenes?")) return;
    setBusyId(id);
    try {
      await apiDeleteUser(id);
      showToast("Usuario eliminado", "success");
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar el usuario", "error");
    } finally {
      setBusyId(null);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesDate = (!fromDate && !toDate) || inDateRange(order.createdAt, fromDate, toDate);
      const haystack = [
        order.orderNumber,
        order.user?.name,
        order.user?.email,
        order.status,
        order.paymentMethod,
        ...(order.packages || []).map((item) => item.name),
        ...(order.packages || []).map((item) => item.package?.category),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      return matchesDate && matchesSearch;
    });
  }, [orders, fromDate, toDate, normalizedSearch]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesDate = (!fromDate && !toDate) || inDateRange(pkg.createdAt || "", fromDate, toDate);
      const haystack = [
        pkg.name,
        pkg.description,
        pkg.category,
        pkg.duration,
        pkg.popular ? "popular" : "",
        pkg.active === false ? "inactive" : "active",
        ...(pkg.features || []),
        ...(pkg.details || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      return matchesDate && matchesSearch;
    });
  }, [packages, fromDate, toDate, normalizedSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesDate = (!fromDate && !toDate) || inDateRange(user.createdAt || "", fromDate, toDate);
      const haystack = [user.name, user.email, user.phone, user.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      return matchesDate && matchesSearch;
    });
  }, [users, fromDate, toDate, normalizedSearch]);

  const filteredOnlineUsers = useMemo(() => {
    return onlineUsers.filter((user) => {
      const haystack = [user.name, user.email, user.phone, user.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !normalizedSearch || haystack.includes(normalizedSearch);
    });
  }, [onlineUsers, normalizedSearch]);

  const filteredSummary = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = filteredOrders.length ? totalRevenue / filteredOrders.length : 0;
    const statusBreakdown = filteredOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    const packageMap = new Map<string, { name: string; category: string; quantity: number; revenue: number; orders: number }>();
    const categoryMap = new Map<string, { category: string; revenue: number; quantity: number; orders: number }>();

    filteredOrders.forEach((order) => {
      (order.packages || []).forEach((item) => {
        const name = item.name || "Paquete";
        const category = item.package?.category || "sin categoría";
        const quantity = item.quantity || 1;
        const revenue = (item.price || 0) * quantity;

        const packageEntry = packageMap.get(name) || { name, category, quantity: 0, revenue: 0, orders: 0 };
        packageEntry.quantity += quantity;
        packageEntry.revenue += revenue;
        packageEntry.orders += 1;
        packageMap.set(name, packageEntry);

        const categoryEntry = categoryMap.get(category) || { category, revenue: 0, quantity: 0, orders: 0 };
        categoryEntry.quantity += quantity;
        categoryEntry.revenue += revenue;
        categoryEntry.orders += 1;
        categoryMap.set(category, categoryEntry);
      });
    });

    const topPackages = Array.from(packageMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    const serviceCategories = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
      topPackages,
      serviceCategories,
    };
  }, [filteredOrders]);

  const monthlyRevenue = useMemo(() => {
    const months = new Map<string, { label: string; value: number; order: number }>();
    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const orderKey = date.getFullYear() * 12 + date.getMonth();
      const label = date.toLocaleDateString("es-PA", { month: "short", year: "2-digit" });
      const entry = months.get(String(orderKey)) || { label, value: 0, order: orderKey };
      entry.value += order.total || 0;
      months.set(String(orderKey), entry);
    });
    return Array.from(months.values())
      .sort((a, b) => a.order - b.order)
      .slice(-6)
      .map(({ label, value }) => ({ label, value }));
  }, [filteredOrders]);

  const serviceChart = useMemo(() => {
    const services = filteredSummary.topPackages.slice(0, 6);
    const max = Math.max(...services.map((item) => item.revenue), 1);
    return services.map((item, index) => ({
      ...item,
      color: chartColors[index % chartColors.length],
      width: (item.revenue / max) * 100,
    }));
  }, [filteredSummary.topPackages]);

  if (!currentUser) {
    return <div className="container mx-auto px-6 py-20 text-center text-neutral-400">Cargando panel administrativo...</div>;
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Acceso restringido</h1>
        <p className="text-neutral-400 mb-8">Solo los administradores pueden usar esta sección.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const navItems: Array<{ id: AdminTab; label: string }> = [
    { id: "dashboard", label: "Dashboard" },
    { id: "packages", label: "Paquetes" },
    { id: "orders", label: "Órdenes" },
    { id: "users", label: "Usuarios" },
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <MetricCard label="Ventas totales" value={formatCurrency(filteredSummary.totalRevenue)} />
        <MetricCard label="Ticket promedio" value={formatCurrency(filteredSummary.averageOrderValue)} />
        <MetricCard label="Órdenes" value={filteredOrders.length} />
        <MetricCard label="Pendientes" value={filteredSummary.statusBreakdown.pending ?? 0} />
        <MetricCard label="Paquetes" value={filteredPackages.length} />
        <MetricCard label="Conectados" value={filteredOnlineUsers.length} />
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <Panel title="Órdenes recientes">
          <div className="space-y-4">
            {filteredOrders.slice(0, 5).length ? filteredOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">{order.orderNumber || order._id.slice(-8)}</div>
                    <div className="text-sm text-neutral-400">{order.user?.name || order.user?.email || "Cliente"}</div>
                  </div>
                  <div className="text-sm text-neutral-400">{formatDate(order.createdAt)}</div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary capitalize">{order.status}</span>
                  <span className="font-bold text-white">{formatCurrency(order.total)}</span>
                </div>
              </div>
            )) : <EmptyState text="No hay órdenes recientes para mostrar." />}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Servicios que más venden">
            <div className="space-y-4">
              {filteredSummary.topPackages.length ? filteredSummary.topPackages.map((service, index) => (
                <div key={`${service.name}-${index}`} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{service.name}</div>
                      <div className="text-sm text-neutral-400 capitalize">{service.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neutral-400">{service.quantity} vendidos</div>
                      <div className="font-bold text-white">{formatCurrency(service.revenue)}</div>
                    </div>
                  </div>
                </div>
              )) : <EmptyState text="Aún no hay datos de ventas por servicio." />}
            </div>
          </Panel>

          <Panel title="Ventas por mes">
            <div className="space-y-4">
              {monthlyRevenue.length ? monthlyRevenue.map((month, index) => {
                const max = Math.max(...monthlyRevenue.map((item) => item.value), 1);
                const width = (month.value / max) * 100;
                return (
                  <div key={month.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">{month.label}</span>
                      <span className="text-neutral-400">{formatCurrency(month.value)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${width}%`, backgroundColor: chartColors[index % chartColors.length] }}
                      />
                    </div>
                  </div>
                );
              }) : <EmptyState text="No hay ventas para el periodo filtrado." />}
            </div>
          </Panel>

          <Panel title="Servicios más vendidos">
            <div className="space-y-4">
              {serviceChart.length ? serviceChart.map((service) => (
                <div key={service.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">{service.name}</span>
                    <span className="text-neutral-400">{formatCurrency(service.revenue)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${service.width}%`, backgroundColor: service.color }}
                    />
                  </div>
                </div>
              )) : <EmptyState text="No hay servicios para graficar." />}
            </div>
          </Panel>

          <Panel title="Distribución por categoría">
            <div className="space-y-4">
              {filteredSummary.serviceCategories.length ? filteredSummary.serviceCategories.map((category) => (
                <div key={category.category} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white capitalize">{category.category}</div>
                      <div className="text-sm text-neutral-400">{category.orders} órdenes · {category.quantity} servicios</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{formatCurrency(category.revenue)}</div>
                    </div>
                  </div>
                </div>
              )) : <EmptyState text="Sin distribución para mostrar." />}
            </div>
          </Panel>

          <Panel title="Estado de las órdenes">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(filteredSummary.statusBreakdown || {}).map(([status, count]) => (
                <div key={status} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">{status}</div>
                  <div className="mt-2 text-2xl font-black text-white">{count}</div>
                </div>
              ))}
              {!Object.keys(filteredSummary.statusBreakdown || {}).length && <EmptyState text="Sin órdenes para clasificar." />}
            </div>
          </Panel>

          <Panel title="Usuarios conectados">
            <div className="space-y-3">
              {filteredOnlineUsers.length ? filteredOnlineUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                  <div>
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-sm text-neutral-400">{user.email}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-emerald-400 font-semibold">{user.isOnline ? "En línea" : "Activo"}</div>
                    <div className="text-neutral-500">{getFriendlyLastSeen(user.lastSeen)}</div>
                  </div>
                </div>
              )) : <EmptyState text="No hay usuarios conectados ahora mismo." />}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );

  const renderPackages = () => (
    <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
      <Panel title={editingPackageId ? "Editar paquete" : "Nuevo paquete"}>
        <form onSubmit={handlePackageSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">Nombre</label>
            <input value={packageForm.name} onChange={(e) => handlePackageField("name", e.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">Descripción</label>
            <textarea value={packageForm.description} onChange={(e) => handlePackageField("description", e.target.value)} rows={4} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Precio" input={<input type="number" min="0" step="0.01" value={packageForm.price} onChange={(e) => handlePackageField("price", e.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary" />} />
            <Field label="Categoría" input={<select value={packageForm.category} onChange={(e) => handlePackageField("category", e.target.value as PackageFormState["category"])} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary"><option value="exterior">Exteriores</option><option value="studio">Estudio</option><option value="both">Combinado</option></select>} />
            <Field label="Duración" input={<input value={packageForm.duration} onChange={(e) => handlePackageField("duration", e.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary" />} />
            <Field label="Fotos" input={<input type="number" min="0" value={packageForm.photos} onChange={(e) => handlePackageField("photos", e.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary" />} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">Beneficios o características</label>
            <textarea value={packageForm.features} onChange={(e) => handlePackageField("features", e.target.value)} rows={4} placeholder="Uno por línea o separados por coma" className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToggleField checked={packageForm.popular} label="Paquete popular" onToggle={(checked) => handlePackageField("popular", checked)} />
            <ToggleField checked={packageForm.active} label="Paquete activo" onToggle={(checked) => handlePackageField("active", checked)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">Imagen</label>
            <input type="file" accept="image/*" onChange={(e) => {
              setPackageImage(e.target.files?.[0] || null);
              setEditingPackageImageUrl(null);
            }} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-primary-foreground" />
            {(packageImage || editingPackageImageUrl) && (
              <div className="mt-3 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950/50">
                <img
                  key={packageImage?.name || editingPackageImageUrl}
                  src={packageImage ? URL.createObjectURL(packageImage) : getPackageImageUrl(editingPackageImageUrl)}
                  alt="Vista previa"
                  className="w-full h-48 object-contain bg-neutral-900"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <p className="text-[11px] text-neutral-500 text-center py-2">
                  {packageImage ? "Nueva imagen seleccionada" : "Imagen actual"}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={busyId === "package-save"} className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60">
              {busyId === "package-save" ? "Guardando..." : editingPackageId ? "Actualizar paquete" : "Crear paquete"}
            </button>
            {editingPackageId && (
              <button type="button" onClick={resetPackageForm} className="rounded-full border border-neutral-700 px-5 py-3 font-bold text-neutral-300 hover:bg-white/5">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Paquetes existentes">
        <div className="space-y-4">
          {filteredPackages.map((pkg) => (
            <div key={pkg._id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-800 bg-neutral-900">
                  <img
                    src={getPackageImage(pkg)}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] uppercase tracking-widest text-neutral-300">{pkg.category}</span>
                    {pkg.popular && <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-semibold text-amber-300">Popular</span>}
                    {!pkg.active && <span className="rounded-full bg-red-500/15 px-2 py-1 text-[11px] font-semibold text-red-300">Inactivo</span>}
                  </div>
                  <div className="mt-1 text-sm text-neutral-400">{pkg.duration || "Sin duración"} · {pkg.photos ?? 0} fotos</div>
                  <p className="mt-3 text-sm leading-6 text-neutral-300">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white">{formatCurrency(pkg.price)}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => handleEditPackage(pkg)} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                  Editar
                </button>
                <button onClick={() => handleDeletePackage(pkg._id)} disabled={busyId === pkg._id} className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                  {busyId === pkg._id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
          {!filteredPackages.length && <EmptyState text="No hay paquetes para los filtros actuales." />}
        </div>
      </Panel>
    </div>
  );

  const renderOrders = () => (
    <Panel title="Órdenes">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-800 text-[10px] uppercase font-black tracking-widest text-neutral-500">
              <th className="px-4 py-4">Orden</th>
              <th className="px-4 py-4">Cliente</th>
              <th className="px-4 py-4">Paquetes</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Total</th>
              <th className="px-4 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length ? filteredOrders.map((order) => (
              <tr key={order._id} className="border-b border-neutral-900 text-sm text-neutral-300">
                <td className="px-4 py-4">
                  <div className="font-mono text-xs text-neutral-500">{order.orderNumber || order._id.slice(-8)}</div>
                  <div className="font-semibold text-white">{formatDate(order.createdAt)}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-white">{order.user?.name || "Cliente"}</div>
                  <div className="text-xs text-neutral-500">{order.user?.email || "Sin email"}</div>
                </td>
                <td className="px-4 py-4">
                  {order.packages?.map((item, index) => (
                    <div key={index} className="text-sm">
                      {item.name} x{item.quantity || 1}
                    </div>
                  )) || <span className="text-neutral-500">Sin paquetes</span>}
                </td>
                <td className="px-4 py-4">
                  <select value={order.status} onChange={(e) => handleOrderStatus(order._id, e.target.value)} className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none">
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="in_progress">En proceso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </td>
                <td className="px-4 py-4 font-bold text-white">{formatCurrency(order.total)}</td>
                <td className="px-4 py-4">
                  <button onClick={() => handleDeleteOrder(order._id)} disabled={busyId === order._id} className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                    {busyId === order._id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-20 text-center text-neutral-500">
                  No hay órdenes para los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  const renderUsers = () => (
    <Panel title="Usuarios">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-800 text-[10px] uppercase font-black tracking-widest text-neutral-500">
              <th className="px-4 py-4">Usuario</th>
              <th className="px-4 py-4">Rol</th>
              <th className="px-4 py-4">Conectado</th>
              <th className="px-4 py-4">Última actividad</th>
              <th className="px-4 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? filteredUsers.map((user) => (
              <tr key={user._id} className="border-b border-neutral-900 text-sm text-neutral-300">
                <td className="px-4 py-4">
                  <div className="font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-neutral-500">{user.email}</div>
                </td>
                <td className="px-4 py-4">
                  <select value={user.role} onChange={(e) => handleUserRole(user._id, e.target.value as "user" | "admin")} className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none">
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isOnline ? "bg-emerald-500/15 text-emerald-300" : "bg-neutral-800 text-neutral-400"}`}>
                    {user.isOnline ? "En línea" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-neutral-400">
                  {getFriendlyLastSeen(user.lastSeen)}
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => handleDeleteUser(user._id)} disabled={busyId === user._id} className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                    {busyId === user._id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-20 text-center text-neutral-500">
                  No hay usuarios para los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">Panel administrativo</div>
          <h1 className="text-4xl font-black tracking-tight text-white">Administra todo desde un solo lugar</h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Paquetes, órdenes, usuarios conectados y gestión de cuentas en tiempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setActiveTab("dashboard")} className="rounded-full border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm font-bold text-white hover:bg-neutral-800">
            Vista general
          </button>
          <button onClick={() => setActiveTab("packages")} className="rounded-full border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm font-bold text-white hover:bg-neutral-800">
            Nuevo servicio
          </button>
          <button onClick={loadData} className="rounded-full border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm font-bold text-white hover:bg-neutral-800">
            Actualizar
          </button>
          <button onClick={logout} className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">
            Salir
          </button>
          <Link href="/" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            Ver sitio
          </Link>
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900/60 p-5">
        {loadWarning && (
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {loadWarning}
          </div>
        )}
        <div className="grid gap-4 xl:grid-cols-[1.6fr_0.7fr_0.7fr]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">Búsqueda rápida</label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios, órdenes, paquetes..."
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const from = new Date(today);
              from.setDate(today.getDate() - 30);
              setFromDate(from.toISOString().slice(0, 10));
              setToDate(today.toISOString().slice(0, 10));
            }}
            className="rounded-full border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
          >
            Últimos 30 días
          </button>
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSearchTerm("");
            }}
            className="rounded-full border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
          >
            Limpiar filtros
          </button>
          <div className="text-sm text-neutral-500 self-center">
            {filteredOrders.length} órdenes visibles · {filteredPackages.length} paquetes visibles · {filteredUsers.length} usuarios visibles
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-4">
          <Panel title="Secciones">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-neutral-950 text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Estado actual">
            <div className="space-y-3 text-sm">
              <StatLine label="Administrador" value={currentUser.name} />
              <StatLine label="Correo" value={currentUser.email} />
            </div>
          </Panel>
        </aside>

        <main className="space-y-8">
          {loading ? (
            <Panel title="Cargando">
              <div className="py-12 text-center text-neutral-400">Cargando datos del panel administrativo...</div>
            </Panel>
          ) : (
            <>
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "packages" && renderPackages()}
              {activeTab === "orders" && renderOrders()}
              {activeTab === "users" && renderUsers()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900/60 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)]">
      <h2 className="mb-5 text-xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-3">{label}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/50 p-6 text-center text-neutral-500">{text}</div>;
}

function Field({ label, input }: { label: string; input: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-neutral-300">{label}</label>
      {input}
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-white text-right">{value}</span>
    </div>
  );
}

function ToggleField({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!checked)}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
        checked ? "border-primary bg-primary/10 text-white" : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:bg-white/5"
      }`}
    >
      <span>{label}</span>
      <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.3em] ${checked ? "bg-primary text-primary-foreground" : "bg-neutral-800 text-neutral-400"}`}>
        {checked ? "Sí" : "No"}
      </span>
    </button>
  );
}
