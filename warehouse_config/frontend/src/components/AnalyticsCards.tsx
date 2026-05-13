import React, { useEffect, useState } from 'react';
import { getfulfillmentreport } from '../api';

const AnalyticsCards: React.FC = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        getfulfillmentreport().then(setStats).catch(console.error);
    }, []);

    if (!stats) return <div className="text-neon-cyan animate-pulse font-mono text-xs">SCANNING_DATA...</div>;

    const isLowStock = stats.low_stock_items > 0;

    const cards = [
        { label: 'Total Orders', value: stats.total_orders, color: 'border-neon-cyan text-neon-cyan shadow-neon-cyan/20' },
        { label: 'Shipped', value: stats.shipped_orders, color: 'border-green-500 text-green-400 shadow-green-500/10' },
        // This card now reacts to the data
        { 
            label: 'Low Stock SKU', 
            value: stats.low_stock_items, 
            color: isLowStock 
                ? 'border-neon-pink text-neon-pink shadow-[0_0_20px_rgba(255,0,85,0.3)] animate-pulse' 
                : 'border-gray-800 text-gray-600' 
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
                <div key={i} className={`p-6 bg-black/40 backdrop-blur-md border ${card.color} rounded-lg shadow-lg transition-all duration-500`}>
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-mono">{card.label}</p>
                    <h2 className="text-4xl font-black mt-2 tracking-tighter italic">{card.value}</h2>
                    {card.label === 'Low Stock SKU' && isLowStock && (
                        <p className="text-[8px] mt-2 font-bold uppercase tracking-tighter text-neon-pink">Immediate_Restock_Required</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AnalyticsCards;