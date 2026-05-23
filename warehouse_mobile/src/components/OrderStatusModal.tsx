import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
    Platform, ActivityIndicator, Animated
} from 'react-native';
import { Colors } from '../theme/colors';
import { Order } from '../types';
import { updateOrder } from '../api/client';
import { X, MapPin, User, Clock, Truck, Package, ChevronDown } from 'lucide-react-native';

const LOCATION_OPTIONS = ['Luzon', 'Visayas', 'Mindanao'];
const DELIVERER_OPTIONS = ['Mark', 'Nyko', 'Dominic', 'Godwin'];

interface OrderStatusModalProps {
    visible: boolean;
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
        case 'SHIPPED': return Colors.success;
        case 'DELIVERED': return '#a855f7';
        case 'CANCELLED': return Colors.error;
        case 'ALLOCATED': return '#f59e0b';
        default: return Colors.primary;
    }
};

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
    visible, order, onClose, onUpdated, isAdminOrStaff
}) => {
    const [saving, setSaving] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [selectedDeliverer, setSelectedDeliverer] = useState<string | null>(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showDelivererPicker, setShowDelivererPicker] = useState(false);

    if (!order) return null;

    const currentLocation = selectedLocation ?? order.location;
    const currentDeliverer = selectedDeliverer ?? order.assigned_deliverer;
    const statusColor = getStatusColor(order.status);
    const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED';
    const hasChanges = (selectedLocation && selectedLocation !== order.location) ||
                       (selectedDeliverer && selectedDeliverer !== order.assigned_deliverer);

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        try {
            const data: Partial<Order> = {};
            if (selectedLocation && selectedLocation !== order.location) data.location = selectedLocation;
            if (selectedDeliverer && selectedDeliverer !== order.assigned_deliverer) data.assigned_deliverer = selectedDeliverer;
            await updateOrder(order.id, data);
            onUpdated();
            setSelectedLocation(null);
            setSelectedDeliverer(null);
        } catch (e) {
            console.error('Failed to update order:', e);
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

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerLabel}>ORDER_MANIFEST</Text>
                            <Text style={styles.headerId}>#{order.id}</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <X size={20} color={Colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* Status Banner */}
                        <View style={[styles.statusBanner, { borderLeftColor: statusColor }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <View>
                                <Text style={styles.statusLabel}>CURRENT_STATUS</Text>
                                <Text style={[styles.statusValue, { color: statusColor }]}>
                                    {order.status}
                                </Text>
                            </View>
                        </View>

                        {/* Customer Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>CLIENT_DETAILS</Text>
                            <View style={styles.infoRow}>
                                <User size={14} color={Colors.primary} />
                                <Text style={styles.infoLabel}>Client:</Text>
                                <Text style={styles.infoValue}>{order.customer_name}</Text>
                            </View>
                        </View>

                        {/* Location Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>LOGISTICS_DATA</Text>
                            <View style={styles.infoRow}>
                                <MapPin size={14} color={Colors.primary} />
                                <Text style={styles.infoLabel}>Region:</Text>
                                {isAdminOrStaff && !isShipped ? (
                                    <TouchableOpacity
                                        style={styles.dropdownTrigger}
                                        onPress={() => {
                                            setShowLocationPicker(!showLocationPicker);
                                            setShowDelivererPicker(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownTriggerText}>{currentLocation}</Text>
                                        <ChevronDown size={12} color={Colors.primary} />
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.infoValue}>{currentLocation}</Text>
                                )}
                            </View>
                            {showLocationPicker && (
                                <View style={styles.pickerDropdown}>
                                    {LOCATION_OPTIONS.map((loc) => (
                                        <TouchableOpacity
                                            key={loc}
                                            style={[
                                                styles.pickerOption,
                                                currentLocation === loc && styles.pickerOptionActive
                                            ]}
                                            onPress={() => {
                                                setSelectedLocation(loc);
                                                setShowLocationPicker(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.pickerOptionText,
                                                currentLocation === loc && styles.pickerOptionTextActive
                                            ]}>{loc}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Assigned Deliverer */}
                            <View style={[styles.infoRow, { marginTop: 12 }]}>
                                <Truck size={14} color={Colors.primary} />
                                <Text style={styles.infoLabel}>Deliverer:</Text>
                                {isAdminOrStaff && !isShipped ? (
                                    <TouchableOpacity
                                        style={styles.dropdownTrigger}
                                        onPress={() => {
                                            setShowDelivererPicker(!showDelivererPicker);
                                            setShowLocationPicker(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownTriggerText}>
                                            {currentDeliverer || 'UNASSIGNED'}
                                        </Text>
                                        <ChevronDown size={12} color={Colors.primary} />
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.infoValue}>
                                        {currentDeliverer || 'UNASSIGNED'}
                                    </Text>
                                )}
                            </View>
                            {showDelivererPicker && (
                                <View style={styles.pickerDropdown}>
                                    {DELIVERER_OPTIONS.map((d) => (
                                        <TouchableOpacity
                                            key={d}
                                            style={[
                                                styles.pickerOption,
                                                currentDeliverer === d && styles.pickerOptionActive
                                            ]}
                                            onPress={() => {
                                                setSelectedDeliverer(d);
                                                setShowDelivererPicker(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.pickerOptionText,
                                                currentDeliverer === d && styles.pickerOptionTextActive
                                            ]}>{d}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Timestamps */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>TIMESTAMPS</Text>
                            <View style={styles.timestampGrid}>
                                <View style={styles.timestampItem}>
                                    <View style={styles.timestampIcon}>
                                        <Package size={16} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.timestampLabel}>CREATED</Text>
                                    <Text style={styles.timestampValue}>{formatDate(order.order_date)}</Text>
                                </View>
                                <View style={styles.timestampItem}>
                                    <View style={[styles.timestampIcon, order.shipped_at ? { backgroundColor: Colors.success + '20' } : {}]}>
                                        <Truck size={16} color={order.shipped_at ? Colors.success : Colors.textDim} />
                                    </View>
                                    <Text style={styles.timestampLabel}>SHIPPED</Text>
                                    <Text style={[styles.timestampValue, order.shipped_at ? { color: Colors.success } : {}]}>
                                        {formatDate(order.shipped_at)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>MANIFEST_ITEMS ({order.items.length})</Text>
                                {order.items.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <Text style={styles.itemQty}>{item.quantity}x</Text>
                                        <Text style={styles.itemName}>{item.product_name || `Product #${item.product}`}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Save Button */}
                        {isAdminOrStaff && hasChanges && !isShipped && (
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={Colors.background} size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>COMMIT_CHANGES</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        padding: 16,
    },
    container: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
        maxHeight: '85%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    headerLabel: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    headerId: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '900',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.border + '60',
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        padding: 20,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        gap: 12,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusLabel: {
        color: Colors.textDim,
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 1,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
        marginTop: 2,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '40',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        color: Colors.textDim,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    infoValue: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.primary + '40',
        gap: 6,
    },
    dropdownTriggerText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    pickerDropdown: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 6,
        marginTop: 8,
        marginLeft: 22,
        overflow: 'hidden',
    },
    pickerOption: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '40',
    },
    pickerOptionActive: {
        backgroundColor: Colors.primary + '20',
    },
    pickerOptionText: {
        color: Colors.text,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    pickerOptionTextActive: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    timestampGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    timestampItem: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border + '60',
    },
    timestampIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    timestampLabel: {
        color: Colors.textDim,
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 4,
    },
    timestampValue: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: Colors.background,
        borderRadius: 6,
        marginBottom: 6,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.border + '30',
    },
    itemQty: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        minWidth: 30,
    },
    itemName: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    saveButtonText: {
        color: Colors.background,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});

export default OrderStatusModal;
