'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sitePages, type SitePageContent } from '@/components/site-page-data';

type PageAction = { label: string; href: string; variant?: 'primary' | 'secondary' };
type GalleryImage = { src: string; alt: string; badge?: 'popular' | 'nuevo' };

const heroImages: Record<string, { src: string; alt: string }> = {
  '/servicios/retratos': {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1200',
    alt: 'Retrato profesional en estudio',
  },
  '/servicios/eventos': {
    src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    alt: 'Cobertura de evento profesional',
  },
  '/servicios/bodas': {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    alt: 'Fotografía de boda elegante',
  },
  '/paquetes/estandar': {
    src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
    alt: 'Paquete estándar fotográfico',
  },
  '/paquetes/premium': {
    src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200&sat=-25',
    alt: 'Paquete premium fotográfico',
  },
  '/paquetes/personalizado': {
    src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&q=80&w=1200',
    alt: 'Servicio fotográfico personalizado',
  },
  '/galeria/trabajos-recientes': {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200',
    alt: 'Trabajos recientes de fotografía',
  },
  '/portfolio': {
    src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1200',
    alt: 'Portfolio fotográfico curado',
  },
  '/exhibiciones': {
    src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200&sat=-40',
    alt: 'Exhibiciones fotográficas',
  },
  '/empresa/quienes-somos': {
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=1200',
    alt: 'Equipo de fotografía',
  },
  '/contacto': {
    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
    alt: 'Contacto con el estudio',
  },
  '/legal/politica-de-privacidad': {
    src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200',
    alt: 'Privacidad y seguridad digital',
  },
  '/legal/terminos-del-servicio': {
    src: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1200',
    alt: 'Términos y acuerdo de servicio',
  },
  '/legal/politica-de-cookies': {
    src: 'https://images.unsplash.com/photo-1519336555923-59661f41bb53?auto=format&fit=crop&q=80&w=1200',
    alt: 'Cookies y experiencia del usuario',
  },
  '/cuenta': {
    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
    alt: 'Acceso a la cuenta del cliente',
  },
};

const actionSets: Record<string, PageAction[]> = {
  service: [
    { label: 'Reservar sesión', href: '/checkout', variant: 'primary' },
    { label: 'Ver paquetes', href: '/#paquetes', variant: 'secondary' },
  ],
  package: [
    { label: 'Ir al checkout', href: '/checkout', variant: 'primary' },
    { label: 'Personalizar', href: '/paquetes/personalizado', variant: 'secondary' },
  ],
  gallery: [
    { label: 'Reservar ahora', href: '/checkout', variant: 'primary' },
    { label: 'Ver servicios', href: '/#paquetes', variant: 'secondary' },
  ],
  company: [
    { label: 'Contactar', href: '/contacto', variant: 'primary' },
    { label: 'Ver paquetes', href: '/#paquetes', variant: 'secondary' },
  ],
  legal: [
    { label: 'Volver al inicio', href: '/', variant: 'primary' },
    { label: 'Ver paquetes', href: '/#paquetes', variant: 'secondary' },
  ],
  account: [
    { label: 'Iniciar sesión', href: '/login', variant: 'primary' },
    { label: 'Registrarse', href: '/login?mode=register', variant: 'secondary' },
  ],
};

const CONTACT_PHONE = '+50766647343';
const CONTACT_WHATSAPP = `https://wa.me/${CONTACT_PHONE.replace(/\D/g, '')}`;

