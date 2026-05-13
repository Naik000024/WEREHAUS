import React, { useState } from 'react';
import { createproducts } from '../api';

interface Props { onAction: () => void; }

const ProductRegistry: React.FC<Props> = ({ onAction }) => {
    const [form, setForm] = useState({ 
        name: '', 
        sku: '', 
        price: '0.00',
        initial_stock: '0' 
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // We send 'initial_stock' as part of the product payload
            await createproducts({
                name: form.name,
                sku: form.sku,
                price: parseFloat(form.price) || 0,
                initial_stock: parseInt(form.initial_stock) || 0
            });

            setForm({ name: '', sku: '', price: '0.00', initial_stock: '0' });
            onAction();
            alert("SYSTEM_SYNC: Product and Initial Stock Committed.");
        } catch (err: any) {
            console.error("REGISTRATION_ERROR:", err.response?.data);
            alert("REGISTRATION_FAILED: Check SKU uniqueness.");
        }
    };

    return (
        <div className="p-5 bg-white/5 border border-gray-800 rounded-lg shadow-xl backdrop-blur-sm">
            <h3 className="text-neon-cyan text-[10px] uppercase tracking-[0.3em] mb-4 font-black">
                [ Register_New_SKU ]
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    className="w-full bg-black border border-gray-800 p-2 text-xs text-white focus:border-neon-cyan outline-none transition-all font-mono"
                    placeholder="PRODUCT_NAME"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                />
                <input 
                    className="w-full bg-black border border-gray-800 p-2 text-xs text-white focus:border-neon-cyan outline-none transition-all font-mono"
                    placeholder="SKU_CODE"
                    value={form.sku}
                    onChange={e => setForm({...form, sku: e.target.value})}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <span className="absolute left-2 top-2 text-[10px] text-neon-cyan/50">$</span>
                        <input 
                            type="number"
                            step="0.01"
                            className="w-full bg-black border border-gray-800 p-2 pl-5 text-xs text-white focus:border-neon-cyan outline-none transition-all font-mono"
                            placeholder="PRICE"
                            value={form.price}
                            onChange={e => setForm({...form, price: e.target.value})}
                            required
                        />
                    </div>
                    <input 
                        type="number"
                        className="w-full bg-black border border-gray-800 p-2 text-xs text-white focus:border-neon-cyan outline-none transition-all font-mono"
                        placeholder="STOCK"
                        value={form.initial_stock}
                        onChange={e => setForm({...form, initial_stock: e.target.value})}
                        required
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full bg-neon-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:bg-white transition-all duration-300"
                >
                    COMMIT_TO_DATABASE
                </button>
            </form>
        </div>
    );
};

export default ProductRegistry;
