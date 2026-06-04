"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { DIcons } from "dicons";
import { ShoppingCart } from "lucide-react";
import { getCart, getToken, logout, User } from "@/lib/helpers";

const getUserSnapshot = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("ps_user");
};

const parseUserSnapshot = (snapshot: string | null): User | null => {
  if (!snapshot) return null;
  try {
    return JSON.parse(snapshot) as User;
  } catch {
    return null;
  }
};

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
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
    () => null
  );
  const user = parseUserSnapshot(userSnapshot);
  const isAuth = !!getToken() && !!user;
  // Lazy initializers run only on client — safe for localStorage access
  const [cartCount, setCartCount] = useState<number>(() =>
    typeof window !== "undefined" ? getCart().length : 0
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onCartUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail;
      setCartCount(detail.count);
    };
    window.addEventListener("cart-updated", onCartUpdated);
    return () => window.removeEventListener("cart-updated", onCartUpdated);
  }, []);

  const handleLogout = () => logout();

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Paquetes", href: "/#paquetes" },
    { name: "Nosotros", href: "/#nosotros" },
    { name: "Contacto", href: "/#contacto" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/80 backdrop-blur-md py-4 border-b border-white/5"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">
            📸
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            OLMEDO <span className="text-primary font-serif italic">Fotografía</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                pathname === link.href ? "text-primary" : "text-neutral-400 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-2 text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuth ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3 py-1 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded transition"
              >
                Dashboard
              </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-3 py-1 text-sm bg-amber-600 hover:bg-amber-700 rounded transition"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-neutral-400">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:block px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Entrar
            </Link>
          )}

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <DIcons.X className="w-6 h-6" />
            ) : (
              <DIcons.Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-t border-white/5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block py-3 px-6 hover:bg-white/5 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {isAuth ? (
            <>
              <div className="px-6 py-3 text-sm text-neutral-400">
                Usuario: {user?.name}
              </div>
              <Link
                href="/dashboard"
                className="block py-3 px-6 hover:bg-white/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="block py-3 px-6 hover:bg-white/5 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Panel Admin
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left py-3 px-6 hover:bg-red-600/10 text-red-400 transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block py-3 px-6 bg-primary text-primary-foreground rounded mt-2 mx-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Entrar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
