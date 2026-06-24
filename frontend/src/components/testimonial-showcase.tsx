'use client';

import { useEffect, useState } from 'react';
import { MasonryGrid } from '@/components/ui/image-testimonial-grid';

const testimonials = [
  {
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'María Fernández',
    feedback: 'Mi sesión de quinceañera quedó espectacular, superó todas mis expectativas.',
    mainImage: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&h=1100&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Carlos Pérez',
    feedback: 'Capturaron cada momento de nuestra boda con una calidez increíble.',
    mainImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&h=1300&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Ana Gómez',
    feedback: 'Fotos corporativas profesionales, justo lo que necesitaba mi marca.',
    mainImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/men/56.jpg',
    name: 'Roberto Díaz',
    feedback: 'Una sesión familiar inolvidable, muy atentos con los niños.',
    mainImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/21.jpg',
    name: 'Lucía Torres',
    feedback: 'El estudio está increíblemente equipado y el equipo es muy profesional.',
    mainImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=800&h=1000&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/men/78.jpg',
    name: 'Diego Morales',
    feedback: 'La edición premium dejó mis fotos con un acabado impecable.',
    mainImage: 'https://images.unsplash.com/photo-1492288991661-058aa541ff43?auto=format&fit=crop&w=800&h=1100&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/11.jpg',
    name: 'Valentina Ruiz',
    feedback: 'La atención VIP fue real, siempre me respondieron rápido.',
    mainImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/men/21.jpg',
    name: 'Andrés Castillo',
    feedback: 'Recomiendo 100% el servicio, vale cada centavo invertido.',
    mainImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&h=1000&q=80',
  },
];

function TestimonialCard({ profileImage, name, feedback, mainImage }: (typeof testimonials)[0]) {
  return (
    <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 ease-in-out hover:scale-105">
      <img
        src={mainImage}
        alt={feedback}
        className="w-full h-auto object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/800x600/1a1a1a/ffffff?text=PhotoStore';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
      <div className="absolute top-0 left-0 p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={profileImage}
            className="w-8 h-8 rounded-full border-2 border-white/80"
            alt={name}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/40x40/EFEFEF/333333?text=P';
            }}
          />
          <span className="font-semibold text-sm drop-shadow-md">{name}</span>
        </div>
        <p className="text-sm font-medium leading-tight drop-shadow-md">{feedback}</p>
      </div>
    </div>
  );
}

function getColumns(width: number) {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  if (width < 1280) return 3;
  return 4;
}

export function TestimonialShowcase() {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const handleResize = () => setColumns(getColumns(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
          Clientes felices
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Lo que dicen de nosotros</h2>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Historias reales de quienes ya confiaron su momento más importante a nuestro equipo.
        </p>
      </div>
      <MasonryGrid columns={columns} gap={4}>
        {testimonials.map((card, index) => (
          <TestimonialCard key={index} {...card} />
        ))}
      </MasonryGrid>
    </section>
  );
}
