import React, { useState, useEffect } from 'react';
import { db, type Product, type SaleItem, type User, type BarTable } from '../db/database';
import ProductCard from '../components/ProductCard';
import { useToast } from '../components/Toast';
import {
    Search,
    Trash2,
    Minus,
    Plus,
    CreditCard,
    Banknote,
    Smartphone,
    Split,
    ChevronRight,
    Receipt,
    ShoppingCart,
    ArrowLeft,
    Save
} from 'lucide-react';

interface POSProps {
    currentUser: User;
    tableId: number | null;
    onClose: () => void;
}

const POSModule: React.FC<POSProps> = ({ currentUser, tableId, onClose }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [currentTable, setCurrentTable] = useState<BarTable | null>(null);
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0);
    const [splitCount, setSplitCount] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const init = async () => {
            await loadProducts();
            if (tableId) {
                const table = await db.barTables.get(tableId);
                if (table) {
                    setCurrentTable(table);
                    const order = await db.orders.where('tableId').equals(tableId).and(o => o.status !== 'paid').first();
                    if (order) {
                        setCart(order.items);
                    }
                }
            }
        };
        init();
    }, [tableId]);

    const loadProducts = async () => {
        const allProducts = await db.products.toArray();
        setProducts(allProducts);
        const cats = ['Todos', ...new Set(allProducts.map(p => p.category))];
        setCategories(cats);
    };
    const checkStockAvailability = (product: Product, type: 'bottle' | 'shot', additionalQty: number) => {
        const bottleItem = cart.find(i => i.productId === product.id && i.type === 'bottle');
        const shotItem = cart.find(i => i.productId === product.id && i.type === 'shot');

        const currentBottles = bottleItem ? bottleItem.quantity : 0;
        const currentShots = shotItem ? shotItem.quantity : 0;

        let requestedStock = currentBottles;
        if (product.shotsPerBottle) {
            requestedStock += currentShots / product.shotsPerBottle;
        }

        if (type === 'bottle') {
            requestedStock += additionalQty;
        } else if (product.shotsPerBottle) {
            requestedStock += additionalQty / product.shotsPerBottle;
        }

        return requestedStock <= product.stock;
    };

    const addToCart = (product: Product, type: 'bottle' | 'shot') => {
        if (!checkStockAvailability(product, type, 1)) {
            showToast(`Stock insuficiente. Solo hay ${Math.floor(product.stock)} uds. físicas de ${product.name}`, 'error');
            return;
        }

        const cartItem = cart.find(item => item.productId === product.id && item.type === type);
        if (cartItem) {
            setCart(cart.map(item =>
                (item.productId === product.id && item.type === type)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id!,
                productName: product.name,
                type: type,
                price: type === 'bottle' ? product.priceBottle : product.priceShot!,
                quantity: 1
            }]);
        }
    };

    const removeFromCart = (productId: number, type: 'bottle' | 'shot') => {
        setCart(cart.filter(item => !(item.productId === productId && item.type === type)));
    };

    const updateQuantity = (productId: number, type: 'bottle' | 'shot', delta: number) => {
        if (delta > 0) {
            const product = products.find(p => p.id === productId);
            if (product && !checkStockAvailability(product, type, delta)) {
                showToast(`Stock insuficiente. Solo hay ${Math.floor(product.stock)} uds. físicas de ${product.name}`, 'error');
                return;
            }
        }

        setCart(cart.map(item => {
            if (item.productId === productId && item.type === type) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotal = cartSubtotal - discount;

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCartUnitName = (item: SaleItem) => {
        if (item.type === 'shot') return 'Trago';
        const productItem = products.find(p => p.id === item.productId);
        switch (productItem?.category) {
            case 'Licores': return 'Botella';
            case 'Cocteles': return 'Coctel';
            case 'Snacks': return 'Snack';
            case 'Cervezas': return 'Unidad';
            case 'Bebidas sin alcohol': return 'Unidad';
            default: return 'Unidad';
        }
    };


    const handlePrintTicket = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const ticketContent = `
            <html>
                <head>
                    <title>Ticket - AM LICORES</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; width: 300px; padding: 20px; }
                        h1 { text-align: center; font-size: 1.2rem; margin-bottom: 5px; }
                        p { font-size: 0.8rem; margin: 2px 0; }
                        table { width: 100%; border-top: 1px dashed #000; margin-top: 10px; }
                        th { text-align: left; }
                        .total { border-top: 1px dashed #000; margin-top: 10px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>AM LICORES</h1>
                    <p>Cliente: ${currentTable?.number || 'Mostrador'}</p>
                    <p>Fecha: ${new Date().toLocaleString()}</p>
                    <p>Atendido por: ${currentUser.name}</p>
                    <table>
                        <thead>
                            <tr><th>Cant</th><th>Item</th><th>Sub</th></tr>
                        </thead>
                        <tbody>
                            ${cart.map(i => `<tr><td>${i.quantity}</td><td>${i.productName}</td><td>$${(i.price * i.quantity).toLocaleString()}</td></tr>`).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        <p>Total: $${cartTotal.toLocaleString()}</p>
                    </div>
                    <p style="text-align:center; margin-top: 20px;">¡Gracias por su visita!</p>
                </body>
            </html>
        `;
        printWindow.document.write(ticketContent);
        printWindow.document.close();
        printWindow.print();
    };

    const handleSaveOrder = async () => {
        if (!tableId) return;

        const order = await db.orders.where('tableId').equals(tableId).and(o => o.status !== 'paid').first();

        if (order) {
            await db.orders.update(order.id!, { items: cart, total: cartTotal });
        } else {
            await db.orders.add({
                tableId,
                items: cart,
                status: 'pending',
                timestamp: new Date(),
                total: cartTotal
            });
            await db.barTables.update(tableId, { status: 'occupied' });
        }

        showToast('Orden guardada correctamente', 'success');
        onClose();
    };

    const handleFinishSale = async (method: 'cash' | 'card' | 'transfer') => {
        const sale = {
            timestamp: new Date(),
            userId: currentUser.id!,
            userName: currentUser.name,
            total: cartTotal,
            discount: discount,
            paymentMethod: method,
            items: cart,
            splitCount: splitCount
        };

        await db.sales.add(sale);

        // Actualizar orden exisente a PAGADA
        if (tableId) {
            const order = await db.orders.where('tableId').equals(tableId).and(o => o.status !== 'paid').first();
            if (order) {
                await db.orders.update(order.id!, { status: 'paid' });
            }
            await db.barTables.update(tableId, { status: 'available' });
        }

        // Descontar inventario
        for (const item of cart) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                let reduction = item.quantity;
                if (item.type === 'shot' && product.shotsPerBottle) {
                    reduction = item.quantity / product.shotsPerBottle;
                }

                await db.products.update(product.id!, {
                    stock: Math.max(0, product.stock - reduction)
                });
            }
        }

        setCart([]);
        setDiscount(0);
        setSplitCount(1);
        setShowPaymentModal(false);
        showToast('¡Venta realizada con éxito!', 'success');
        if (tableId) {
            onClose();
        } else {
            loadProducts();
        }
    };

    return (
        <div className="pos-grid">
            {/* Left: Product Selection */}
            <div className="flex flex-col gap-6 overflow-hidden">
                {/* Top Bar: Search & Categories */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-3 bg-bg-surface-light hover:bg-white/10 rounded-2xl text-text-muted hover:text-white transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold font-outfit">
                                {currentTable ? `Cliente: ${currentTable.number}` : 'Venta de Mostrador'}
                            </h2>
                            <p className="text-xs text-text-muted">Atendido por {currentUser.name}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="input pl-12 h-14 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-3 rounded-xl font-outfit font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-primary text-black'
                                    : 'bg-bg-surface-light text-text-secondary hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAdd={addToCart}
                        />
                    ))}
                </div>
            </div>

            {/* Right: Cart Summary */}
            <div className="glass rounded-3xl flex flex-col overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold font-outfit flex items-center gap-2">
                        <Receipt className="text-primary" /> Carrito
                    </h2>
                    <span className="text-xs text-text-muted bg-white/10 px-3 py-1 rounded-full">
                        {cart.length} productos
                    </span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                            <ShoppingCart size={48} className="mb-4" />
                            <p>El carrito está vacío</p>
                        </div>
                    ) : cart.map((item, idx) => (
                        <div key={`${item.productId}-${item.type}-${idx}`} className="bg-bg-surface-light p-4 rounded-2xl flex flex-col gap-3 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-sm">{item.productName}</h4>
                                    <p className="text-[10px] uppercase text-text-muted tracking-wider">
                                        {getCartUnitName(item)} • ${item.price.toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.productId, item.type)}
                                    className="text-text-muted hover:text-danger p-1 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center font-outfit">
                                <div className="flex items-center gap-3 bg-bg-dark rounded-lg p-1 border border-white/5">
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.type, -1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.type, 1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <span className="font-bold text-primary">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer: Totals */}
                <div className="p-6 bg-bg-dark/50 border-t border-white/10 space-y-4">
                    <div className="space-y-2 text-sm text-text-secondary">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${cartSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Descuento</span>
                            <input
                                type="number"
                                className="bg-transparent border-b border-white/10 w-20 text-right focus:border-primary outline-none text-text-primary"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="py-4 border-t border-white/10">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-text-secondary font-medium">TOTAL A PAGAR</span>
                            <span className="text-2xl font-bold font-outfit text-primary glow-text">
                                ${cartTotal.toLocaleString()}
                            </span>
                        </div>
                        {splitCount > 1 && (
                            <div className="flex justify-between text-xs text-secondary font-bold">
                                <span>Por persona ({splitCount})</span>
                                <span>${(cartTotal / splitCount).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setSplitCount(prev => prev > 1 ? prev - 1 : 1)}
                            className="btn btn-secondary py-3 text-xs"
                            disabled={cart.length === 0}
                        >
                            <Split size={16} className="mr-1" /> Juntar
                        </button>
                        <button
                            onClick={() => setSplitCount(prev => prev + 1)}
                            className="btn btn-secondary py-3 text-xs"
                            disabled={cart.length === 0}
                        >
                            <Split size={16} className="mr-1" /> Dividir
                        </button>
                    </div>

                    <button
                        onClick={handlePrintTicket}
                        className="btn btn-secondary w-full py-3 text-sm border-dashed"
                        disabled={cart.length === 0}
                    >
                        <Receipt size={18} className="mr-2 text-primary" /> IMPRIMIR PRE-CUENTA
                    </button>

                    <div className="flex flex-col gap-3">
                        {tableId && (
                            <button
                                onClick={handleSaveOrder}
                                className="btn btn-secondary w-full py-4 text-lg"
                                disabled={cart.length === 0}
                            >
                                <Save size={20} className="mr-2" /> GUARDAR ORDEN
                            </button>
                        )}
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="btn btn-primary w-full py-4 text-lg shadow-glow"
                            disabled={cart.length === 0}
                        >
                            PAGAR AHORA <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
                    <div className="card w-full max-w-md relative z-10 p-8 space-y-6">
                        <h3 className="text-2xl font-bold font-outfit text-center">Método de Pago</h3>
                        <p className="text-center text-text-muted">Total: <span className="text-primary font-bold">${cartTotal.toLocaleString()}</span></p>

                        <div className="grid gap-4">
                            <button
                                onClick={() => handleFinishSale('cash')}
                                className="flex items-center gap-4 p-5 bg-bg-surface-light hover:bg-white/5 border border-white/5 rounded-2xl transition-all"
                            >
                                <div className="w-12 h-12 bg-success/20 text-success rounded-xl flex items-center justify-center">
                                    <Banknote />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Efectivo</p>
                                    <p className="text-xs text-text-muted">Pago en moneda local</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleFinishSale('card')}
                                className="flex items-center gap-4 p-5 bg-bg-surface-light hover:bg-white/5 border border-white/5 rounded-2xl transition-all"
                            >
                                <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center">
                                    <CreditCard />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Tarjeta Débito/Crédito</p>
                                    <p className="text-xs text-text-muted">Visa, Mastercard, etc.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleFinishSale('transfer')}
                                className="flex items-center gap-4 p-5 bg-bg-surface-light hover:bg-white/5 border border-white/5 rounded-2xl transition-all"
                            >
                                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                                    <Smartphone />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Transferencia</p>
                                    <p className="text-xs text-text-muted">Nequi, Daviplata, Bancos</p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="w-full py-3 text-text-muted hover:text-white"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSModule;
