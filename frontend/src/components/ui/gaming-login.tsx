'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Globe, X, Gamepad2, User } from 'lucide-react';
import * as THREE from 'three';

interface LoginFormProps {
    onSubmit: (email: string, password: string, remember: boolean, name?: string) => void | Promise<void>;
    initialIsRegister?: boolean;
}

interface FormInputProps {
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

interface SocialButtonProps {
    icon: React.ReactNode;
    name: string;
}

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    id: string;
}

interface StudioBackgroundProps {
    photographerImageUrl: string;
}

// ── FormInput ─────────────────────────────────────────────────────────────────
const FormInput: React.FC<FormInputProps> = ({ icon, type, placeholder, value, onChange, required }) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
    </div>
);

// ── SocialButton ──────────────────────────────────────────────────────────────
const SocialButton: React.FC<SocialButtonProps> = ({ icon }) => (
    <button className="flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors">
        {icon}
    </button>
);

// ── ToggleSwitch ──────────────────────────────────────────────────────────────
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => (
    <label className="relative inline-block w-10 h-5 cursor-pointer">
        <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={onChange} />
        <div className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-purple-600' : 'bg-white/20'}`}>
            <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-5' : ''}`} />
        </div>
    </label>
);

// ── StudioBackground: Three.js 3D Photography Studio ─────────────────────────
const StudioBackground: React.FC<StudioBackgroundProps> = ({ photographerImageUrl }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;

        const W = el.clientWidth;
        const H = el.clientHeight;

        // ── Scene setup ───────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050208, 0.07);

        const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
        camera.position.set(0, 0.4, 5.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x050208, 1);
        el.appendChild(renderer.domElement);

        // ── Floor ─────────────────────────────────────────────────────────────
        const floorCv = document.createElement('canvas');
        floorCv.width = floorCv.height = 512;
        const fc = floorCv.getContext('2d')!;
        fc.fillStyle = '#080510';
        fc.fillRect(0, 0, 512, 512);
        // Subtle grid
        fc.strokeStyle = 'rgba(160,100,255,0.1)';
        fc.lineWidth = 1;
        for (let i = 0; i <= 16; i++) {
            fc.beginPath(); fc.moveTo(i * 32, 0); fc.lineTo(i * 32, 512); fc.stroke();
            fc.beginPath(); fc.moveTo(0, i * 32); fc.lineTo(512, i * 32); fc.stroke();
        }
        const floorTex = new THREE.CanvasTexture(floorCv);
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(5, 5);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(22, 22),
            new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.15, metalness: 0.7 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2.4;
        floor.receiveShadow = true;
        scene.add(floor);

        // ── Back wall ─────────────────────────────────────────────────────────
        const wallCv = document.createElement('canvas');
        wallCv.width = 1024; wallCv.height = 512;
        const wc = wallCv.getContext('2d')!;
        const wg = wc.createRadialGradient(512, 256, 20, 512, 256, 500);
        wg.addColorStop(0, '#1c0d35');
        wg.addColorStop(1, '#050208');
        wc.fillStyle = wg;
        wc.fillRect(0, 0, 1024, 512);
        const wallTex = new THREE.CanvasTexture(wallCv);
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(22, 12),
            new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 })
        );
        wall.position.set(0, 2, -7);
        scene.add(wall);

        // ── Studio softbox geometry ───────────────────────────────────────────
        const addSoftbox = (x: number, y: number, z: number, ry: number, col: number) => {
            const grp = new THREE.Group();
            // Box body
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.9, 0.18),
                new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 })
            );
            box.position.set(0, 0, 0);
            grp.add(box);
            // Glowing face
            const face = new THREE.Mesh(
                new THREE.PlaneGeometry(1.3, 0.8),
                new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })
            );
            face.position.z = 0.1;
            grp.add(face);
            // Stand pole
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 3.5, 8),
                new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 })
            );
            pole.position.y = -2.2;
            grp.add(pole);
            // Tripod legs
            [-0.45, 0, 0.45].forEach((ox, i) => {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.015, 0.01, 1.6, 6),
                    new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 })
                );
                leg.position.set(ox, -3.6, i === 1 ? 0.4 : 0);
                leg.rotation.z = i === 0 ? 0.28 : i === 2 ? -0.28 : 0;
                leg.rotation.x = i === 1 ? -0.25 : 0;
                grp.add(leg);
            });
            grp.position.set(x, y, z);
            grp.rotation.y = ry;
            scene.add(grp);
        };
        addSoftbox(-3.8, 2.8, 0.5, 0.45, 0xfff4d0);   // warm key left
        addSoftbox(3.8, 2.6, 0.5, -0.45, 0xd0e0ff);   // cool fill right

        // ── Floating photographer card ─────────────────────────────────────────
        const imgCv = document.createElement('canvas');
        imgCv.width = 512;
        imgCv.height = 768;
        const ic = imgCv.getContext('2d')!;

        // Dark base while loading
        ic.fillStyle = '#0d0520';
        ic.fillRect(0, 0, 512, 768);

        const photographerTex = new THREE.CanvasTexture(imgCv);

        const photo = new THREE.Mesh(
            new THREE.PlaneGeometry(2.6, 3.9),
            new THREE.MeshBasicMaterial({ map: photographerTex, transparent: true, side: THREE.DoubleSide })
        );
        photo.position.set(2.4, 0.0, 0.5);
        photo.rotation.y = -0.2;
        scene.add(photo);

        // Load image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const iw = img.naturalWidth, ih = img.naturalHeight;
            const sx = iw * 0.43, sy = ih * 0.03;
            const sw = iw * 0.57, sh = ih * 0.79;
            ic.clearRect(0, 0, 512, 768);
            ic.drawImage(img, sx, sy, sw, sh, 0, 0, 512, 768);
            const vg = ic.createRadialGradient(256, 384, 160, 256, 384, 400);
            vg.addColorStop(0, 'rgba(0,0,0,0)');
            vg.addColorStop(0.75, 'rgba(5,2,8,0.2)');
            vg.addColorStop(1, 'rgba(5,2,8,0.95)');
            ic.fillStyle = vg;
            ic.fillRect(0, 0, 512, 768);
            photographerTex.needsUpdate = true;
        };
        img.onerror = () => {
            ic.fillStyle = '#200840';
            ic.fillRect(0, 0, 512, 768);
            const sg = ic.createRadialGradient(256, 200, 0, 256, 200, 140);
            sg.addColorStop(0, '#9944ff');
            sg.addColorStop(1, '#200840');
            ic.fillStyle = sg;
            ic.beginPath(); ic.arc(256, 200, 120, 0, Math.PI * 2); ic.fill();
            ic.fillStyle = '#7733dd';
            ic.fillRect(120, 330, 272, 320);
            photographerTex.needsUpdate = true;
        };
        img.src = photographerImageUrl;

        // Neon border frame
        const neonMat = new THREE.MeshBasicMaterial({ color: 0xaa44ff, transparent: true, opacity: 0.9 });
        const borders_data = [
            { w: 2.65, h: 0.04, dx: 0, dy: 1.97, dz: 0.01 },
            { w: 2.65, h: 0.04, dx: 0, dy: -1.97, dz: 0.01 },
            { w: 0.04, h: 3.94, dx: -1.32, dy: 0, dz: 0.01 },
            { w: 0.04, h: 3.94, dx: 1.32, dy: 0, dz: 0.01 },
        ];
        borders_data.forEach(b => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(b.w, b.h), neonMat);
            m.position.set(2.4 + b.dx, 0.0 + b.dy, 0.5 + b.dz);
            m.rotation.y = -0.2;
            scene.add(m);
        });

        // Corner diamonds
        [[1.32, 1.97], [-1.32, 1.97], [1.32, -1.97], [-1.32, -1.97]].forEach(([dx, dy]) => {
            const d = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 0.1),
                new THREE.MeshBasicMaterial({ color: 0xdd88ff, transparent: true, opacity: 1 })
            );
            d.position.set(2.4 + dx, 0.0 + dy, 0.52);
            d.rotation.y = -0.2;
            d.rotation.z = Math.PI / 4;
            scene.add(d);
        });

        // Glow puddle
        const puddle = new THREE.Mesh(
            new THREE.CircleGeometry(1.4, 32),
            new THREE.MeshBasicMaterial({ color: 0x8833ff, transparent: true, opacity: 0.15 })
        );
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(2.4, -2.38, 0.5);
        scene.add(puddle);

        // ── Floating camera prop ───────────────────────────────────────────────
        const camGrp = new THREE.Group();
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95, roughness: 0.2 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.42, 0.3), darkMetal);
        camGrp.add(body);
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.15, 0.38, 32),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 1, roughness: 0.05 })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = 0.34;
        camGrp.add(barrel);
        const glass = new THREE.Mesh(
            new THREE.CircleGeometry(0.1, 32),
            new THREE.MeshBasicMaterial({ color: 0x003388, transparent: true, opacity: 0.9 })
        );
        glass.position.z = 0.54;
        camGrp.add(glass);
        const hump = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.15, 0.16),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8 })
        );
        hump.position.set(-0.05, 0.28, 0);
        camGrp.add(hump);
        const shutter = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.05, 12),
            new THREE.MeshStandardMaterial({ color: 0xff3300 })
        );
        shutter.position.set(-0.1, 0.37, 0.06);
        camGrp.add(shutter);

        camGrp.position.set(-2.4, 0.8, 1.5);
        scene.add(camGrp);

        // ── Particle dust motes ───────────────────────────────────────────────
        const N = 700;
        const pos = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
        }
        const partGeo = new THREE.BufferGeometry();
        partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const parts = new THREE.Points(
            partGeo,
            new THREE.PointsMaterial({ color: 0xcc99ff, size: 0.028, transparent: true, opacity: 0.45 })
        );
        scene.add(parts);

        // ── Light shafts ──────────────────────────────────────────────────────
        const shaftMat = new THREE.MeshBasicMaterial({ color: 0xfff0cc, transparent: true, opacity: 0.04, side: THREE.DoubleSide });
        const addShaft = (x: number, ry: number) => {
            const shaft = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5.5, 16, 1, true), shaftMat);
            shaft.position.set(x, 0.3, -1.5);
            shaft.rotation.y = ry;
            shaft.rotation.z = ry > 0 ? 0.35 : -0.35;
            scene.add(shaft);
        };
        addShaft(-3.5, 0.3);
        addShaft(3.5, -0.3);

        // ── Scene lights ──────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x18092e, 3));
        const key = new THREE.SpotLight(0xfff4d0, 10, 18, Math.PI / 5.5, 0.5);
        key.position.set(-4, 5.5, 2);
        key.castShadow = true;
        scene.add(key);
        const fill = new THREE.SpotLight(0x9955ff, 6, 14, Math.PI / 4.5, 0.65);
        fill.position.set(4, 4.5, 2);
        scene.add(fill);
        const rim = new THREE.PointLight(0x00aaff, 2.5, 9);
        rim.position.set(0, 3, -3.5);
        scene.add(rim);
        const cardLight = new THREE.PointLight(0xbb66ff, 3, 5);
        cardLight.position.set(2.4, 1, 1.5);
        scene.add(cardLight);

        // Parallax
        let mx = 0, my = 0;
        const onMM = (e: MouseEvent) => {
            mx = (e.clientX / window.innerWidth - 0.5) * 2;
            my = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMM);

        // Loop
        let raf: number;
        const clock = new THREE.Clock();
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const t = clock.getElapsedTime();
            camera.position.x += (mx * 0.55 - camera.position.x) * 0.035;
            camera.position.y += (-my * 0.28 + 0.4 - camera.position.y) * 0.035;
            camera.lookAt(0, 0, 0);
            photo.position.y = 0.0 + Math.sin(t * 0.65) * 0.07;
            camGrp.position.y = 0.8 + Math.sin(t * 0.88 + 1.2) * 0.09;
            camGrp.rotation.y = Math.sin(t * 0.38) * 0.35;
            camGrp.rotation.x = Math.sin(t * 0.5) * 0.04;
            parts.rotation.y = t * 0.012;
            parts.rotation.x = t * 0.006;
            rim.intensity = 2.5 + Math.sin(t * 1.8) * 0.6;
            cardLight.intensity = 3 + Math.sin(t * 1.2 + 0.5) * 0.8;
            renderer.render(scene, camera);
        };
        tick();

        const onResize = () => {
            const w = el.clientWidth, h = el.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMM);
            renderer.dispose();
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        };
    }, [photographerImageUrl]);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
};

