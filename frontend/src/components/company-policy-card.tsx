'use client';

import Image from 'next/image';

export function CompanyPolicyCard() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#02040a] via-[#07101f] to-[#0b1320] p-6 shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)]">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950/50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <Image
          src="/imagen/WhatsApp%20Image%202026-04-22%20at%2018.12.15.jpeg"
          alt="Política Empresarial"
          width={1200}
          height={640}
          className="h-64 w-full object-cover filter brightness-90 transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-black/70 p-4 text-sm text-white shadow-xl shadow-black/30">
          <p className="font-bold text-lg">Política exclusiva de la empresa</p>
          <p className="mt-2 text-neutral-300">
            Reservas con abono garantizan tu sesión. Pago final al finalizar. Cambios sujetos a disponibilidad.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Compromiso Premium</h2>
        <p className="text-neutral-400">Nuestra política está diseñada para ofrecerte seguridad en cada sesión y garantizar resultados profesionales.</p>

        <ul className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-neutral-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">1</span>
            Anticipo no reembolsable asegura tu reserva y la prioridad en la agenda.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">2</span>
            Entrega de galería descargable sin límite para paquetes premium.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">3</span>
            Cambios de fecha y ajustes se coordinan directamente con el equipo.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">4</span>
            Transparencia total en el servicio para que tu experiencia sea 100% premium.
          </li>
        </ul>
      </div>
    </div>
  );
}
