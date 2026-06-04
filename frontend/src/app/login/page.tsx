'use client';
import { Suspense } from 'react';
import { Component as SignInFlo } from '@/components/ui/sign-in-flo';
import { apiLogin, apiRegister } from '@/lib/api';
import { saveToken, saveUser, showToast } from '@/lib/helpers';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const initialIsRegister = searchParams.get('mode') === 'register';

  const handleLogin = async (email: string, password: string, _remember: boolean, name?: string) => {
    try {
      let response;

      if (name) {
        response = await apiRegister({ name, email, password });
        showToast('¡Cuenta creada exitosamente!', 'success');
      } else {
        response = await apiLogin({ email, password });
        showToast('¡Bienvenido de nuevo!', 'success');
      }

      if (response?.token && (response?.user || response?.data)) {
        const rawUser = response.user ?? response.data;
        const userData = {
          ...rawUser,
          _id: rawUser._id ?? rawUser.id,
        };

        saveToken(response.token);
        saveUser(userData);

        router.push(returnTo);
        setTimeout(() => router.refresh(), 100);
      } else {
        throw new Error('Respuesta del servidor incompleta');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error en la autenticación. Revisa tus datos.';
      showToast(message, 'error');
      throw error;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 bg-black">
      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <SignInFlo onSubmit={handleLogin} initialIsRegister={initialIsRegister} />
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
