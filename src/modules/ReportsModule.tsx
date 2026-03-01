import React, { useState, useEffect } from 'react';
import { db, type Sale } from '../db/database';
import {
    TrendingUp,
    DollarSign,
    Download,
    Calendar,
    PieChart,
    ShoppingBag,
    Clock,
    CreditCard,
    AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, startOfDay, startOfWeek, startOfMonth, subDays } from 'date-fns';
import { useToast } from '../components/Toast';

type DateFilter = 'today' | 'week' | 'month' | '7days' | 'all';

const ReportsModule: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [dateFilter, setDateFilter] = useState<DateFilter>('today');
    const [stats, setStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        avgTicket: 0,
        mostSoldProduct: '',
        bestPaymentMethod: ''
    });
    const { showToast } = useToast();

    useEffect(() => {
        loadSales();
    }, [dateFilter]);

    const getDateRange = (): Date => {
        const now = new Date();
        switch (dateFilter) {
            case 'today': return startOfDay(now);
            case 'week': return startOfWeek(now, { weekStartsOn: 1 });
            case 'month': return startOfMonth(now);
            case '7days': return subDays(now, 7);
            case 'all': return new Date(0);
        }
    };

    const loadSales = async () => {
        const allSales = await db.sales.toArray();
        const fromDate = getDateRange();
        const filtered = allSales.filter(s => new Date(s.timestamp) >= fromDate);
        setSales(filtered);
        calculateStats(filtered);
    };

    const calculateStats = (data: Sale[]) => {
        const revenue = data.reduce((acc, s) => acc + s.total, 0);

        const productCounts: { [key: string]: number } = {};
        data.forEach(s => {
            s.items.forEach(item => {
                productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
            });
        });
        const entries = Object.entries(productCounts);
        const mostSold = entries.length > 0 ? entries.sort((a, b) => b[1] - a[1])[0]?.[0] : 'N/A';

        const paymentCounts: { [key: string]: number } = {};
        data.forEach(s => {
            paymentCounts[s.paymentMethod] = (paymentCounts[s.paymentMethod] || 0) + s.total;
        });
        const bestPaymentEntry = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0];
        const bestPayment = bestPaymentEntry ? bestPaymentEntry[0] : 'N/A';

        setStats({
            totalSales: data.length,
            totalRevenue: revenue,
            avgTicket: data.length > 0 ? revenue / data.length : 0,
            mostSoldProduct: mostSold,
            bestPaymentMethod: bestPayment
        });
    };

    const formatCOP = (value: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

    const exportToExcel = () => {
        if (sales.length === 0) {
            showToast('No hay ventas para exportar en este período', 'warning');
            return;
        }

        const dataToExport = sales.map(s => ({
            ID: s.id,
            Fecha: format(new Date(s.timestamp), 'yyyy-MM-dd HH:mm'),
            Usuario: s.userName,
            Total: s.total,
            Descuento: s.discount,
            MetodoPago: s.paymentMethod === 'cash' ? 'Efectivo' : s.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia',
            Items: s.items.map(i => `${i.productName} (${i.type} x${i.quantity})`).join(', ')
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");
        XLSX.writeFile(wb, `Reporte_Ventas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        showToast(`Exportado: ${sales.length} ventas`, 'success');
    };

    const filterLabels: Record<DateFilter, string> = {
        today: 'Hoy',
        week: 'Esta Semana',
        month: 'Este Mes',
        '7days': 'Últimos 7 días',
        all: 'Todo el tiempo'
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black font-outfit glow-text uppercase tracking-tight">Panel AM LICORES</h2>
                    <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest opacity-70">Análisis y rendimiento del establecimiento</p>
                </div>
                <button
                    onClick={exportToExcel}
                    className="btn btn-secondary py-2 text-primary border border-primary/20 hover:bg-primary/5 text-xs uppercase font-bold"
                >
                    <Download size={18} /> Exportar Excel
                </button>
            </div>

            {/* Date Filter Chips */}
            <div className="flex flex-wrap gap-2">
                {(Object.keys(filterLabels) as DateFilter[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setDateFilter(f)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${dateFilter === f
                            ? 'bg-primary text-black border-primary shadow-glow'
                            : 'bg-white/5 text-text-muted border-white/10 hover:border-primary/40 hover:text-white'
                            }`}
                    >
                        <Calendar size={12} />
                        {filterLabels[f]}
                    </button>
                ))}
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Ingresos Totales', value: formatCOP(stats.totalRevenue), icon: DollarSign, color: 'primary' },
                    { label: 'Ventas Realizadas', value: stats.totalSales.toString(), icon: ShoppingBag, color: 'secondary' },
                    { label: 'Ticket Promedio', value: formatCOP(Math.round(stats.avgTicket)), icon: TrendingUp, color: 'success' },
                    { label: 'Producto Estrella', value: stats.mostSoldProduct || 'Ninguno', icon: PieChart, color: 'warning' }
                ].map((stat, i) => (
                    <div key={i} className={`card p-5 group hover:scale-[1.01] transition-all border-${stat.color}/20 bg-${stat.color}/5 relative overflow-hidden flex flex-col justify-between h-32`}>
                        <div className={`absolute -right-3 -bottom-3 opacity-5 text-${stat.color} group-hover:opacity-15 transition-opacity pointer-events-none`}>
                            <stat.icon size={80} strokeWidth={0.5} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <div className={`p-1.5 bg-${stat.color}/10 text-${stat.color} rounded-lg`}>
                                    <stat.icon size={18} />
                                </div>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border border-${stat.color}/20 text-${stat.color} uppercase tracking-tighter`}>
                                    {filterLabels[dateFilter]}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-bold font-outfit text-${stat.color} glow-text truncate leading-tight`}>{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions Table */}
                <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col border-white/5 shadow-xl">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-secondary" />
                            <h3 className="font-bold font-outfit text-sm text-text-primary uppercase tracking-wider">Transacciones Recientes</h3>
                        </div>
                        <span className="text-[9px] text-text-muted font-bold px-2 py-0.5 bg-white/5 rounded-full border border-white/10 uppercase">
                            {sales.length} registros
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-text-muted uppercase text-[9px] font-black tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Vendedor</th>
                                    <th className="px-6 py-3">Pago</th>
                                    <th className="px-6 py-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sales.length > 0 ? sales.slice(-10).reverse().map(s => (
                                    <tr key={s.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-text-primary">{format(new Date(s.timestamp), 'dd/MM')}</p>
                                            <p className="text-[10px] text-text-muted">{format(new Date(s.timestamp), 'HH:mm')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-text-secondary font-medium">{s.userName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${s.paymentMethod === 'cash' ? 'bg-success/10 text-success' :
                                                s.paymentMethod === 'card' ? 'bg-secondary/10 text-secondary' :
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                {s.paymentMethod === 'cash' ? 'Efectivo' : s.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-primary">{formatCOP(s.total)}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <AlertTriangle size={32} className="text-text-muted mx-auto mb-3 opacity-30" />
                                            <p className="text-text-muted italic text-sm">Sin actividad en el período seleccionado</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analysis Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Payment Breakdown Card */}
                    <div className="card p-6 border-white/5 shadow-xl bg-bg-surface-light/30">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                            <CreditCard size={18} className="text-primary" />
                            <h3 className="font-bold font-outfit text-sm text-text-primary uppercase tracking-wider">Métodos de Pago</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { method: 'cash', label: 'Efectivo', color: 'success' },
                                { method: 'card', label: 'Tarjeta', color: 'secondary' },
                                { method: 'transfer', label: 'Transferencia', color: 'primary' }
                            ].map(item => {
                                const amount = sales.filter(s => s.paymentMethod === item.method).reduce((acc, s) => acc + s.total, 0);
                                const percent = stats.totalRevenue > 0 ? (amount / stats.totalRevenue) * 100 : 0;
                                return (
                                    <div key={item.method} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-[9px] uppercase font-bold text-text-muted tracking-wide">{item.label}</p>
                                                <p className="text-lg font-bold font-outfit text-text-primary tracking-tight">{formatCOP(amount)}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold text-${item.color}`}>
                                                {Math.round(percent)}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-700 bg-${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Projected Profit */}
                    <div className="card p-6 bg-success/10 border-success/20 overflow-hidden relative group">
                        <div className="absolute right-[-10%] top-[-10%] text-success opacity-5 group-hover:rotate-12 transition-transform">
                            <TrendingUp size={120} />
                        </div>
                        <p className="text-[10px] text-success font-black uppercase tracking-widest mb-1 opacity-60">Utilidad Proyectada</p>
                        <h4 className="text-3xl font-bold font-outfit text-success glow-text">{formatCOP(stats.totalRevenue * 0.4)}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-success/80">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span>Basado en margen del 40% · {filterLabels[dateFilter]}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsModule;
