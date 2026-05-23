import React, { useEffect, useState } from 'react';
import { getorders, fulfillorder, API, getorderdetail } from '../api';
import { Order } from '../types';
import OrderStatusModal from './OrderStatusModal';
import axios from 'axios';

interface Props { onAction: () => void; }

const OrderManifest: React.FC<Props> = ({ onAction }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isAdminOrStaff, setIsAdminOrStaff] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchOrders = () => {
        getorders().then(setOrders);
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/user/auth/users/me/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.is_admin || response.data.is_staff) {
                setIsAdminOrStaff(true);
            }
        } catch (error) {
            console.error("Session Expired or Unauthorized in OrderManifest", error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchOrders();
    }, []);

    const handleFulfill = async (id: number) => {
        try {
            await fulfillorder(id);
            onAction(); // Refreshes everything
            fetchOrders(); // Refresh local table
        } catch (error) {
            alert("SYSTEM_REJECTION: Check Inventory Levels.");
        }
    };

    const handleDeleteOrder = async (id: number) => {
        if (!window.confirm("PROTOCOL_CONFIRM: Purge pending order from registry?")) return;

        try {
            // This hits the OrderRetrieveUpdateDestroyView in your Django backend
            await API.delete(`orders/${id}/`);
            alert("SYSTEM_LOG: Order successfully purged.");
            onAction(); // Trigger global refresh
            fetchOrders(); // Refresh local table
        } catch (error: any) {
            alert(error.response?.data?.error || "PURGE_FAILED: Connection interrupted.");
        }
    };

    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleModalUpdated = () => {
        fetchOrders();
        onAction();
        // Update local order details in modal if open
        if (selectedOrder) {
            getorderdetail(selectedOrder.id).then(setSelectedOrder);
        }
    };

    return (
        <div className="bg-black/20 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-md">
            <table className="w-full text-left font-mono text-[10px]">
                <thead className="bg-gray-900/50 text-gray-500 uppercase tracking-widest">
                    <tr>
                        <th className="p-4">Tracking_ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Operation</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                    {orders.map(o => (
                        <tr 
                            key={o.id} 
                            onClick={() => handleRowClick(o)}
                            className="hover:bg-neon-cyan/5 transition-colors group cursor-pointer"
                        >
                            <td className="p-4 text-gray-600">#{o.id}</td>
                            <td className="p-4">
                                <div className="text-white uppercase font-bold tracking-tight">{o.customer_name}</div>
                                <div className="text-[8px] text-gray-500 font-mono mt-0.5 tracking-wider lowercase">
                                    📍 {o.location || 'luzon'} • {o.assigned_deliverer ? `deliverer: ${o.assigned_deliverer}` : 'unassigned'}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-sm font-bold ${
                                    o.status === 'SHIPPED' 
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse'
                                }`}>
                                    {o.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                {o.status !== 'SHIPPED' && (
                                    <div className="flex justify-end gap-2">
                                        {isAdminOrStaff ? (
                                            <>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFulfill(o.id!);
                                                    }}
                                                    className="border border-neon-cyan text-neon-cyan px-4 py-1 hover:bg-neon-cyan hover:text-black font-black transition-all shadow-sm hover:shadow-neon-cyan/50 text-[9px]"
                                                >
                                                    EXECUTE_SHIPMENT
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteOrder(o.id!);
                                                    }}
                                                    className="border border-red-500/50 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white font-black transition-all text-[9px]"
                                                >
                                                    [ PURGE_RECORD ]
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-600 italic py-1">[ UNAUTHORIZED ]</span>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <OrderStatusModal 
                isOpen={isModalOpen}
                order={selectedOrder}
                onClose={() => setIsModalOpen(false)}
                onUpdated={handleModalUpdated}
                isAdminOrStaff={isAdminOrStaff}
            />
        </div>
    );
};

export default OrderManifest;