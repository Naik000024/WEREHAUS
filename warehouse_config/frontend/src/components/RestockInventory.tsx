import React, { useState, useEffect } from 'react';
import { getinventory, API } from '../api';
import { Inventory } from '../types';

const RestockInventory: React.FC<{ onAction: () => void }> = ({ onAction }) => {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [selectedInvId, setSelectedInvId] = useState('');
    const [addQty, setAddQty] = useState(0);

    useEffect(() => {
        getinventory().then(setInventory).catch(console.error);
    }, []);

    const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentItem = inventory.find(i => i.id === parseInt(selectedInvId));
    
    if (!currentItem) return alert("PLEASE_SELECT_AN_ITEM");

    try {
        const newTotal = currentItem.quantity_available + addQty;
        await API.patch(`inventory/${currentItem.id}/`, {
            quantity_available: newTotal
        });
        
        setAddQty(0);
        setSelectedInvId(''); // Clear selection after success
        onAction(); 
        alert(`SYSTEM_SYNC: ${currentItem.product_name} restocked to ${newTotal}.`);
        
        const updatedInv = await getinventory();
        setInventory(updatedInv);
    } catch (err: any) {
        console.error("DEBUG_REJECTION:", err.response?.data);
        alert("RESTOCK_ERROR: Check console for server response.");
    }
};

    return (
        <div className="p-5 bg-white/5 border border-gray-800 rounded-lg shadow-lg backdrop-blur-md mt-4">
            <h3 className="text-yellow-500 text-[10px] uppercase tracking-[0.3em] mb-4 font-black">
                [ Restock_Inventory ]
            </h3>
            
            <form onSubmit={handleRestock} className="space-y-4">
                <select 
                    className="w-full bg-black border border-gray-800 p-2 text-xs text-white outline-none focus:border-yellow-500 font-mono"
                    value={selectedInvId}
                    onChange={e => setSelectedInvId(e.target.value)}
                    required
                >
                    <option value="">-- SELECT_ITEM_TO_RESTOCK --</option>
                    {inventory.map(i => (
                        <option key={i.id} value={i.id} className="bg-black">
                            {i.product_name} (Current: {i.quantity_available})
                        </option>
                    ))}
                </select>
                
                <div className="flex items-center space-x-2">
                    <label className="text-[8px] text-gray-500 uppercase font-mono">Add_Qty:</label>
                    <input 
                        type="number" 
                        min="1"
                        className="w-full bg-black border border-gray-800 p-2 text-xs text-white outline-none focus:border-yellow-500 font-mono"
                        placeholder="0"
                        value={addQty}
                        onChange={e => setAddQty(parseInt(e.target.value) || 0)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full border border-yellow-500 text-yellow-500 font-black py-3 text-[10px] uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300"
                >
                    EXECUTE_INBOUND_UPDATE
                </button>
            </form>
        </div>
    );
};

export default RestockInventory;