// ── LoginForm ─────────────────────────────────────────────────────────────────
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, initialIsRegister = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(initialIsRegister);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit(email, password, remember, isRegister ? name : undefined);
            setIsSuccess(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
            setIsSuccess(false);
        }
    };

    return (
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 relative group">
                    <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                    <span className="relative inline-block text-3xl font-bold mb-2 text-white">OlmedoFoto</span>
                </h2>
                <div className="text-white/80 flex flex-col items-center space-y-1">
                    <span className="relative group cursor-default text-center">
                        <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative inline-block animate-pulse">
                            {isRegister ? 'Join the photographic elite' : 'Your gaming universe awaits'}
                        </span>
                    </span>
                    <span className="text-xs text-white/50 animate-pulse">
                        {isRegister ? '[Completa tu perfil para empezar]' : '[Presiona Enter para comenzar]'}
                    </span>
                    <div className="flex space-x-2 text-xs text-white/40">
                        <span className="animate-pulse">⚔️</span>
                        <span className="animate-bounce">🎮</span>
                        <span className="animate-pulse">🏆</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {isRegister && (
                    <div className="animate-fadeIn">
                        <FormInput
                            icon={<User className="text-white/60" size={18} />}
                            type="text" placeholder="Full Name"
                            value={name} onChange={e => setName(e.target.value)} required
                        />
                    </div>
                )}
                <FormInput
                    icon={<Mail className="text-white/60" size={18} />}
                    type="email" placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)} required
                />
                <div className="relative">
                    <FormInput
                        icon={<Lock className="text-white/60" size={18} />}
                        type={showPassword ? 'text' : 'password'} placeholder="Password"
                        value={password} onChange={e => setPassword(e.target.value)} required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="flex items-center justify-start">
                    <div className="flex items-center space-x-2">
                        <div>
                            <ToggleSwitch checked={remember} onChange={() => setRemember(!remember)} id="remember-me" />
                        </div>
                        <label htmlFor="remember-me" className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
                            Recuérdame
                        </label>
                    </div>
                </div>

                <button
                    type="submit" disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg ${isSuccess ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40`}
                >
                    {isSubmitting ? (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...') : (isRegister ? 'Crear cuenta' : 'Entrar')}
                </button>
            </form>

            <div className="mt-8">
                <div className="relative flex items-center justify-center">
                    <div className="border-t border-white/10 absolute w-full" />
                    <div className="bg-transparent px-4 relative text-white/60 text-sm">acceso rápido con</div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                    <SocialButton icon={<Globe size={18} />} name="Globe" />
                    <SocialButton icon={<X size={18} />} name="X" />
                    <SocialButton icon={<Gamepad2 size={18} />} name="Steam" />
                </div>
            </div>

            <p className="mt-8 text-center text-sm text-white/60">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="font-medium text-white hover:text-purple-300 transition-colors"
                >
                    {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
            </p>
        </div>
    );
};

// ── Exports ───────────────────────────────────────────────────────────────────
export { LoginForm, StudioBackground };
const LoginPage = { LoginForm, StudioBackground };
export default LoginPage;
