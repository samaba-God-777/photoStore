'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiUpdateProfile } from '@/lib/api';
import { getUser, saveUser, showToast, getServerBase } from '@/lib/helpers';
import { User, Camera, Save, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CuentaPage() {
  const router = useRouter();
  const user = getUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const getAvatarUrl = () => {
    if (avatar?.startsWith('blob:')) return avatar;
    if (avatar?.startsWith('http')) return avatar;
    if (avatar?.startsWith('/uploads/')) return `${getServerBase()}${avatar}`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      if (password) formData.append('password', password);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await apiUpdateProfile(formData);
      if (res?.user) {
        saveUser({ ...res.user, _id: res.user.id || res.user._id });
        if (res.user.avatar) {
          setAvatar(res.user.avatar);
          setAvatarFile(null);
        }
        showToast('Perfil actualizado', 'success');
        setPassword('');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} />
          Volver al dashboard
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 backdrop-blur-xl shadow-[0_30px_90px_-55px_rgba(59,130,246,0.85)]">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Camera size={14} className="text-primary-foreground" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">{user?.name}</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Teléfono</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="+507 6000-0000"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nueva contraseña (dejar vacío para no cambiar)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors pr-10"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Email: <span className="text-white">{user?.email}</span> (no se puede cambiar)
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
