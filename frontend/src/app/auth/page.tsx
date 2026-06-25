'use client';
import { Suspense } from 'react';
import { Component as SignInFlo } from '@/components/ui/sign-in-flo';
import { apiLogin, apiRegister, apiGoogleLogin } from '@/lib/api';
import { saveToken, saveUser, showToast } from '@/lib/helpers';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const initialIsRegister = searchParams.get('mode') === 'register';

  const handleLogin = async (email: string, password: string, _remember: boolean, name?: string) => {
    try {
      const response = name
        ? await apiRegister({ name, email, password })
        : await apiLogin({ email, password });

      if (response?.token && (response?.user || response?.data)) {
        const rawUser = response.user ?? response.data;
        const userData = {
          ...rawUser,
          _id: rawUser._id || rawUser.id,
        };

        saveToken(response.token);
        saveUser(userData);
        showToast('¡Bienvenido de nuevo!', 'success');

        router.push(returnTo);
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        throw new Error('Respuesta del servidor incompleta');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      showToast(error instanceof Error ? error.message : 'Error al iniciar sesión.', 'error');
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    try {
      const response = await apiGoogleLogin(credential);
      if (response?.token && response?.user) {
        const userData = { ...response.user, _id: response.user._id || response.user.id };
        saveToken(response.token);
        saveUser(userData);
        showToast('¡Bienvenido!', 'success');
        router.push(returnTo);
        setTimeout(() => router.refresh(), 100);
      } else {
        throw new Error('Respuesta del servidor incompleta');
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
      showToast(error instanceof Error ? error.message : 'Error al iniciar sesión con Google.', 'error');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 bg-black">
      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <SignInFlo onSubmit={handleLogin} onGoogleCredential={handleGoogleCredential} initialIsRegister={initialIsRegister} />

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthContent />
    </Suspense>
  );
}
