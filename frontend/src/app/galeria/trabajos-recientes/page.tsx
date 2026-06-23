"use client";

import Link from "next/link";
import { useGalleryPhotos } from "@/hooks/useGalleryPhotos";
import ExpandCards from "@/components/ui/expand-cards";

export default function TrabajosRecientesPage() {
  const { photos, loading, error } = useGalleryPhotos();

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              Nuestros Trabajos
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Galería de <span className="text-primary italic">trabajos</span> recientes
            </h1>
            <p className="text-lg text-neutral-300 max-w-xl">
              Explora nuestra selección de las mejores sesiones fotográficas. Cada imagen cuenta una historia única.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container mx-auto px-6">
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center bg-neutral-900 rounded-3xl border border-neutral-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-neutral-400">Cargando galería...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-64 flex items-center justify-center bg-neutral-900 rounded-3xl border border-red-500/20">
            <div className="text-center">
              <p className="text-red-400 mb-2">Error al cargar la galería</p>
              <p className="text-neutral-500 text-sm">{error}</p>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="w-full h-64 flex items-center justify-center bg-neutral-900 rounded-3xl border border-neutral-800">
            <div className="text-center">
              <p className="text-neutral-400 mb-2">No hay fotos en la galería</p>
              <p className="text-neutral-500 text-sm">
                Las fotos aparecerán aquí cuando se agreguen desde el panel de administración.
              </p>
            </div>
          </div>
        ) : (
          <ExpandCards images={photos} />
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6">
        <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Te gusta lo que ves?
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-8">
            Reserva tu sesión fotográfica y obtén resultados como estos. Calidad profesional garantizada.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/paquetes"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform"
            >
              Ver Paquetes
            </Link>
            <Link
              href="/contacto"
              className="px-8 py-4 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all"
            >
              Contactar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
