"use client";

import Image from "next/image";
import Link from "next/link";
import { DIcons } from "dicons";
import ThemeToggle from "@/components/ui/footer";
import { siteNavigation } from "@/components/site-navigation";

const Underline = `hover:-translate-y-1 border border-dotted rounded-xl p-2.5 transition-all duration-300 hover:shadow-lg hover:border-solid hover:bg-muted/50 `;

export default function Footer() {
  return (
    <footer className="border-t border-muted/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-10 p-10 pb-0 md:flex">
        <div className="flex flex-col items-center md:items-start gap-6 flex-1">
          <Link href="/">
            <div className="flex items-center justify-center rounded-full bg-primary/10 p-3 hover:scale-110 transition-transform">
              <DIcons.Designali className="w-10 h-10 text-primary" />
            </div>
          </Link>
          <p className="bg-transparent text-center text-sm leading-6 text-muted-foreground md:text-left max-w-xl">
            Bienvenido a PhotoStore, donde la creatividad y la estrategia se
            combinan para dar vida a tu visión. Nos apasiona transformar ideas
            en experiencias visuales memorables, con identidad propia y una
            presentación cuidada en cada detalle.
          </p>
        </div>
        <div className="hidden lg:block flex-shrink-0 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <Image
            src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=400&h=250"
            alt="Photography artistry" 
            width={400}
            height={250}
            className="relative rounded-2xl shadow-2xl border border-muted/20 object-cover w-[400px] h-[250px] transition-all duration-500"
          />
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium border border-muted/20 shadow-sm">
            Metetí, Darién
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-dotted border-muted"> </div>
        <div className="py-10">
          {siteNavigation.map((category) => (
            <div
              key={category.id}
              className="grid gap-6 border-b border-dotted border-muted/30 pb-8 last:border-b-0 last:pb-0 md:grid-cols-[180px_1fr]"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{category.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground max-w-[220px]">
                  Navegación rápida para encontrar servicios, paquetes, galería y acceso a tu cuenta.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.links.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="rounded-2xl border border-muted/10 bg-muted/5 p-4 transition hover:border-primary/30 hover:bg-muted/10"
                  >
                    <div className="font-semibold text-foreground">{item.name}</div>
                    {item.description && (
                      <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-b border-dotted border-muted"> </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 py-8 md:flex-row md:justify-between max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link aria-label="Email" href="mailto:contact@photostore.com" className={Underline}>
            <DIcons.Mail strokeWidth={1.5} className="h-5 w-5" />
          </Link>
          <Link aria-label="X (Twitter)" href="https://x.com/photostore" className={Underline}>
            <DIcons.X className="h-5 w-5" />
          </Link>
          <Link aria-label="Instagram" href="https://instagram.com/photostore" className={Underline}>
            <DIcons.Instagram className="h-5 w-5" />
          </Link>
          <Link aria-label="Threads" href="https://threads.net/photostore" className={Underline}>
            <DIcons.Threads className="h-5 w-5" />
          </Link>
          <Link aria-label="WhatsApp" href="https://wa.me/50766647343" className={Underline}>
            <DIcons.WhatsApp className="h-5 w-5" />
          </Link>
          <Link aria-label="Facebook" href="https://facebook.com/photostore" className={Underline}>
            <DIcons.Facebook className="h-5 w-5" />
          </Link>
          <Link aria-label="LinkedIn" href="https://linkedin.com/company/photostore" className={Underline}>
            <DIcons.LinkedIn className="h-5 w-5" />
          </Link>
          <Link aria-label="YouTube" href="https://youtube.com/@photostore" className={Underline}>
            <DIcons.YouTube className="h-5 w-5" />
          </Link>
        </div>
        <ThemeToggle />
      </div>

      <div className="mx-auto pb-10 flex flex-col justify-between text-center text-xs text-muted-foreground max-w-7xl px-6 border-t border-muted/10 pt-8">
        <div className="flex flex-row items-center justify-center gap-1">
          <span> © </span>
          <span>{new Date().getFullYear()}</span>
          <span>Hecho con</span>
          <DIcons.Heart className="text-destructive mx-1 h-4 w-4 animate-pulse fill-destructive" />
          <span>por</span>
          <span className="hover:text-primary transition-colors cursor-pointer font-bold text-foreground">
            <Link aria-label="Creator" href="https://www.photostore.com" target="_blank">
              PhotoStore Team
            </Link>
          </span>
          <span className="mx-2">|</span>
          <Link aria-label="Home" className="hover:text-primary transition-colors" href="/">
            Fotografía profesional
          </Link>
        </div>
      </div>
    </footer>
  );
}
