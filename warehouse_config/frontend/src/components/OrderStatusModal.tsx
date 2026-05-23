import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Order } from '../types';
import { updateorder } from '../api';

const LOCATION_OPTIONS = ['Luzon', 'Visayas', 'Mindanao'];
const DELIVERER_OPTIONS = ['Mark', 'Nyko', 'Dominic', 'Godwin'];

interface OrderStatusModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
    onUpdated: () => void;
    isAdminOrStaff: boolean;
}

const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'SHIPPED': return '#22c55e'; // green-500
        case 'DELIVERED': return '#a855f7'; // purple-500
        case 'CANCELLED': return '#ef4444'; // red-500
        case 'ALLOCATED': return '#f59e0b'; // amber-500
        default: return '#00f2ff'; // neon-cyan
    }
};

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
    isOpen, order, onClose, onUpdated, isAdminOrStaff
}) => {
    const [saving, setSaving] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [selectedDeliverer, setSelectedDeliverer] = useState<string | null>(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showDelivererPicker, setShowDelivererPicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedLocation(null);
            setSelectedDeliverer(null);
            setShowLocationPicker(false);
            setShowDelivererPicker(false);
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const currentLocation = selectedLocation ?? (order.location || 'Luzon');
    const currentDeliverer = selectedDeliverer ?? order.assigned_deliverer;
    const statusColor = getStatusColor(order.status);
    const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED';
    const hasChanges = (selectedLocation !== null && selectedLocation !== (order.location || 'Luzon')) ||
                       (selectedDeliverer !== null && selectedDeliverer !== order.assigned_deliverer);

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        try {
            const data: Partial<Order> = {};
            if (selectedLocation !== null && selectedLocation !== (order.location || 'Luzon')) {
                data.location = selectedLocation;
            }
            if (selectedDeliverer !== null && selectedDeliverer !== order.assigned_deliverer) {
                // If it's a blank option, or chosen option
                data.assigned_deliverer = selectedDeliverer || undefined;
            }
            await updateorder(order.id, data);
            onUpdated();
            setSelectedLocation(null);
            setSelectedDeliverer(null);
        } catch (e) {
            console.error('Failed to update order:', e);
            alert('SYSTEM_ERROR: Failed to commit logistics update.');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setSelectedLocation(null);
        setSelectedDeliverer(null);
        setShowLocationPicker(false);
        setShowDelivererPicker(false);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
                onClick={handleClose}
            ></div>

            {/* MODAL WINDOW */}
            <div className="relative w-full max-w-md bg-[#0d1117] border border-neon-cyan shadow-[0_0_30px_rgba(0,242,255,0.15)] rounded-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* HEADER */}
                <div className="bg-gray-900/50 px-5 py-4 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan font-mono">
                            ORDER_MANIFEST
                        </span>
                        <span className="text-white text-lg font-black font-mono">
                            #{order.id}
                        </span>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="text-gray-500 hover:text-white transition-colors text-xs font-mono p-1"
                    >
                        [X]
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 text-gray-300 font-mono text-xs max-h-[70vh] overflow-y-auto space-y-6">
                    
                    {/* Status Banner */}
                    <div 
                        className="flex items-center gap-3 bg-black/30 border border-gray-800 rounded-sm p-4"
                        style={{ borderLeftWidth: '4px', borderLeftColor: statusColor }}
                    >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
                        <div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest">CURRENT_STATUS</div>
                            <div className="text-sm font-black tracking-wider uppercase mt-0.5" style={{ color: statusColor }}>
                                {order.status}
                            </div>
                        </div>
                    </div>

                    {/* Client Details */}
                    <div className="space-y-3">
                        <div className="text-[10px] text-neon-cyan font-bold tracking-widest border-b border-gray-800 pb-1.5 uppercase">
                            CLIENT_DETAILS
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            {/* User Icon */}
                            <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <span className="text-gray-500">Client:</span>
                            <span className="font-bold uppercase">{order.customer_name}</span>
                        </div>
                    </div>

                    {/* Logistics Section */}
                    <div className="space-y-4">
                        <div className="text-[10px] text-neon-cyan font-bold tracking-widest border-b border-gray-800 pb-1.5 uppercase">
                            LOGISTICS_DATA
                        </div>
                        
                        {/* Region Select */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <span className="text-gray-500">Region:</span>
                                {isAdminOrStaff && !isShipped ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setShowLocationPicker(!showLocationPicker);
                                                setShowDelivererPicker(false);
                                            }}
                                            className="flex items-center gap-1.5 bg-neon-cyan/10 border border-neon-cyan/40 px-2 py-0.5 rounded text-neon-cyan hover:bg-neon-cyan/20 transition-all font-bold"
                                        >
                                            <span>{currentLocation}</span>
                                            <svg className="w-3 h-3 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {showLocationPicker && (
                                            <div className="absolute left-0 mt-1 z-10 w-32 bg-[#0d1117] border border-gray-800 rounded shadow-lg overflow-hidden">
                                                {LOCATION_OPTIONS.map((loc) => (
                                                    <button
                                                        key={loc}
                                                        onClick={() => {
                                                            setSelectedLocation(loc);
                                                            setShowLocationPicker(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-1.5 hover:bg-neon-cyan/15 hover:text-neon-cyan transition-colors ${
                                                            currentLocation === loc ? 'bg-neon-cyan/10 text-neon-cyan font-bold' : 'text-gray-300'
                                                        }`}
                                                    >
                                                        {loc}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-white font-bold">{currentLocation}</span>
                                )}
                            </div>
                        </div>

                        {/* Deliverer Select */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16V10a1 1 0 00-1-1h-7m8 7a1 1 0 001-1v-4a1 1 0 00-1-1h-3v6M17 14h.01"/>
                                </svg>
                                <span className="text-gray-500">Deliverer:</span>
                                {isAdminOrStaff && !isShipped ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setShowDelivererPicker(!showDelivererPicker);
                                                setShowLocationPicker(false);
                                            }}
                                            className="flex items-center gap-1.5 bg-neon-cyan/10 border border-neon-cyan/40 px-2 py-0.5 rounded text-neon-cyan hover:bg-neon-cyan/20 transition-all font-bold"
                                        >
                                            <span>{currentDeliverer || 'UNASSIGNED'}</span>
                                            <svg className="w-3 h-3 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {showDelivererPicker && (
                                            <div className="absolute left-0 mt-1 z-10 w-36 bg-[#0d1117] border border-gray-800 rounded shadow-lg overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDeliverer('');
                                                        setShowDelivererPicker(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-1.5 hover:bg-neon-cyan/15 hover:text-neon-cyan transition-colors text-red-400 font-bold`}
                                                >
                                                    [ UNASSIGN ]
                                                </button>
                                                {DELIVERER_OPTIONS.map((d) => (
                                                    <button
                                                        key={d}
                                                        onClick={() => {
                                                            setSelectedDeliverer(d);
                                                            setShowDelivererPicker(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-1.5 hover:bg-neon-cyan/15 hover:text-neon-cyan transition-colors ${
                                                            currentDeliverer === d ? 'bg-neon-cyan/10 text-neon-cyan font-bold' : 'text-gray-300'
                                                        }`}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-white font-bold">{currentDeliverer || 'UNASSIGNED'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-3">
                        <div className="text-[10px] text-neon-cyan font-bold tracking-widest border-b border-gray-800 pb-1.5 uppercase">
                            TIMESTAMPS
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/40 border border-gray-800 p-3 rounded-sm text-center flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-1.5">
                                    <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                    </svg>
                                </div>
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">CREATED</span>
                                <span className="text-[10px] text-white mt-1 leading-snug">{formatDate(order.order_date)}</span>
                            </div>
                            <div className="bg-black/40 border border-gray-800 p-3 rounded-sm text-center flex flex-col items-center">
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors"
                                    style={{ backgroundColor: order.shipped_at ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.1)' }}
                                >
                                    <svg 
                                        className="w-4 h-4 transition-colors" 
                                        style={{ color: order.shipped_at ? '#22c55e' : '#6b7280' }} 
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 0 00-1 1v10M21 16V10a1 0 00-1-1h-7"/>
                                    </svg>
                                </div>
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">SHIPPED</span>
                                <span 
                                    className="text-[10px] mt-1 leading-snug transition-colors"
                                    style={{ color: order.shipped_at ? '#22c55e' : '#6b7280' }}
                                >
                                    {formatDate(order.shipped_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Manifest Items */}
                    {order.items && order.items.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-[10px] text-neon-cyan font-bold tracking-widest border-b border-gray-800 pb-1.5 uppercase">
                                MANIFEST_ITEMS ({order.items.length})
                            </div>
                            <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-black/40 border border-gray-800/40 p-2.5 rounded-sm">
                                        <span className="text-neon-cyan font-black text-sm min-w-[24px]">{item.quantity}x</span>
                                        <span className="text-white font-bold">{item.product_name || `Product #${item.product}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER / ACTION */}
                <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/10 flex justify-end gap-3">
                    {isAdminOrStaff && hasChanges && !isShipped && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-neon-cyan border border-neon-cyan text-black px-5 py-2 text-[10px] font-black uppercase hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50"
                        >
                            {saving ? 'COMMITTING...' : 'COMMIT_CHANGES'}
                        </button>
                    )}
                    <button 
                        onClick={handleClose}
                        className="bg-transparent border border-gray-700 text-gray-400 px-5 py-2 text-[10px] font-black uppercase hover:border-gray-500 hover:text-white transition-all"
                    >
                        Close_Terminal
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OrderStatusModal;
