import React, { useState, useEffect } from 'react';
import { db, type CashControl, type User } from '../db/database';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { useToast } from '../components/Toast';

interface CashModuleProps {
    currentUser: User;
}

const CashModule: React.FC<CashModuleProps> = ({ currentUser }) => {
    const [cashRecords, setCashRecords] = useState<CashControl[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState<number>(0);
    const [notes, setNotes] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        const records = await db.cashControl.toArray();
        setCashRecords(records);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await db.cashControl.add({
                type,
                timestamp: new Date().toISOString(),
                userId: currentUser.id!,
                userName: currentUser.name,
                amount,
                notes
            });
            showToast('Registro guardado exitosamente', 'success');
            setShowModal(false);
            setAmount(0);
            setNotes('');
            loadRecords();
        } catch (error: any) {
            console.error('Save error details:', error);
            alert(`Error al guardar: ${error?.message || JSON.stringify(error)}`);
            showToast('Error al guardar el registro', 'error');
        }
    };

    const formatCOP = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const totalIncome = cashRecords.filter(r => r.type === 'income').reduce((a, b) => a + b.amount, 0);
    const totalExpense = cashRecords.filter(r => r.type === 'expense').reduce((a, b) => a + b.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-outfit glow-text">Caja y Gastos</h2>
                    <p className="text-text-secondary">Control de egresos, ingresos manuales y base de caja</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                >
                    <Plus size={20} /> Nuevo Movimiento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-success/5 border-success/20 flex flex-col justify-center gap-1 relative overflow-hidden p-6 h-36">
                    <div className="absolute -right-6 -bottom-6 text-success opacity-10 pointer-events-none transform -rotate-12 transition-transform duration-500 hover:rotate-0"><ArrowUpRight size={140} strokeWidth={1} /></div>
                    <div className="z-10 flex items-center gap-2 mb-2">
                        <div className="p-2 bg-success/10 rounded-lg"><ArrowUpRight size={18} className="text-success" /></div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Ingresos / Base</p>
                    </div>
                    <div className="z-10">
                        <p className="text-4xl font-bold font-outfit text-success drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">{formatCOP(totalIncome)}</p>
                    </div>
                </div>
                <div className="card bg-danger/5 border-danger/20 flex flex-col justify-center gap-1 relative overflow-hidden p-6 h-36">
                    <div className="absolute -right-6 -bottom-6 text-danger opacity-10 pointer-events-none transform rotate-12 transition-transform duration-500 hover:rotate-0"><ArrowDownRight size={140} strokeWidth={1} /></div>
                    <div className="z-10 flex items-center gap-2 mb-2">
                        <div className="p-2 bg-danger/10 rounded-lg"><ArrowDownRight size={18} className="text-danger" /></div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Egresos</p>
                    </div>
                    <div className="z-10">
                        <p className="text-4xl font-bold font-outfit text-danger drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">{formatCOP(totalExpense)}</p>
                    </div>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-text-muted text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-bold">Fecha</th>
                            <th className="px-6 py-4 font-bold">Tipo</th>
                            <th className="px-6 py-4 font-bold">Concepto</th>
                            <th className="px-6 py-4 font-bold">Usuario</th>
                            <th className="px-6 py-4 font-bold text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {cashRecords.map(r => (
                            <tr key={r.id} className="hover:bg-white/2 transition-colors">
                                <td className="px-6 py-4 text-sm">{new Date(r.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] items-center gap-1 font-bold uppercase inline-flex ${r.type === 'expense' ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                                        {r.type === 'expense' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                        {r.type === 'expense' ? 'Egreso' : 'Ingreso'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">{r.notes || 'N/A'}</td>
                                <td className="px-6 py-4 text-text-muted">{r.userName || 'Sistema'}</td>
                                <td className={`px-6 py-4 text-right font-bold ${r.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                                    {formatCOP(r.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <form onSubmit={handleSave} className="card w-full max-w-sm relative z-10 p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold font-outfit">Nuevo Movimiento</h3>
                        </div>

                        <div className="flex bg-bg-surface border border-white/10 rounded-xl overflow-hidden p-1">
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${type === 'expense' ? 'bg-danger text-white' : 'text-text-muted hover:text-white'}`}
                            >
                                Egreso
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${type === 'income' ? 'bg-success text-black' : 'text-text-muted hover:text-white'}`}
                            >
                                Base / Ingreso
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-text-muted">Monto</label>
                            <input required type="number" className="input" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-text-muted">Concepto</label>
                            <input required type="text" placeholder="Pago a proveedores, Hielo, Base extra..." className="input" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setShowModal(false)} className="btn bg-white/5 border-white/10 flex-1 py-3 text-xs">CANCELAR</button>
                            <button type="submit" className="btn btn-primary flex-1 py-3 text-xs">REGISTRAR</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CashModule;
