import Link from "next/link";
import { Camera, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Camera size={36} />
        </div>
        <div className="text-7xl font-black text-primary/20 mb-2">404</div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">No encontramos esta toma</h1>
        <p className="text-neutral-400 mb-8">
          La página que buscas no existe o fue movida. Volvamos a un lugar conocido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform"
        >
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
