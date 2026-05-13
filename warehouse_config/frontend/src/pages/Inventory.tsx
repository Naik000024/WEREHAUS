import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal'; 
import { getinventory, API } from '../api'; 
import { Inventory as InventoryType } from '../types'; 

const Inventory: React.FC = () => {
    const [items, setItems] = useState<InventoryType[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await getinventory();
            setItems(data);
        } catch (error) {
            console.error("FAILED_TO_FETCH_REGISTRY", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (item: InventoryType) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`CRITICAL_ACTION: Purge ${name} from database?`)) {
            try {
                await API.delete(`inventory/${id}/`);
                setItems(prev => prev.filter(i => i.id !== id));
            } catch (error) {
                console.error("DELETE_FAILED", error);
            }
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredItems = items.filter(item => 
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout title="Inventory_Database">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-neon-cyan font-black tracking-widest uppercase text-sm">
                        [ Global_Stock_Registry ]
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                        TOTAL_SKUS_INDEXED: {filteredItems.length}
                    </p>
                </div>

                <input 
                    type="text"
                    placeholder="SEARCH_BY_NAME..."
                    className="bg-black/40 border border-gray-800 px-4 py-1 text-[10px] text-white focus:border-neon-cyan outline-none font-mono w-full md:w-64"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <button 
                    onClick={fetchInventory}
                    className="text-[10px] border border-gray-700 px-4 py-1 hover:border-neon-cyan text-gray-500 hover:text-neon-cyan transition-all font-bold"
                >
                    REFRESH_DATABASE
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center font-mono text-neon-cyan animate-pulse">
                    LOADING_ENCRYPTED_DATA...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="bg-black/40 border border-gray-800 p-6 rounded-sm group hover:border-neon-cyan/50 transition-all backdrop-blur-sm relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-2 text-6xl font-black text-white/5 select-none uppercase">
                                {item.product || item.product}
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[9px] text-neon-cyan font-bold tracking-[0.2em] mb-1 italic">SKU: {item.product|| 'N/A'}</p>
                                    <h3 className="text-lg font-black text-white uppercase group-hover:text-neon-cyan transition-colors">
                                        {item.product_name}
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="bg-gray-900/50 p-3 rounded-sm border border-gray-800/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-gray-500 uppercase">Stock_Level</span>
                                        <span className={`text-xs font-bold ${item.quantity_available < 5 ? 'text-neon-pink animate-pulse' : 'text-green-400'}`}>
                                            {item.quantity_available} UNITS
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${item.quantity_available < 5 ? 'bg-neon-pink' : 'bg-neon-cyan'}`}
                                            style={{ width: `${Math.min((item.quantity_available / 50) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleViewDetails(item)}
                                        className="flex-1 border border-gray-700 py-1.5 text-[9px] font-black uppercase hover:bg-white/10 transition-colors"
                                    >
                                        View_Details
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.product_name)}
                                        className="flex-1 border border-neon-pink/50 text-neon-pink py-1.5 text-[9px] font-black uppercase hover:bg-neon-pink hover:text-white transition-colors"
                                    >
                                        Delete_SKU
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="PRODUCT_INDEX_DETAILS"
            >
                {selectedItem && (
                    <div className="space-y-3 font-mono">
                        <div className="flex justify-between text-[10px] border-b border-gray-800 pb-2">
                            <span className="text-gray-500 uppercase">Designation:</span>
                            <span className="text-white">{selectedItem.product_name}</span>
                        </div>
                        <div className="flex justify-between text-[10px] border-b border-gray-800 pb-2">
                            <span className="text-gray-500 uppercase">Serial_SKU:</span>
                            <span className="text-white">{selectedItem.product_sku || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] border-b border-gray-800 pb-2">
                            <span className="text-gray-500 uppercase">Unit_Price:</span>
                            <span className="text-green-400">₱{selectedItem.product_price || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] border-b border-gray-800 pb-2">
                            <span className="text-gray-500 uppercase">Availability:</span>
                            <span className="text-neon-cyan">{selectedItem.quantity_available} UNITS</span>
                        </div>
                        <div className="flex justify-between text-[10px] border-b border-gray-800 pb-2">
                            <span className="text-gray-500 uppercase">Last_Modified:</span>
                            <span className="text-gray-400">{new Date(selectedItem.last_updated).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default Inventory;