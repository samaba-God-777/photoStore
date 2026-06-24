'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PackageCard } from '@/components/package-card';
import { CompanyPolicyCard } from '@/components/company-policy-card';
import { SiteSections } from '@/components/site-sections';
import { SparklesCore } from '@/components/ui/sparkles';
import { apiGetPackages } from '@/lib/api';
import { addToast } from '@/components/toast';
import { Package } from '@/lib/helpers';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { GalleryPhoto } from '@/services/galleryService';
import { PackageCardSkeleton, GalleryPhotoSkeleton } from '@/components/ui/skeleton';
import { Leaf, Clapperboard, Sparkles, Palette, MapPin, Smartphone, Mail, Clock, X } from 'lucide-react';

const FALLBACK_PACKAGES: Package[] = [
  {
    _id: '000000000000000000000001',
    name: 'Paquete Bronce',
    description: 'Ideal para sesiones individuales en exteriores con edición básica.',
    price: 75,
    category: 'exterior',
    duration: '1 hora',
    photos: 15,
    details: ['15 fotos editadas', 'Sesión en exteriores', 'Galería digital', 'Descarga en alta resolución'],
  },
  {
    _id: '000000000000000000000002',
    name: 'Paquete Plata',
    description: 'Sesión en estudio o exteriores con retoque profesional incluido.',
    price: 120,
    category: 'studio',
    duration: '1.5 horas',
    photos: 25,
    details: ['25 fotos editadas', 'Estudio o exteriores', 'Retoque profesional', 'Galería digital HD', '2 cambios de ropa'],
  },
  {
    _id: '000000000000000000000003',
    name: 'Paquete Oro',
    description: 'Experiencia completa con múltiples locaciones y sesión extendida.',
    price: 200,
    category: 'both',
    duration: '3 horas',
    photos: 45,
    details: ['45 fotos editadas', 'Múltiples locaciones', 'Maquillaje incluido', 'Galería privada online', 'Álbum digital'],
  },
  {
    _id: '000000000000000000000004',
    name: 'Paquete Diamante',
    description: 'El máximo nivel de calidad con edición cinematográfica premium.',
    price: 350,
    category: 'both',
    duration: '5 horas',
    photos: 80,
    details: ['80 fotos editadas', 'Sesión full day', 'Maquillaje y peinado', 'Video highlight 60s', 'Impresiones incluidas'],
  },
  {
    _id: '000000000000000000000005',
    name: 'Paquete VIP',
    description: 'Experiencia exclusiva con atención personalizada y entrega prioritaria.',
    price: 500,
    category: 'studio',
    duration: '6 horas',
    photos: 120,
    details: ['120 fotos editadas', 'Estudio privado', 'Equipo de 2 fotógrafos', 'Álbum físico premium', 'Entrega en 48h'],
  },
  {
    _id: '000000000000000000000006',
    name: 'Paquete Premium',
    description: 'Todo incluido: sesión, maquillaje, impresiones y álbum de lujo.',
    price: 750,
    category: 'both',
    duration: 'Full day',
    photos: 150,
    details: ['150 fotos editadas', 'Múltiples sets', 'Maquillaje artístico', 'Álbum de lujo 30x30', 'Marco de regalo incluido'],
  },
];

