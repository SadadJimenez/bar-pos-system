import React from 'react';
import { type Product } from '../db/database';
import { Wine, Beer, Coffee, Pizza, Martini } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product, type: 'bottle' | 'shot') => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
    const getIcon = () => {
        switch (product.category) {
            case 'Cervezas': return <Beer size={20} />;
            case 'Licores': return <Wine size={20} />;
            case 'Cocteles': return <Martini size={20} />;
            case 'Bebidas sin alcohol': return <Coffee size={20} />;
            case 'Snacks': return <Pizza size={20} />;
            default: return <Wine size={20} />;
        }
    };

    const getUnitName = () => {
        switch (product.category) {
            case 'Licores': return 'Botella';
            case 'Cocteles': return 'Coctel';
            case 'Snacks': return 'Snack';
            case 'Cervezas': return 'Unidad';
            case 'Bebidas sin alcohol': return 'Unidad';
            default: return 'Unidad';
        }
    };


    return (
        <div className="card h-full flex flex-col p-4 gap-4 group">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-bg-surface-light rounded-xl text-primary group-hover:scale-110 transition-transform">
                    {getIcon()}
                </div>
                <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${product.stock < product.stockMin ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                    {product.stock} en stock
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold font-outfit mb-1">{product.name}</h3>
                <p className="text-xs text-text-muted">{product.category}</p>
            </div>

            <div className="mt-auto flex flex-col gap-2">
                <button
                    onClick={() => onAdd(product, 'bottle')}
                    className="w-full flex justify-between items-center px-4 py-2 bg-bg-surface-light hover:bg-primary hover:text-black rounded-lg transition-all text-sm font-semibold"
                >
                    <span>{getUnitName()}</span>
                    <span>${product.priceBottle.toLocaleString()}</span>
                </button>

                {product.priceShot && (
                    <button
                        onClick={() => onAdd(product, 'shot')}
                        className="w-full flex justify-between items-center px-4 py-2 bg-bg-surface-light hover:bg-secondary hover:text-white rounded-lg transition-all text-sm font-semibold"
                    >
                        <span>Trago</span>
                        <span>${product.priceShot.toLocaleString()}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
