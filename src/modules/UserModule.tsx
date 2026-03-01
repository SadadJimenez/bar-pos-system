import React, { useState, useEffect } from 'react';
import { db, type User } from '../db/database';
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
    Search
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

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const all = await db.users.toArray();
        setUsers(all);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await db.users.update(editingUser.id!, formData);
            } else {
                // Ensure unique username
                const existing = await db.users.where('username').equals(formData.username!.toLowerCase()).first();
                if (existing) {
                    alert('El nombre de usuario ya existe');
                    return;
                }
                await db.users.add({
                    ...formData,
                    username: formData.username!.toLowerCase()
                } as User);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ username: '', name: '', password: '', role: 'cashier' });
            loadUsers();
        } catch (err) {
            console.error('Save error:', err);
            alert('Error al guardar el usuario');
        }
    };

    const [deleteError, setDeleteError] = useState<string | null>(null);

    const deleteUser = async (id: number) => {
        const userToDelete = users.find(u => u.id === id);

        // Solo bloquear si es el último administrador
        if (userToDelete?.role === 'admin') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                setDeleteError('No puedes eliminar el único administrador del sistema. Crea otro administrador primero.');
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black font-outfit glow-text tracking-tight uppercase">Gestión de Personal</h2>
                    <p className="text-text-secondary text-sm">Control de accesos y roles de AM LICORES</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ username: '', name: '', password: '', role: 'cashier' });
                        setShowModal(true);
                    }}
                    className="btn btn-primary h-12 px-6 shadow-glow font-black uppercase tracking-widest text-[10px]"
                >
                    <UserPlus size={18} /> Nuevo Usuario
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card glass border-primary/20 bg-primary/5 p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center shadow-glow">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">Total Personal</p>
                        <p className="text-3xl font-black font-outfit leading-none mt-1">{users.length}</p>
                    </div>
                </div>

                <div className="card glass border-secondary/20 bg-secondary/5 p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] text-secondary font-black uppercase tracking-widest">Administradores</p>
                        <p className="text-3xl font-black font-outfit leading-none mt-1">{users.filter(u => u.role === 'admin').length}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" size={20} />
                <input
                    type="text"
                    placeholder="BUSCAR POR NOMBRE O USUARIO..."
                    className="input pl-16 h-14 bg-bg-surface-light/30 border-white/5 focus:border-primary/50 text-xs font-bold tracking-widest uppercase transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(u => (
                    <div key={u.id} className="card glass border-white/10 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden h-48 flex flex-col justify-between">
                        {/* Status Light */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="p-6 relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black font-outfit text-xl ${u.role === 'admin' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                                    }`}>
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingUser(u);
                                            setFormData(u);
                                            setShowModal(true);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg text-text-muted transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(u.id!);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-danger/20 hover:text-danger rounded-lg text-text-muted transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-black font-outfit text-lg tracking-tight uppercase">{u.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {u.role === 'admin' ? <Shield size={12} className="text-secondary" /> : <UserCheck size={12} className="text-primary" />}
                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${u.role === 'admin' ? 'text-secondary' : 'text-primary'}`}>
                                        {u.role === 'admin' ? 'Administrador' : 'Cajero'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex justify-between items-center relative z-10">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">USUARIO: {u.username}</span>
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-[9px] text-success font-black uppercase tracking-tighter">Activo</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <form onSubmit={handleSave} className="card w-full max-w-md relative z-10 p-0 overflow-hidden border-primary/20">
                        <div className="p-1 w-full bg-gradient-to-r from-primary via-secondary to-primary"></div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">
                                    {editingUser ? 'Modificar Perfil' : 'Alta de Personal'}
                                </h3>
                                <button type="button" onClick={() => setShowModal(false)} className="text-text-muted hover:text-danger p-2 hover:bg-white/5 rounded-full transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            className="input h-14 bg-white/5 border-white/10 font-bold"
                                            placeholder="Nombre completo"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Usuario ID</label>
                                        <input
                                            required
                                            type="text"
                                            className="input h-14 bg-white/5 border-white/10 font-bold lowercase"
                                            placeholder="ej: juanp"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            disabled={!!editingUser}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Nivel Acceso</label>
                                        <select
                                            className="input h-14 bg-white/5 border-white/10 font-bold uppercase text-xs"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                        >
                                            <option value="cashier">Cajero</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">
                                        {editingUser ? 'Nueva Contraseña (opcional)' : 'Establecer Contraseña'}
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            required={!editingUser}
                                            type="password"
                                            className="input pl-12 h-14 bg-white/5 border-white/10 font-bold"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full h-14 text-sm font-black uppercase tracking-widest mt-4 shadow-glow active:scale-95 transition-all">
                                {editingUser ? 'ACTUALIZAR DATOS' : 'FINALIZAR REGISTRO'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm !== null && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { setShowDeleteConfirm(null); setDeleteError(null); }}></div>
                    <div className="card w-full max-w-sm relative z-10 p-8 border-danger/30 text-center space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-2 border border-danger/20">
                            <Trash2 size={40} className="animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">Confirmar Eliminación</h3>
                            <p className="text-text-muted text-sm mt-2 font-bold">Esta acción no se puede deshacer. El usuario perderá el acceso inmediatamente.</p>
                        </div>

                        {deleteError && (
                            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-left">
                                <p className="text-warning text-xs font-black uppercase tracking-wide">⚠ Acción Bloqueada</p>
                                <p className="text-warning/80 text-xs mt-1 font-bold">{deleteError}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteConfirm(null); setDeleteError(null); }}
                                className="btn btn-secondary flex-1 py-4 font-black uppercase text-xs tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => deleteUser(showDeleteConfirm)}
                                className="btn bg-danger text-white flex-1 py-4 font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-danger-dark active:scale-95 transition-all"
                            >
                                ELIMINAR
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default UserModule;
