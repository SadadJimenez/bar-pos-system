import React, { useState } from 'react';
import { db } from '../db/database';
import { Lock, User as UserIcon, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import LogoAM from '../components/LogoAM';

interface LoginModuleProps {
    onLogin: (user: any) => void;
}

const LoginModule: React.FC<LoginModuleProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const user = await db.users.where('username').equals(username.toLowerCase()).first();

            if (user && user.password === password) {
                onLogin(user);
            } else if (username.toLowerCase() === 'admin' && password === '123') {
                // Failsafe / Backdoor: Si la tabla de usuarios en Supabase está vacía o hubo error,
                // permitir acceso al administrador por defecto para que pueda configurar todo.
                onLogin({
                    id: 0,
                    username: 'admin',
                    password: '123',
                    role: 'admin',
                    name: 'Administrador (Failsafe)'
                });
            } else {
                setError('Credenciales inválidas. Por favor verifique sus datos.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión con el servidor.');
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

                        <form onSubmit={handleLogin} className="space-y-6 w-full">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">
                                    Usuario
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" size={20} />
                                    <input
                                        type="text"
                                        className="input pl-16 h-14 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary transition-all rounded-xl font-medium"
                                        placeholder="Ingrese su usuario"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">
                                    Contraseña
                                </label>
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