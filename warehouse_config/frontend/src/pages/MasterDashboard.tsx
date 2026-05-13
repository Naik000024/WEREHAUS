import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout'; 
import AnalyticsCards from '../components/AnalyticsCards';
import ProductRegistry from '../components/ProductRegistry';
import StockAllocation from '../components/StockAllocation';
import RestockInventory from '../components/RestockInventory';
import OrderManifest from '../components/OrderManifest';
import TransactionHistory from '../components/TransactionHistory';

const MasterDashboard: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerSync = () => setRefreshKey(prev => prev + 1);

    useEffect(() => {
        const interval = setInterval(triggerSync, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout title="Warehouse Control_Center">
            {/* --- DASHBOARD CONTENT --- */}
            
            {/* Top Sync Controls - Moved here since Layout handles the main header */}
            <div className="flex justify-end mb-6">
                <button 
                    onClick={triggerSync}
                    className="group relative px-6 py-2 overflow-hidden border border-neon-cyan/50 text-neon-cyan text-[10px] font-bold tracking-[0.3em] transition-all hover:shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                >
                    <span className="relative z-10 uppercase font-black">Force_Re-Sync</span>
                    <div className="absolute inset-0 bg-neon-cyan transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-20"></div>
                </button>
            </div>

            {/* Top Analytics Stats */}
            <AnalyticsCards key={`stats-${refreshKey}`} />

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
                
                {/* LEFT COLUMN: Operations */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-[1px] bg-gradient-to-b from-gray-800 to-transparent rounded-sm">
                        <div className="bg-[#0d1117] p-4">
                            <ProductRegistry onAction={triggerSync} />
                        </div>
                    </div>
                    
                    <div className="p-[1px] bg-gradient-to-b from-gray-800 to-transparent rounded-sm">
                        <div className="bg-[#0d1117] p-4">
                            <StockAllocation onAction={triggerSync} />
                        </div>
                    </div>

                    <div className="p-[1px] bg-gradient-to-b from-gray-800 to-transparent rounded-sm">
                        <div className="bg-[#0d1117] p-4">
                            <RestockInventory onAction={triggerSync} key={`restock-${refreshKey}`} />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Manifest & Logs */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white/5 border border-gray-800 rounded-sm shadow-2xl p-4 backdrop-blur-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="h-1 w-4 bg-neon-cyan"></div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Active_Order_Manifest</span>
                        </div>
                        <OrderManifest 
                            key={`orders-${refreshKey}`} 
                            onAction={triggerSync} 
                        />
                    </div>

                    <TransactionHistory refresh={refreshKey > 0} />
                </div>
            </div>
        </Layout>
    );
};

export default MasterDashboard;