import React, { useEffect, useState, useRef } from 'react';
import { getorders } from '../api';
import { Order } from '../types';

const TransactionHistory: React.FC<{ refresh: boolean }> = ({ refresh }) => {
    const [logs, setLogs] = useState<Order[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getorders().then(setLogs).catch(console.error);
    }, [refresh]);

    // AUTO-SCROLL LOGIC: Snaps to the top whenever logs update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [logs]);

    return (
        <div className="mt-6 border border-gray-800 bg-black/40 rounded-lg overflow-hidden backdrop-blur-md">
            <div className="bg-gray-900/50 p-3 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-400">
                    [ Global_Activity_Log ]
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] text-neon-cyan/50 font-mono tracking-widest">LIVE_FEED</span>
                    <span className="animate-pulse w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_5px_#00f2ff]"></span>
                </div>
            </div>
            
            {/* STYLED SCROLLBAR CONTAINER */}
            <div 
                ref={scrollRef}
                className="max-h-64 overflow-y-auto font-mono text-[10px] scrollbar-hide"
            >
                <style>{`
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 4px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: #000;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: #00f2ff;
                        border-radius: 10px;
                        box-shadow: 0 0 10px #00f2ff;
                    }
                `}</style>
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-black text-gray-600 uppercase">
                        <tr>
                            <th className="p-3 border-b border-gray-800">Timestamp</th>
                            <th className="p-3 border-b border-gray-800">Event</th>
                            <th className="p-3 border-b border-gray-800">Entity</th>
                            <th className="p-3 border-b border-gray-800 text-right">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.slice().reverse().map((log) => (
                            <tr key={log.id} className="border-b border-gray-900 hover:bg-white/5 transition-colors group">
                                <td className="p-3 text-gray-500 group-hover:text-neon-cyan transition-colors">
                                    {new Date(log.order_date).toLocaleTimeString()}
                                </td>
                                <td className="p-3">
                                    <span className={log.status === 'SHIPPED' ? "text-neon-pink" : "text-neon-cyan"}>
                                        {log.status === 'SHIPPED' ? "OUTBOUND_SHIP" : "PENDING_AUTH"}
                                    </span>
                                </td>
                                <td className="p-3 text-white uppercase font-bold">{log.customer_name}</td>
                                <td className="p-3 text-right text-gray-400">
                                    {log.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;