export default function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { photos: galleryPhotos, loading: galleryLoading } = useGalleryPhotos();
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await apiGetPackages();
        const pkgs = data.data || data;
        setPackages(pkgs);
        setFilteredPackages(pkgs);
      } catch {
        // Backend no disponible — usar paquetes locales de muestra
        setPackages(FALLBACK_PACKAGES);
        setFilteredPackages(FALLBACK_PACKAGES);
        addToast('Mostrando paquetes de ejemplo', 'info');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (!category) {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(packages.filter(p => p.category === category));
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0">
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
            speed={1}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Fotografía Profesional en Panamá
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-center text-white mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300">
              Captura momentos <span className="text-primary italic">únicos</span> con arte y elegancia
            </h1>
            <p className="text-lg text-neutral-200 mb-10 max-w-xl leading-relaxed">
              Sesiones fotográficas de nivel cinematográfico en estudio y exteriores. Cada foto cuenta tu historia con la calidad que mereces.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#paquetes"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20 cursor-pointer"
              >
                Ver Paquetes
              </Link>
              <Link
                href="#nosotros"
                className="px-8 py-4 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all cursor-pointer"
              >
                Conocer más
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap gap-8 sm:gap-12 border-t border-white/10 pt-8">
              {[
                { num: '500+', label: 'Sesiones realizadas' },
                { num: '98%', label: 'Clientes satisfechos' },
                { num: '8', label: 'Años de experiencia' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.num}</div>
                  <div className="text-xs sm:text-sm text-neutral-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteSections />

      {/* ===== CATEGORÍAS ===== */}
      <section className="py-12 border-t border-b border-neutral-800 bg-neutral-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { Icon: Leaf, title: 'Exteriores', desc: 'Luz natural, locaciones únicas' },
              { Icon: Clapperboard, title: 'Estudio', desc: 'Fondos profesionales' },
              { Icon: Sparkles, title: 'Combinaciones', desc: 'Lo mejor de ambos mundos' },
              { Icon: Palette, title: 'Edición Premium', desc: 'Retoque profesional' },
            ].map((cat, i) => (
              <div key={i} className="text-center p-4">
                <cat.Icon className="mx-auto mb-2 text-primary" size={32} />
                <h3 className="font-bold text-sm md:text-base mb-1">{cat.title}</h3>
                <p className="text-xs md:text-sm text-neutral-400">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALERÍA DE TRABAJOS ===== */}
      {(galleryLoading || galleryPhotos.length > 0) && (
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
              Nuestro Trabajo
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Galería de Trabajos</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Algunas de nuestras sesiones más recientes.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryLoading ? (
              Array.from({ length: 8 }).map((_, i) => <GalleryPhotoSkeleton key={i} />)
            ) : (
              galleryPhotos.slice(0, 8).map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo)}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-zoom-in"
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.title || 'Trabajo de fotografía'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {photo.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-bold">{photo.title}</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
          {!galleryLoading && (
            <div className="text-center mt-8">
              <Link
                href="/galeria/trabajos-recientes"
                className="inline-block px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-bold transition"
              >
                Ver galería completa
              </Link>
            </div>
          )}
        </section>
      )}

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-4xl max-h-[85vh] aspect-auto">
            <Image
              src={lightboxPhoto.image_url}
              alt={lightboxPhoto.title || 'Trabajo de fotografía'}
              width={1200}
              height={900}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {lightboxPhoto.title && (
              <p className="text-center text-white font-bold mt-4">{lightboxPhoto.title}</p>
            )}
          </div>
        </div>
      )}

      {/* ===== PAQUETES ===== */}
      <section id="paquetes" className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
            Nuestros Servicios
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Paquetes de Fotografía</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Selecciona el paquete que mejor se adapte a tus necesidades y presupuesto.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {[
            { label: 'Todos', value: '' },
            { label: 'Estudio', value: 'studio' },
            { label: 'Exteriores', value: 'exterior' },
            { label: 'Combinados', value: 'both' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleCategoryFilter(filter.value)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                selectedCategory === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg) => <PackageCard key={pkg._id} pkg={pkg} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-neutral-400">No hay paquetes disponibles en esta categoría.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===== POLÍTICA PREMIUM ===== */}
      <section className="container mx-auto px-6">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] items-start py-16">
          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)]">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.3em] mb-6">
              Exclusivo para ti
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Confianza y claridad en cada reserva
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-6">
              Nuestra política empresarial está diseñada para ofrecer una experiencia premium desde el primer contacto. Reserva con anticipo, asegura tu fecha y recibe un servicio profesional enfocado en calidad, seguridad y atención personalizada.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Reserva segura', desc: 'Prioridad en agenda y confirmación garantizada.' },
                { title: 'Entrega profesional', desc: 'Galería digital lista para compartir y descarga.' },
                { title: 'Cambio flexible', desc: 'Coordinamos tus ajustes según disponibilidad.' },
                { title: 'Atención VIP', desc: 'Comunicación directa con el equipo de fotografía.' },
              ].map((item, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm text-primary font-bold uppercase tracking-[0.25em] mb-2">{item.title}</div>
                  <p className="text-neutral-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <CompanyPolicyCard />
        </div>
      </section>

      {/* ===== NOSOTROS ===== */}
      <section id="nosotros" className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
              Nuestra Historia
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Arte y pasión detrás de cada imagen
            </h2>
            <p className="text-neutral-400 mb-4 leading-relaxed">
              Somos un equipo de fotógrafos profesionales con más de 8 años de experiencia capturando los momentos más importantes de la vida. Nos especializamos en fotografía de retratos, quinceañeras, corporativa y lifestyle.
            </p>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              Ubicados en Metetí, Darién, contamos con un estudio completamente equipado y trabajamos en las locaciones más bellas del país.
            </p>
            <div className="flex gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-primary">8+</div>
                <div className="text-sm text-neutral-400">Años de experiencia</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-neutral-400">Paquetes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-neutral-400">Clientes felices</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600"
              alt="Estudio"
              width={600}
              height={384}
              className="rounded-lg w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 translate-y-8 -translate-x-8 bg-primary text-primary-foreground p-4 rounded-lg font-bold">
              <div className="text-2xl">98%</div>
              <div className="text-xs">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESO ===== */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
            ¿Cómo funciona?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">Tu sesión en 4 pasos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { num: '1', title: 'Elige tu paquete', desc: 'Selecciona el paquete que más se adapta a lo que buscas.' },
            { num: '2', title: 'Realiza tu pago', desc: 'Paga fácil y rápido por Yappy o en efectivo en nuestro estudio.' },
            { num: '3', title: 'Agenda tu sesión', desc: 'Te contactamos para agendar la fecha y hora de tu sesión.' },
            { num: '4', title: 'Recibe tus fotos', desc: 'Entregamos tus imágenes editadas en el tiempo acordado.' },
          ].map((step, i) => (
            <div key={i} className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
                {step.num}
              </div>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CONTACTO ===== */}
      <section id="contacto" className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
              Contacto
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Tienes preguntas?</h2>
            <p className="text-neutral-400 mb-8">
              Estamos aquí para ayudarte a planificar la sesión perfecta.
            </p>

            <div className="space-y-6">
              {[
                { Icon: MapPin, title: 'Ubicación', text: 'Metetí, Darién, Panamá' },
                { Icon: Smartphone, title: 'Teléfono / Yappy', text: '+507 6664-7343' },
                { Icon: Mail, title: 'Email', text: 'info@photostudio.com' },
                { Icon: Clock, title: 'Horario', text: 'Lun — Sáb: 9:00am — 6:00pm' },
              ].map((contact, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                    <contact.Icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{contact.title}</div>
                    <div className="text-neutral-400 text-sm">{contact.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Envíanos un mensaje</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Mensaje</label>
                <textarea
                  placeholder="Tu mensaje..."
                  rows={4}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-primary outline-none transition resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-transform"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
// build cache buster 1782261535
