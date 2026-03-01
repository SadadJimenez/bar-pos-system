import React, { useState } from 'react';
import { db } from '../db/database';
import { supabase } from '../lib/supabase';
import { Lock, User as UserIcon, ShieldCheck, Loader2, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import LogoAM from '../components/LogoAM';

interface LoginModuleProps {
    onLogin: (user: any) => void;
}

const LoginModule: React.FC<LoginModuleProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [recoverySuccess, setRecoverySuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setRecoverySuccess('');

        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // 1. Intentar autenticación con Supabase Auth directamente (si el usuario se registró allí con correo)
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: username,
                password: password,
            });

            if (authData?.user) {
                // Si existe en Supabase Auth, buscamos su rol/nombre en la base de datos local
                let dbUser = await db.users.where('username').equals(username.toLowerCase()).first();
                if (!dbUser) {
                    // Si no existe en la tabla local, creamos un objeto temporal para que no rompa la app
                    dbUser = {
                        id: 0,
                        username: authData.user.email || 'user',
                        role: 'admin',
                        name: authData.user.email?.split('@')[0] || 'Usuario Supabase',
                    };
                }
                onLogin(dbUser);
                return;
            }

            // 2. Fallback: Si falla Supabase Auth, intentamos con la tabla "users" local (solo username y password)
            const user = await db.users.where('username').equals(username.toLowerCase()).first();

            if (!user || user.password !== password) {
                setError('Credenciales inválidas. Por favor verifique sus datos.');
            } else {
                onLogin(user);
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) {
            setError('Por favor ingresa tu correo para recuperar.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRecoverySuccess('');

        try {
            // Utiliza la función nativa de Supabase Auth para restablecer contraseña
            const { error } = await supabase.auth.resetPasswordForEmail(username, {
                redirectTo: window.location.origin,
            });

            if (error) {
                setError('Error al enviar: ' + error.message);
            } else {
                setRecoverySuccess('Correo enviado con instrucciones. Revisa tu bandeja de entrada o spam.');
            }
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0c]">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

            <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                <div className="card glass border-white/10 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>

                    <div className="p-10 flex flex-col items-center">
                        <div className="w-full text-center mb-10 flex flex-col items-center">
                            <LogoAM size={180} className="mb-6 opacity-95 transition-transform hover:scale-105 duration-700 drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]" />
                            <h1 className="text-4xl font-black font-outfit glow-text tracking-tighter uppercase leading-none">AM LICORES</h1>
                            <p className="text-text-muted mt-3 text-[10px] uppercase tracking-[0.8em] font-bold">Premium System</p>
                        </div>

                        {!isRecovering ? (
                            <form onSubmit={handleLogin} className="space-y-6 w-full">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">
                                        Usuario o Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" size={20} />
                                        <input
                                            type="text"
                                            className="input pl-16 h-14 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary transition-all rounded-xl font-medium"
                                            placeholder="Ingrese su usuario o correo"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center mr-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">
                                            Contraseña
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setIsRecovering(true); setError(''); setRecoverySuccess(''); }}
                                            className="text-[10px] text-primary/80 hover:text-primary font-bold transition-colors"
                                        >
                                            ¿Olvidó su contraseña?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" size={20} />
                                        <input
                                            type="password"
                                            className="input pl-16 h-14 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary transition-all rounded-xl font-medium"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs text-center font-bold animate-pulse">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary w-full h-14 text-sm font-black uppercase tracking-widest mt-6 shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin text-black" size={24} />
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            Ingresar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </button>
                            </form>
                        ) : (
                            // Formulario de Recuperación
                            <form onSubmit={handleRecovery} className="space-y-6 w-full animate-in fade-in slide-in-from-right-4">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-black font-outfit uppercase tracking-tighter text-white mb-2">Recuperar Acceso</h3>
                                    <p className="text-xs text-text-muted">Introduce el correo electrónico asociado a tu cuenta de Supabase.</p>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" size={20} />
                                        <input
                                            type="email"
                                            className="input pl-16 h-14 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary transition-all rounded-xl font-medium"
                                            placeholder="correo@ejemplo.com"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs text-center font-bold animate-pulse">
                                        {error}
                                    </div>
                                )}

                                {recoverySuccess && (
                                    <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-success text-xs text-center font-bold animate-pulse">
                                        {recoverySuccess}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn btn-primary w-full h-14 text-sm font-black uppercase tracking-widest shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin text-black" size={24} />
                                        ) : (
                                            'Enviar Enlace'
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => { setIsRecovering(false); setError(''); setRecoverySuccess(''); }}
                                        className="btn bg-white/5 text-white w-full h-14 text-sm font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98] group"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver
                                        </div>
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center">
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                <ShieldCheck className="text-success" size={16} />
                                <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Servidor Protegido</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-text-muted text-[10px] mt-8 uppercase font-bold tracking-widest opacity-30">
                    &copy; 2026 AM LICORES POS v1.0.4
                </p>
            </div>
        </div>
    );
};

export default LoginModule;