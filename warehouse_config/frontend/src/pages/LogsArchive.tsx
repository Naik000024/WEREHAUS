import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { API } from '../api';

interface LogEntry {
    id: number;
    order_date: string;
    status: string;
    customer_name: string;
    items: { product_name: string, quantity: number }[];
}

const LogsArchive: React.FC = () => {
    const [orders, setOrders] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrdersAsLogs = async () => {
        try {
            // We use existing orders endpoint
            const response = await API.get('orders/'); 
            setOrders(response.data);
        } catch (error) {
            console.error("LOG_RETRIEVAL_FAILURE", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrdersAsLogs(); }, []);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'SHIPPED': return 'text-green-400 border-green-900/50 bg-green-900/20';
            case 'PENDING': return 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10';
            case 'CANCELLED': return 'text-neon-pink border-neon-pink/50 bg-neon-pink/10';
            default: return 'text-gray-400 border-gray-800 bg-gray-900/50';
        }
    };

    return (
        <Layout title="Archive_Terminal">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-neon-cyan font-black tracking-[0.4em] uppercase text-sm">
                        [ Shipment_Transaction_History ]
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-1 italic">
                        REPURPOSED_ORDER_DATA // NO_MIGRATION_REQUIRED
                    </p>
                </div>
                <button onClick={() => window.print()} className="text-[9px] border border-gray-700 px-3 py-1 hover:border-white text-gray-500 hover:text-white transition-all font-mono">
                    EXPORT_HARD_COPY (.PDF)
                </button>
            </div>

            <div className="border border-gray-800 bg-black/40 backdrop-blur-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/30">
                            <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date_Time</th>
                            <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Client</th>
                            <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Manifest</th>
                            <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Trans_ID</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-[11px]">
                        {loading ? (
                            <tr><td colSpan={5} className="p-20 text-center text-neon-cyan animate-pulse">READING_ORDER_STREAM...</td></tr>
                        ) : orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-900 hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 text-gray-400">
                                    {new Date(order.order_date).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 border text-[9px] font-bold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-white font-bold">{order.customer_name}</td>
                                <td className="p-4 text-gray-500 italic">
                                    {order.items?.map(item => `${item.quantity}x ${item.product_name}`).join(', ') || 'NO_ITEMS'}
                                </td>
                                <td className="p-4 text-right text-neon-cyan font-bold">#ORD_{order.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default LogsArchive;