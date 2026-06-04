'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addToCart, formatCurrency, getPackageImage, getPackageKey, Package } from '@/lib/helpers';

const FALLBACK_IMG = '/imagen/pic1.jpeg';

interface PackageCardProps {
  pkg: Package;
  onAddToCart?: (pkg: Package) => void;
}

const packageAccent: Record<string, string> = {
  bronce: 'from-amber-500/80 to-orange-700/25 ring-amber-400/20',
  plata: 'from-slate-400/80 to-slate-700/25 ring-slate-400/20',
  oro: 'from-amber-400/80 to-yellow-700/25 ring-yellow-400/20',
  diamante: 'from-cyan-400/80 to-slate-950/25 ring-cyan-400/20',
  vip: 'from-fuchsia-500/80 to-violet-900/25 ring-fuchsia-400/20',
  premium: 'from-sky-500/80 to-indigo-950/25 ring-sky-400/20',
  default: 'from-sky-500/80 to-indigo-950/20 ring-primary/20',
};

const getPackageAccent = (pkg: Package): string => packageAccent[getPackageKey(pkg)] ?? packageAccent.default;

export function PackageCard({ pkg, onAddToCart }: PackageCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const imageUrl = imgError ? FALLBACK_IMG : getPackageImage(pkg);
  const accent = getPackageAccent(pkg);
  const packageDetails = pkg.details ?? pkg.features ?? [];

  const handleAddToCart = () => {
    addToCart(pkg);
    onAddToCart?.(pkg);
  };

  const handleCheckout = () => {
    addToCart(pkg);
    onAddToCart?.(pkg);
    router.push('/checkout');
  };

  return (
    <div className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#050816]/90 via-[#07101f]/90 to-[#08111f] shadow-[0_30px_80px_-45px_rgba(59,130,246,0.75)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_-35px_rgba(79,70,229,0.55)] ring-1 ring-white/5 ${accent}`}>
      <div className="relative overflow-hidden h-60 bg-neutral-900">
        <img
          src={imageUrl}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
          {pkg.category ? pkg.category : 'Premium'}
        </div>
      </div>

      <div className="p-6 bg-neutral-950/85 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">{pkg.name}</h3>
            <div className="mt-2 text-sm text-neutral-400">
              {pkg.duration ?? 'Estudio'}{pkg.photos ? ` · ${pkg.photos} fotos` : ''}
            </div>
          </div>
          <div className="rounded-3xl bg-white/5 px-3 py-1 text-sm font-semibold text-primary ring-1 ring-primary/10">
            {pkg.category ? pkg.category.toUpperCase() : 'PREMIUM'}
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-neutral-400 min-h-[3.5rem]">{pkg.description}</p>

        {packageDetails.length > 0 && (
          <ul className="mt-5 space-y-3">
            {packageDetails.slice(0, 4).map((detail, i) => (
              <li key={i} className="flex gap-3 text-sm text-neutral-300">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">✓</span>
                <span>{detail}</span>
              </li>
            ))}
            {packageDetails.length > 4 && (
              <li className="text-sm text-primary font-semibold">+{packageDetails.length - 4} beneficios más</li>
            )}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.25em] text-neutral-500">Precio</div>
            <div className="text-3xl font-black text-white">{formatCurrency(pkg.price)}</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-white/10"
            >
              Agregar
            </button>
            <button
              onClick={handleCheckout}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition duration-300 hover:bg-primary/90"
            >
              Pagar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
