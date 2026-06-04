'use client';

import Link from 'next/link';
import { siteNavigation } from '@/components/site-navigation';

export function SiteSections() {
  return (
    <section className="container mx-auto px-6">
      <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-6 md:p-8 shadow-[0_30px_90px_-60px_rgba(59,130,246,0.45)]">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Accesos rápidos
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-black text-white">Todo lo importante en un solo lugar</h2>
            <p className="mt-3 max-w-2xl text-neutral-400">
              Usa estas secciones para navegar entre servicios, paquetes, galería, empresa, legal y tu cuenta.
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            Fotografía profesional, control de cliente y reservas más claras.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {siteNavigation.map((group) => (
            <div key={group.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">{group.name}</h3>
              <div className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group block rounded-2xl border border-white/5 bg-neutral-950/70 px-4 py-3 transition hover:border-primary/40 hover:bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white group-hover:text-primary transition-colors">{link.name}</div>
                        {link.description && <div className="mt-1 text-sm text-neutral-400">{link.description}</div>}
                      </div>
                      <span className="text-neutral-500 transition group-hover:translate-x-1 group-hover:text-primary">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