function SectionCard({ title, body, bullets }: { title: string; body: string; bullets?: string[] }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-300">{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-neutral-300">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary">
                ✓
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryCarousel({
  images,
  onOpen,
}: {
  images: Array<GalleryImage>;
  onOpen: (index: number) => void;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4600);

    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950/70">
      <div className="relative h-[24rem] overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((image, index) => (
            <button
              key={image.alt}
              type="button"
              onClick={() => onOpen(index)}
              className="relative h-full w-full shrink-0 cursor-zoom-in"
            >
              <Image src={image.src} alt={image.alt} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              {image.badge && (
                <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur">
                  {image.badge === 'popular' ? 'Popular' : 'Nuevo'}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                <div className="text-sm font-semibold text-white">{image.alt}</div>
              </div>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCurrent((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-white backdrop-blur transition hover:bg-black/70"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-white backdrop-blur transition hover:bg-black/70"
        >
          ›
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-300">
          <span>Avance</span>
          <span>{current + 1}/{images.length}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${((current + 1) / images.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const getPageActions = (path: keyof typeof sitePages): PageAction[] => {
  if (path.startsWith('/servicios/')) return actionSets.service;
  if (path.startsWith('/paquetes/')) return actionSets.package;
  if (path.startsWith('/galeria/') || path === '/portfolio' || path === '/exhibiciones') return actionSets.gallery;
  if (path.startsWith('/empresa/') || path === '/contacto') return actionSets.company;
  if (path.startsWith('/legal/')) return actionSets.legal;
  if (path === '/cuenta') return actionSets.account;
  return actionSets.company;
};

export function MarketingPage({ content, path }: { content: SitePageContent; path: keyof typeof sitePages }) {
  const image = heroImages[path];
  const actions = getPageActions(path);
  const gallery: GalleryImage[] = content.gallery ?? [
    { src: image?.src || heroImages['/cuenta'].src, alt: `${content.title} 1` },
    { src: image?.src || heroImages['/cuenta'].src, alt: `${content.title} 2` },
    { src: image?.src || heroImages['/cuenta'].src, alt: `${content.title} 3` },
  ];
  const [lightbox, setLightbox] = useState<{ images: GalleryImage[]; index: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const canCall = CONTACT_PHONE;
  const openLightbox = (images: GalleryImage[], index: number) => {
    const safeIndex = Math.max(0, Math.min(index, images.length - 1));
    setLightbox({ images, index: safeIndex });
    setIsOpen(true);
  };
  const currentLightboxImage = lightbox ? lightbox.images[lightbox.index] : null;
  const modalImages = lightbox?.images ?? gallery.slice(0, 6);

  return (
    <div className="container mx-auto px-6 py-16">
      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 shadow-[0_30px_90px_-60px_rgba(59,130,246,0.55)] animate-fadeIn">
          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-primary" style={{ animationDelay: '80ms' }}>
            {content.eyebrow}
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight text-white" style={{ animationDelay: '140ms' }}>{content.title}</h1>
          <p className="mt-5 max-w-2xl text-neutral-400 leading-relaxed" style={{ animationDelay: '180ms' }}>{content.intro}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {content.highlights.map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-neutral-200 animate-fadeIn" style={{ animationDelay: `${220 + index * 70}ms` }}>
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`rounded-full px-6 py-3 font-bold transition hover:scale-[1.02] ${
                  action.variant === 'primary'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-neutral-700 bg-neutral-900 text-white hover:bg-white/5'
                }`}
              >
                {action.label}
              </Link>
            ))}
            <a
              href={CONTACT_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-bold text-emerald-200 transition hover:bg-emerald-500/20 hover:scale-[1.02]"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${canCall}`}
              className="rounded-full border border-neutral-700 bg-neutral-900 px-6 py-3 font-bold text-white transition hover:bg-white/5 hover:scale-[1.02]"
            >
              Llamar
            </a>
            <Link href={content.cta.href} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:scale-[1.02]">
              {content.cta.label}
            </Link>
          </div>
        </div>

        <aside className="space-y-4 animate-fadeIn" style={{ animationDelay: '140ms' }}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-60px_rgba(59,130,246,0.35)]">
            <div className="relative h-72">
              <Image
                src={image?.src || heroImages['/cuenta'].src}
                alt={image?.alt || content.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur">
                  Reserva y visualiza
                </div>
                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-200">
                  Página diseñada para ayudarte a entender el servicio y darte una acción clara para seguir con tu reserva.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-neutral-950/80 to-neutral-900/70 p-6">
            <h2 className="text-xl font-bold text-white">Resumen rápido</h2>
            <div className="mt-5 space-y-3">
              {content.stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                  <span className="text-sm text-neutral-400">{stat.label}</span>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6 text-sm text-neutral-200">
            <p className="font-semibold text-white">¿Quieres hablar con nosotros?</p>
            <p className="mt-2 leading-6 text-neutral-300">
              Si esta página te ayudó, puedes volver a la portada o entrar al flujo de reserva cuando quieras.
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {content.sections.map((section, index) => (
          <div key={section.title} className="animate-fadeIn" style={{ animationDelay: `${index * 90}ms` }}>
            <SectionCard title={section.title} body={section.body} bullets={section.bullets} />
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-neutral-950/70 p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Galería real
            </div>
            <h2 className="mt-4 text-3xl font-black text-white">Imágenes seleccionadas de esta sección</h2>
          </div>
          <div className="text-sm text-neutral-500">Tres referencias visuales para ayudarte a decidir más rápido.</div>
        </div>
        <div className="mt-6">
          <GalleryCarousel images={gallery.slice(0, 6)} onOpen={(index) => openLightbox(gallery.slice(0, 6), index)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {gallery.slice(0, 3).map((item, index) => (
            <button
              key={`${item.alt}-${index}`}
              type="button"
              onClick={() => openLightbox(gallery.slice(0, 6), index)}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 text-left animate-fadeIn"
              style={{ animationDelay: `${120 + index * 70}ms` }}
            >
              <div className="relative h-56">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                {item.badge && (
                  <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur">
                    {item.badge === 'popular' ? 'Popular' : 'Nuevo'}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-sm font-semibold text-white">{item.alt}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {isOpen && lightbox && currentLightboxImage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            aria-label="Cerrar modal"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-50px_rgba(59,130,246,0.65)]">
            <div className="relative h-[70vh] w-[min(95vw,1200px)]">
              <Image src={currentLightboxImage.src} alt={currentLightboxImage.alt} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {currentLightboxImage.badge && (
                <div className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur">
                  {currentLightboxImage.badge === 'popular' ? 'Popular' : 'Nuevo'}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-primary">Vista ampliada</div>
                <div className="mt-1 font-semibold text-white">{currentLightboxImage.alt}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                {modalImages.map((item, index) => (
                  <button
                    key={`${item.alt}-${index}`}
                    type="button"
                    onClick={() => setLightbox((prev) => (prev ? { ...prev, index } : prev))}
                    className={`group relative overflow-hidden rounded-2xl border transition ${
                      index === lightbox.index ? 'border-primary ring-2 ring-primary/40' : 'border-white/10'
                    }`}
                  >
                    <div className="relative h-20">
                      <Image src={item.src} alt={item.alt} fill className="object-cover transition group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setLightbox((prev) => (prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev))}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev))}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Siguiente
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function renderMarketingPage(path: keyof typeof sitePages) {
  return <MarketingPage content={sitePages[path]} path={path} />;
}
