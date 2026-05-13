import React, { useState, useEffect } from 'react';
import { getinventory, createshipment } from '../api'; 
import { Inventory } from '../types';

const StockAllocation: React.FC<{ onAction: () => void }> = ({ onAction }) => {
    // We only need the inventory state to populate the dropdown
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [form, setForm] = useState({ client_name: '', product_id: '', quantity: 1 });

    useEffect(() => {
        // Fetching only inventory ensures the dropdown matches your Inventory Database page
        getinventory().then((iData) => {
            setInventory(iData);
        }).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createshipment({
                customer_name: form.client_name,
                // Ensure we use the product ID (item.product) for the backend
                items: [{ product: parseInt(form.product_id), quantity: form.quantity }]
            });
            setForm({ client_name: '', product_id: '', quantity: 1 });
            onAction();
            alert("ALLOCATION_COMPLETE");
        } catch (err) {
            alert("ERROR: INSUFFICIENT_STOCK_OR_INVALID_DATA");
        }
    };

    return (
        <div className="p-5 bg-white/5 border border-gray-800 rounded-lg shadow-lg">
            <h3 className="text-neon-pink text-[10px] uppercase tracking-[0.3em] mb-4 font-black">[ Stock_Allocation ]</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    className="w-full bg-black border border-gray-800 p-2 text-xs text-white focus:border-neon-pink outline-none"
                    placeholder="CLIENT_NAME"
                    value={form.client_name}
                    onChange={e => setForm({...form, client_name: e.target.value})}
                    required
                />
                <select 
                    className="w-full bg-black border border-gray-800 p-2 text-xs text-white focus:border-neon-pink outline-none font-mono"
                    value={form.product_id}
                    onChange={e => setForm({...form, product_id: e.target.value})}
                    required
                >
                    <option value="">SELECT_SKU</option>
                    {/* Mapping over inventory instead of products filters the list automatically */}
                    {inventory.map(item => (
                        <option key={item.id} value={item.product} className="bg-black">
                            {item.product_name} | {item.quantity_available < 10 ? `(LOW: ${item.quantity_available})` : `(QTY: ${item.quantity_available})`}
                        </option>
                    ))}
                </select>
                <div className="flex items-center space-x-2">
                    <label className="text-[8px] text-gray-500 uppercase font-mono">Qty:</label>
                    <input 
                        type="number" min="1"
                        className="w-full bg-black border border-gray-800 p-2 text-xs text-white focus:border-neon-pink outline-none font-mono"
                        value={form.quantity}
                        onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 1})}
                        required
                    />
                </div>
                <button type="submit" className="w-full border border-neon-pink text-neon-pink font-black py-2 text-[10px] uppercase hover:bg-neon-pink hover:text-black transition-all">
                    REQUEST_SHIPMENT
                </button>
            </form>
        </div>
    );
};

export default StockAllocation;