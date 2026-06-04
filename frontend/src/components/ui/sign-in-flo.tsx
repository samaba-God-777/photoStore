"use client";

import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Globe, Mail, Lock, User } from "lucide-react";
import Link from "next/link";

interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative group">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 ease-in-out"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within:text-primary">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent py-4 pl-10 pr-12 text-white placeholder:text-transparent focus:outline-none"
          placeholder=" "
        />

        <label
          className={`pointer-events-none absolute left-10 transition-all duration-200 ease-in-out ${
            isFocused || value
              ? "top-2 text-xs font-medium text-primary"
              : "top-1/2 -translate-y-1/2 text-sm text-neutral-400"
          }`}
        >
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {isHovering && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.14) 0%, transparent 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

const SocialButton: React.FC<{ icon: React.ReactNode; name: string }> = ({ icon, name }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80 transition-all duration-300 ease-in-out hover:bg-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={name}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transition-transform duration-500 ${
          isHovered ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      <div className="relative">{icon}</div>
    </button>
  );
};

const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const drawCtx = ctx;

    const setCanvasSize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvasEl.width) this.x = 0;
        if (this.x < 0) this.x = canvasEl.width;
        if (this.y > canvasEl.height) this.y = 0;
        if (this.y < 0) this.y = canvasEl.height;
      }

      draw() {
        drawCtx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        drawCtx.beginPath();
        drawCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        drawCtx.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 50 }, () => new Particle());
    let animationFrame = 0;

    const animate = () => {
      drawCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      animationFrame = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ zIndex: 1 }} />;
};

export const Component: React.FC<{
  onSubmit: (email: string, password: string, remember: boolean, name?: string) => Promise<void>;
  initialIsRegister?: boolean;
}> = ({ onSubmit, initialIsRegister = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(initialIsRegister);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(email, password, rememberMe, isSignUp ? name : undefined);
    } catch {
      // El contenedor muestra el mensaje de error.
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingParticles />

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)] backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Crear cuenta" : "Bienvenido de nuevo"}
            </h1>
            <p className="text-neutral-400">
              {isSignUp ? "Regístrate para empezar" : "Inicia sesión para continuar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <AnimatedFormField
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User size={18} />}
              />
            )}

            <AnimatedFormField
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
            />

            <AnimatedFormField
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
            />

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-white/20 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-neutral-400">Recordarme</span>
              </label>

              {!isSignUp && (
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative group w-full overflow-hidden rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground transition-all duration-300 ease-in-out hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
                {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
              </span>

              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                </div>
              )}

              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-neutral-950 px-2 text-neutral-500">Continuar con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <SocialButton icon={<Globe size={20} />} name="Sitio web" />
              <SocialButton icon={<Mail size={20} />} name="Correo" />
              <SocialButton icon={<User size={20} />} name="Perfil" />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-400">
              {isSignUp ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
              <button type="button" onClick={toggleMode} className="font-medium text-primary hover:underline">
                {isSignUp ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DemoOne = () => <Component onSubmit={async () => undefined} />;

export { DemoOne };
