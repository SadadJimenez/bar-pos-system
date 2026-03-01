import React, { useState, useEffect } from 'react';
import { db, type BarTable } from '../db/database';
import {
    Users,
    Clock,
    Plus,
    XCircle,
    Beer,
    CircleDot,
    Trash2
} from 'lucide-react';

interface TableModuleProps {
    onSelectTable: (id: number) => void;
}

const TableModule: React.FC<TableModuleProps> = ({ onSelectTable }) => {
    const [tables, setTables] = useState<BarTable[]>([]);
    const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<BarTable>>({
        number: '',
        capacity: 4,
        status: 'available'
    });

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        const allTables = await db.barTables.toArray();
        setTables(allTables);
    };

    const handleTableClick = (table: BarTable) => {
        onSelectTable(table.id!);
    };

    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.number) return;
        await db.barTables.add(formData as BarTable);
        setShowAddModal(false);
        setFormData({ number: '', capacity: 4, status: 'available' });
        loadTables();
    };

    const handleDeleteTable = async (id: number) => {
        const table = tables.find(t => t.id === id);
        if (table?.status === 'occupied') {
            alert('No se puede eliminar una mesa ocupada');
            return;
        }
        await db.barTables.delete(id);
        setShowDeleteConfirm(null);
        loadTables();
    };

    const filteredTables = tables.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black font-outfit glow-text tracking-tighter uppercase">Plano de Mesas</h2>
                    <p className="text-text-secondary text-sm font-medium mt-1 uppercase tracking-widest opacity-80">Mapa interactivo de AM LICORES</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-black shadow-glow' : 'text-text-muted hover:text-white'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('available')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'available' ? 'bg-success/20 text-success' : 'text-text-muted hover:text-white'}`}
                        >
                            Libres
                        </button>
                        <button
                            onClick={() => setFilter('occupied')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'occupied' ? 'bg-danger/20 text-danger' : 'text-text-muted hover:text-white'}`}
                        >
                            Ocupadas
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white/2 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success"></span>
                            <span>Libre</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-danger"></span>
                            <span>Ocupada</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredTables.map(table => (
                    <div
                        key={table.id}
                        className={`group relative h-56 card p-0 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] active:scale-95 ${table.status === 'occupied'
                            ? 'border-danger/30 bg-danger/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                            : 'border-success/30 bg-success/5 hover:border-primary/50'
                            }`}
                        onClick={() => handleTableClick(table)}
                    >
                        {/* Status Bar Background */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${table.status === 'occupied' ? 'bg-danger' : 'bg-success'}`}></div>

                        <div className="p-6 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl font-outfit shadow-2xl transition-transform duration-500 group-hover:scale-110 ${table.status === 'occupied' ? 'bg-danger text-white' : 'bg-success text-white'
                                        }`}>
                                        {table.number}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <CircleDot size={10} className={table.status === 'occupied' ? 'text-danger' : 'text-success'} />
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${table.status === 'occupied' ? 'text-danger' : 'text-success'}`}>
                                            {table.status === 'occupied' ? 'En Servicio' : 'Disponible'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(table.id!);
                                    }}
                                    className="p-2 text-text-muted hover:text-danger transition-colors hover:bg-danger/10 rounded-xl"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Users size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{table.capacity} Personas</span>
                                    </div>
                                    {table.status === 'occupied' && (
                                        <div className="flex items-center gap-1.5 text-danger font-black text-[10px] uppercase animate-pulse">
                                            <Clock size={14} />
                                            <span>24:15m</span>
                                        </div>
                                    )}
                                </div>

                                {table.status === 'occupied' ? (
                                    <div className="flex items-center justify-between gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl">
                                        <span className="text-[10px] font-black uppercase text-danger tracking-widest">Cuenta Activa</span>
                                        <Beer size={16} className="text-danger" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 group-hover:border-primary/30 rounded-xl transition-all">
                                        <Plus size={14} className="group-hover:text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary">Abrir Orden</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Sparkle Effect on Occupied */}
                        {table.status === 'occupied' && (
                            <div className="absolute top-0 right-0 p-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,1)] animate-ping"></div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Table Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="h-56 card border-dashed border-white/10 hover:border-primary/50 bg-white/2 hover:bg-white/5 flex flex-col items-center justify-center gap-4 transition-all group p-0"
                >
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-all duration-500 group-hover:rotate-90">
                        <Plus size={32} />
                    </div>
                    <div className="text-center">
                        <span className="block text-text-muted font-black text-xs uppercase tracking-widest group-hover:text-primary transition-colors">Añadir Mesa</span>
                        <span className="text-[9px] text-text-muted/50 uppercase font-bold tracking-tighter">Nueva Ubicación</span>
                    </div>
                </button>
            </div>

            {/* Add Table Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <form onSubmit={handleAddTable} className="card w-full max-w-sm relative z-10 p-0 overflow-hidden border-primary/20">
                        <div className="p-1 w-full bg-gradient-to-r from-primary to-secondary"></div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">Nueva Mesa</h3>
                                <button type="button" onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-danger pb-2">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Identificador / Número</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Mesa 10 o VIP 2"
                                        className="input h-14 bg-white/5 border-white/10 font-bold uppercase"
                                        value={formData.number}
                                        onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Capacidad (Personas)</label>
                                    <input
                                        required
                                        type="number"
                                        className="input h-14 bg-white/5 border-white/10 font-bold"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full h-14 font-black uppercase tracking-widest shadow-glow">
                                REGISTRAR UBICACIÓN
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm !== null && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowDeleteConfirm(null)}></div>
                    <div className="card w-full max-w-sm relative z-10 p-8 border-danger/30 text-center space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-2 border border-danger/20">
                            <Trash2 size={40} className="animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">¿Eliminar Mesa?</h3>
                            <p className="text-text-muted text-sm font-bold">Esta mesa se borrará permanentemente del plano. Solo puedes borrar mesas que no estén en servicio.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="btn btn-secondary flex-1 py-4 font-black uppercase text-xs tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteTable(showDeleteConfirm)}
                                className="btn bg-danger text-white flex-1 py-4 font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-danger-dark"
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

export default TableModule;
