import React, { useState, useEffect } from 'react';
import { db, type Product } from '../db/database';
import { useToast } from '../components/Toast';
import {
    Package,
    AlertTriangle,
    ArrowUpRight,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    TrendingDown
} from 'lucide-react';

const InventoryModule: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
    const [showWasteModal, setShowWasteModal] = useState<Product | null>(null);
    const [wasteData, setWasteData] = useState({ quantity: 1, reason: '' });
    const { showToast } = useToast();

    // Form state
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        category: 'Cervezas',
        priceBottle: 0,
        priceShot: 0,
        stock: 0,
        stockMin: 5,
        trackShots: false,
        shotsPerBottle: 29
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const all = await db.products.toArray();
        setProducts(all);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            await db.products.update(editingProduct.id!, formData);
        } else {
            await db.products.add(formData as Product);
        }
        setShowAddModal(false);
        setEditingProduct(null);
        setFormData({ name: '', category: 'Cervezas', priceBottle: 0, priceShot: 0, stock: 0, stockMin: 5 });
        loadProducts();
    };

    const deleteProduct = async (id: number) => {
        await db.products.delete(id);
        setShowDeleteConfirm(null);
        loadProducts();
        showToast('Producto eliminado', 'success');
    };

    const handleRegisterWaste = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showWasteModal) return;

        try {
            // Registrar Merma
            await db.waste.add({
                productId: showWasteModal.id!,
                productName: showWasteModal.name,
                quantity: wasteData.quantity,
                reason: wasteData.reason,
                timestamp: new Date().toISOString()
            });

            // Descontar del inventario
            await db.products.update(showWasteModal.id!, {
                stock: Math.max(0, showWasteModal.stock - wasteData.quantity)
            });

            showToast('Merma registrada y stock actualizado', 'warning');
            setShowWasteModal(null);
            setWasteData({ quantity: 1, reason: '' });
            loadProducts();
        } catch (error: any) {
            console.error('Waste submit error:', error);
            alert(`Error al registrar merma: ${error?.message || JSON.stringify(error)}`);
            showToast('Error al registrar merma', 'error');
        }
    };

    const categories = ['Todos', 'Cervezas', 'Licores', 'Cocteles', 'Bebidas sin alcohol', 'Snacks'];

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    const lowStock = products.filter(p => p.stock <= p.stockMin);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-outfit glow-text">Inventario</h2>
                    <p className="text-text-secondary">Gestiona tus productos y niveles de stock</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({ name: '', category: 'Cervezas', priceBottle: 0, priceShot: 0, stock: 0, stockMin: 5 });
                        setShowAddModal(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* Low Stock Alert Banner */}
            {lowStock.length > 0 && (
                <div className="border border-danger/30 bg-danger/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center backdrop-blur-sm animate-in fade-in">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="p-2 bg-danger/20 text-danger rounded-xl">
                            <AlertTriangle size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-danger font-black text-xs uppercase tracking-widest">Stock Bajo</p>
                            <p className="text-danger/70 text-[10px] font-bold">{lowStock.length} producto(s) requieren reorden</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowStock.map(p => (
                            <span key={p.id} className="px-3 py-1 bg-danger/10 border border-danger/20 rounded-xl text-[10px] font-black text-danger uppercase tracking-wide">
                                {p.name} · {Math.floor(p.stock)} uds.
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Mini */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-primary/10 border-primary/20 flex items-center gap-4">
                    <div className="p-3 bg-primary text-black rounded-xl">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase">Total Productos</p>
                        <p className="text-2xl font-bold font-outfit">{products.length}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{products.reduce((acc, p) => acc + Math.floor(p.stock), 0)} unidades en stock</p>
                    </div>
                </div>

                <div className="card bg-danger/10 border-danger/20 flex items-center gap-4">
                    <div className="p-3 bg-danger text-white rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase">Stock Bajo</p>
                        <p className="text-2xl font-bold font-outfit">{lowStock.length}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{lowStock.length === 0 ? 'Inventario óptimo' : 'Requieren reorden'}</p>
                    </div>
                </div>

                <div className="card bg-secondary/10 border-secondary/20 flex items-center gap-4">
                    <div className="p-3 bg-secondary text-white rounded-xl">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase">Valor Inventario</p>
                        <p className="text-2xl font-bold font-outfit">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                                .format(products.reduce((acc, p) => acc + (p.priceBottle * p.stock), 0))}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">Precio botella × stock</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="space-y-3">
                <div className="card p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="input pl-12 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="btn btn-secondary py-2 px-4 text-xs font-bold uppercase flex items-center gap-2"
                        >
                            <X size={14} /> Limpiar
                        </button>
                    )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex flex-wrap gap-2 px-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${categoryFilter === cat
                                ? 'bg-primary text-black border-primary shadow-glow'
                                : 'bg-white/5 text-text-muted border-white/10 hover:border-primary/40 hover:text-white'
                                }`}
                        >
                            {cat}
                            {cat !== 'Todos' && (
                                <span className="ml-2 opacity-60">
                                    ({products.filter(p => p.category === cat).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-text-muted text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Producto</th>
                                <th className="px-6 py-4 font-bold">Categoría</th>
                                <th className="px-6 py-4 font-bold text-right">Precios</th>
                                <th className="px-6 py-4 font-bold text-center">Stock</th>
                                <th className="px-6 py-4 font-bold text-center">Estado</th>
                                <th className="px-6 py-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                                    <td className="px-6 py-4 font-bold">{p.name}</td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{p.category}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-sm font-bold">${p.priceBottle.toLocaleString()}</div>
                                        {p.priceShot && <div className="text-[10px] text-text-muted">Trago: ${p.priceShot.toLocaleString()}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-center font-outfit">
                                        {p.trackShots ? p.stock.toFixed(2) : Math.floor(p.stock)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.stock <= p.stockMin ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                                            {p.stock <= p.stockMin ? 'Reordenar' : 'Óptimo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingProduct(p);
                                                    setFormData(p);
                                                    setShowAddModal(true);
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-primary"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowWasteModal(p);
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-warning"
                                                title="Registrar Merma"
                                            >
                                                <TrendingDown size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDeleteConfirm(p.id!);
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-danger"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <form onSubmit={handleSave} className="card w-full max-w-sm relative z-10 p-5 space-y-4 border-primary/20 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold font-outfit flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                                    {editingProduct ? <Edit2 size={16} /> : <Plus size={16} />}
                                </div>
                                {editingProduct ? 'Editar' : 'Nuevo'} Producto
                            </h3>
                            <button type="button" onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-danger transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="label text-[10px] uppercase font-bold tracking-widest">Información Básica</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Nombre del Producto"
                                    className="input mb-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                <select
                                    className="input"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                >
                                    <option>Cervezas</option>
                                    <option>Licores</option>
                                    <option>Cocteles</option>
                                    <option>Bebidas sin alcohol</option>
                                    <option>Snacks</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label text-[10px] uppercase font-bold">Precio Bot.</label>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                                        <input
                                            required
                                            type="number"
                                            className="input pl-6"
                                            value={formData.priceBottle}
                                            onChange={e => setFormData({ ...formData, priceBottle: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label text-[10px] uppercase font-bold">Stock Inicial</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="input"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="bg-bg-surface-light/50 border border-white/5 p-3 rounded-xl space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="trackShots"
                                        className="w-4 h-4 accent-primary"
                                        checked={formData.trackShots}
                                        onChange={e => setFormData({ ...formData, trackShots: e.target.checked })}
                                    />
                                    <label htmlFor="trackShots" className="text-xs font-bold cursor-pointer select-none">Habilitar Venta por Tragos</label>
                                </div>

                                {formData.trackShots && (
                                    <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="label text-[9px] uppercase">Precio Trago</label>
                                            <input
                                                type="number"
                                                className="input py-1.5 px-2 text-xs"
                                                value={formData.priceShot}
                                                onChange={e => setFormData({ ...formData, priceShot: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-[9px] uppercase">Tragos / Botella</label>
                                            <input
                                                type="number"
                                                className="input py-1.5 px-2 text-xs"
                                                value={formData.shotsPerBottle}
                                                onChange={e => setFormData({ ...formData, shotsPerBottle: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="btn btn-secondary flex-1 py-2 text-xs font-bold"
                            >
                                CANCELAR
                            </button>
                            <button type="submit" className="btn btn-primary flex-1 py-2 text-xs font-bold">
                                {editingProduct ? 'ACTUALIZAR' : 'CREAR PRODUCTO'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm !== null && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowDeleteConfirm(null)}></div>
                    <div className="card w-full max-w-sm relative z-10 p-8 border-danger/30 text-center space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-2 border border-danger/20">
                            <Trash2 size={40} className="animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">Eliminar Producto</h3>
                            <p className="text-text-muted text-sm font-bold">Esta acción eliminará el producto del inventario permanentemente.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="btn btn-secondary flex-1 py-4 font-black uppercase text-xs tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => deleteProduct(showDeleteConfirm)}
                                className="btn bg-danger text-white flex-1 py-4 font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-danger-dark"
                            >
                                ELIMINAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Mermas */}
            {showWasteModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowWasteModal(null)}></div>
                    <form onSubmit={handleRegisterWaste} className="card w-full max-w-sm relative z-10 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold font-outfit uppercase flex items-center gap-2 text-warning">
                                <TrendingDown size={20} /> Registrar Merma
                            </h3>
                        </div>
                        <p className="text-xs text-text-muted">Se descontará del inventario de <b>{showWasteModal.name}</b></p>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-text-muted">Cantidad a descontar</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="input h-12"
                                value={wasteData.quantity}
                                onChange={e => setWasteData({ ...wasteData, quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-text-muted">Motivo / Causa</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej: Botella rota, Degustación, Caducidad..."
                                className="input h-12"
                                value={wasteData.reason}
                                onChange={e => setWasteData({ ...wasteData, reason: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setShowWasteModal(null)} className="btn bg-white/5 flex-1 py-3 text-xs">CANCELAR</button>
                            <button type="submit" className="btn bg-warning text-black font-black flex-1 py-3 text-xs shadow-glow">APLICAR MERMA</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InventoryModule;
