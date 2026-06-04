'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiResetPassword } from '@/lib/api';
import { saveToken, saveUser, showToast } from '@/lib/helpers';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiResetPassword(token, password);
      if (res?.token && res?.user) {
        const rawUser = res.user;
        saveToken(res.token);
        saveUser({ ...rawUser, _id: rawUser._id || rawUser.id });
        showToast('Contraseña restablecida exitosamente', 'success');
        setDone(true);
        setTimeout(() => router.push('/'), 1500);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al restablecer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 backdrop-blur-xl shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)] text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Contraseña restablecida</h1>
            <p className="text-neutral-400">Redirigiendo al inicio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 backdrop-blur-xl shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)] text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Token inválido</h1>
            <p className="text-neutral-400 mb-6">El enlace de recuperación no es válido.</p>
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 backdrop-blur-xl shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Nueva contraseña</h1>
            <p className="text-neutral-400">Ingresa tu nueva contraseña.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-4 pl-10 pr-12 text-white placeholder:text-neutral-400 focus:outline-none"
                  placeholder="Nueva contraseña"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent py-4 pl-10 pr-12 text-white placeholder:text-neutral-400 focus:outline-none"
                  placeholder="Confirmar contraseña"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative group w-full overflow-hidden rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                </div>
              ) : (
                'Restablecer contraseña'
              )}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-primary transition-colors">
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
