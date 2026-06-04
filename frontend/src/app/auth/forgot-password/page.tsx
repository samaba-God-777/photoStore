'use client';
import { Suspense, useState } from 'react';
import { apiForgotPassword } from '@/lib/api';
import { showToast } from '@/lib/helpers';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiForgotPassword(email);
      setSubmitted(true);
      setResetUrl(res.resetUrl || '');
      showToast('Correo enviado con instrucciones', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al enviar', 'error');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 backdrop-blur-xl shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)] text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Correo enviado</h1>
            <p className="text-neutral-400 mb-6">
              Si existe una cuenta con <strong className="text-white">{email}</strong>, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft size={16} />
              Volver a iniciar sesión
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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h1>
            <p className="text-neutral-400">
              Ingresa tu email y te enviaremos las instrucciones para restablecerla.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-4 pl-10 pr-12 text-white placeholder:text-neutral-400 focus:outline-none"
                  placeholder="Correo electrónico"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="relative group w-full overflow-hidden rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90"
            >
              Enviar instrucciones
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-primary transition-colors">
              <ArrowLeft size={16} />
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
