import React, { useState, useEffect } from 'react';
import { db, hashPassword, type User } from '../db/database';
import {
    Users,
    UserPlus,
    Shield,
    ShieldCheck,
    Trash2,
    Edit2,
    X,
    Key,
    UserCheck,
    Search,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';

const UserModule: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({
        username: '',
        name: '',
        password: '',
        role: 'cashier'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const all = await db.users.toArray();
        setUsers(all);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let finalData: Partial<User> = { ...formData };

            // Si hay una contraseña introducida, encriptarla usando SHA-256 (Grado Militar)
            if (formData.password) {
                finalData.password = await hashPassword(formData.password);
            } else if (editingUser) {
                // Si está editando y no puso contraseña nueva, borramos la clave 'password' para no mutarla
                delete finalData.password;
            } else {
                alert('La contraseña es obligatoria para usuarios nuevos.');
                setIsSaving(false);
                return;
            }

            if (editingUser) {
                await db.users.update(editingUser.id!, finalData);
            } else {
                // Validación para evitar nombres duplicados
                const existing = await db.users.where('username').equals(formData.username!.toLowerCase()).first();
                if (existing) {
                    alert('El nombre de usuario ya está registrado en la base de datos.');
                    setIsSaving(false);
                    return;
                }
                await db.users.add({
                    ...finalData,
                    username: finalData.username!.toLowerCase()
                } as User);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ username: '', name: '', password: '', role: 'cashier' });
            loadUsers();
        } catch (err) {
            console.error('Save error:', err);
            alert('Error crítico de red al guardar el usuario en el servidor.');
        } finally {
            setIsSaving(false);
        }
    };

    const [deleteError, setDeleteError] = useState<string | null>(null);

    const deleteUser = async (id: number) => {
        const userToDelete = users.find(u => u.id === id);

        // Protección de acceso principal
        if (userToDelete?.role === 'admin') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                setDeleteError('Violación de Protocolo: No puedes eliminar el único administrador del sistema.');
                return;
            }
        }

        setDeleteError(null);
        await db.users.delete(id);
        setShowDeleteConfirm(null);
        loadUsers();
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-black font-outfit glow-text tracking-tight uppercase flex items-center gap-3">
                        <Lock size={28} className="text-primary" />
                        Accesos y Personal
                    </h2>
                    <p className="text-text-muted text-sm mt-1 uppercase tracking-widest font-bold">Panel de Seguridad Autorizado</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ username: '', name: '', password: '', role: 'cashier' });
                        setShowModal(true);
                    }}
                    className="btn btn-primary h-12 shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black uppercase tracking-widest text-[10px] px-8 transition-transform active:scale-95"
                >
                    <UserPlus size={18} className="mr-2" /> Agregar Personal
                </button>
            </div>

            {/* Dashboards Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card glass border-white/5 bg-gradient-to-r from-bg-surface-light via-bg-surface to-bg-surface p-6 flex justify-between items-center group hover:border-primary/20 transition-all">
                    <div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Personal Registrado</p>
                        <p className="text-4xl font-black font-outfit mt-2 group-hover:text-primary transition-colors">{users.length}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Users size={32} />
                    </div>
                </div>

                <div className="card glass border-white/5 bg-gradient-to-r from-bg-surface-light via-bg-surface to-bg-surface p-6 flex justify-between items-center group hover:border-secondary/20 transition-all">
                    <div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Administradores Maestro</p>
                        <p className="text-4xl font-black font-outfit mt-2 group-hover:text-secondary transition-colors">{users.filter(u => u.role === 'admin').length}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                        <ShieldCheck size={32} />
                    </div>
                </div>
            </div>

            {/* Barra de Búsqueda */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" size={20} />
                <input
                    type="text"
                    placeholder="Escribe un nombre o usuario para filtrar..."
                    className="input pl-16 h-14 bg-bg-surface/50 border-white/10 focus:bg-white/5 focus:border-primary/50 text-xs font-bold tracking-widest uppercase transition-all rounded-2xl w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Listado de Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(u => (
                    <div key={u.id} className="card glass p-0 border-white/10 group hover:border-primary/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">

                        <div className={`h-1.5 w-full bg-gradient-to-r ${u.role === 'admin' ? 'from-secondary/50 via-secondary to-secondary/50' : 'from-primary/50 via-primary to-primary/50'}`}></div>

                        <div className="p-6 relative z-10 flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black font-outfit text-2xl border ${u.role === 'admin' ? 'bg-secondary/10 text-secondary border-secondary/30 shadow-[0_0_15px_rgba(30,144,255,0.2)]' : 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                        }`}>
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-black font-outfit text-xl tracking-tight uppercase text-white">{u.name}</h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {u.role === 'admin' ? <Shield size={12} className="text-secondary" /> : <UserCheck size={12} className="text-primary" />}
                                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${u.role === 'admin' ? 'text-secondary opacity-80' : 'text-primary opacity-80'}`}>
                                                {u.role === 'admin' ? 'Administrador' : 'Cajero'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información Secreta / Config */}
                            <div className="bg-bg-surface-light/50 p-4 rounded-xl border border-white/5">
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1 shadow-sm">ID de Ingreso</p>
                                <p className="text-sm font-black tracking-wider text-white bg-black/20 px-3 py-1.5 rounded inline-block">{u.username}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex justify-between items-center relative z-10">
                            <div className="flex gap-2 items-center">
                                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                                <span className="text-[9px] text-success font-black uppercase tracking-widest">Activo</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingUser(u);
                                        // Vaciamos la contraseña para que en la edición se vea limpia y no se encripte doble.
                                        setFormData({ ...u, password: '' });
                                        setShowModal(true);
                                    }}
                                    className="p-2.5 bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-primary rounded-xl text-text-muted transition-all active:scale-90"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(u.id!);
                                    }}
                                    className="p-2.5 bg-white/5 border border-white/10 hover:bg-danger/20 hover:border-danger/50 hover:text-danger rounded-xl text-text-muted transition-all active:scale-90"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Profesional de Creación y Edición */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isSaving && setShowModal(false)}></div>
                    <form onSubmit={handleSave} className="card w-full max-w-xl relative z-10 p-0 overflow-hidden border-primary/20 shadow-[0_0_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-1 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tight text-white">
                                        {editingUser ? 'Ajustes de Perfil' : 'Registro de Personal'}
                                    </h3>
                                    <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Protocolo de Seguridad de Credenciales</p>
                                </div>
                                <button type="button" onClick={() => !isSaving && setShowModal(false)} className="text-text-muted hover:text-danger p-2 hover:bg-white/5 rounded-full transition-all bg-bg-surface border border-white/10">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Nombre Completo del Empleado</label>
                                    <input
                                        required
                                        type="text"
                                        className="input h-14 bg-bg-surface border-white/10 font-black tracking-wide rounded-xl focus:border-primary"
                                        placeholder="Ej: Juan Pérez"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">ID de Acceso (Usuario)</label>
                                    <input
                                        required
                                        type="text"
                                        className="input h-14 bg-bg-surface border-white/10 font-bold lowercase rounded-xl tracking-widest focus:border-primary disabled:opacity-50"
                                        placeholder="ej: juan_perez"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        disabled={!!editingUser || isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Nivel de Privilegios</label>
                                    <select
                                        className="input h-14 bg-bg-surface border-white/10 font-black uppercase text-xs tracking-widest rounded-xl focus:border-primary"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                        disabled={isSaving}
                                    >
                                        <option value="cashier">Cajero / Operativo</option>
                                        <option value="admin">Administrador Maestro</option>
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2 mt-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1 flex items-center gap-2">
                                        <Lock size={14} />
                                        {editingUser ? 'Actualizar Contraseña Cifrada (Opcional)' : 'Crear Contraseña Maestra'}
                                    </label>
                                    <p className="text-[10px] text-text-muted/70 leading-relaxed font-medium mb-3">Las credenciales son tratadas mediante un algoritmo matemático de tipo SHA-256. El sistema central no tiene ni tendrá acceso al texto original de la contraseña.</p>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60" size={18} />
                                        <input
                                            required={!editingUser}
                                            type={showPassword ? "text" : "password"}
                                            className="input pl-12 pr-12 h-14 bg-black/40 border-primary/20 font-bold tracking-widest rounded-xl focus:border-primary focus:bg-white/5 transition-all text-white placeholder-text-muted/30"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            disabled={isSaving}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => !isSaving && setShowModal(false)} className="btn bg-white/5 text-white flex-1 h-14 font-black uppercase text-xs tracking-widest hover:bg-white/10 border border-white/10">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSaving} className="btn btn-primary flex-[2] h-14 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95 transition-all">
                                    {isSaving ? 'Aplicando Seguridad...' : (editingUser ? 'Guardar Cambios' : 'Generar Acceso')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal de Eliminación Profesional */}
            {showDeleteConfirm !== null && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isSaving && setShowDeleteConfirm(null)}></div>
                    <div className="card w-full max-w-md relative z-10 p-0 border-danger/30 text-center overflow-hidden animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <div className="p-1 w-full bg-gradient-to-r from-danger/80 via-danger to-danger/80"></div>
                        <div className="p-8 space-y-6">
                            <div className="w-24 h-24 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4 border border-danger/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                <Lock size={40} className="absolute opacity-20" />
                                <Trash2 size={36} className="relative z-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-2">Revocar Acceso</h3>
                                <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Eliminación permanente del registro.</p>
                            </div>

                            {deleteError && (
                                <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-left animate-pulse">
                                    <p className="text-warning text-[10px] font-black uppercase tracking-widest">⚠ Bloqueo de Seguridad</p>
                                    <p className="text-warning/90 text-xs mt-1 font-bold">{deleteError}</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => { setShowDeleteConfirm(null); setDeleteError(null); }}
                                    className="btn bg-white/5 border border-white/10 text-white flex-1 h-14 font-black uppercase text-xs tracking-widest hover:bg-white/10"
                                >
                                    Bloquear
                                </button>
                                <button
                                    onClick={() => deleteUser(showDeleteConfirm)}
                                    className="btn bg-danger text-white flex-1 h-14 font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-danger-dark active:scale-95 transition-all"
                                >
                                    Proceder con la Baja
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserModule;
