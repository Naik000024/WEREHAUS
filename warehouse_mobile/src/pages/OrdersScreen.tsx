import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform, Modal, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { getOrders, fulfillOrder, API, getInventory, createShipment, getCurrentUser } from '../api/client';
import { Order, Inventory } from '../types';
import { Truck, Trash2, CheckCircle, Clock, Plus, X, Info } from 'lucide-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import OrderStatusModal from '../components/OrderStatusModal';

const OrdersScreen = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdminOrStaff, setIsAdminOrStaff] = useState(false);

    // Order Detail Modal State
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    // Allocation State
    const [allocationModalVisible, setAllocationModalVisible] = useState(false);
    const [newOrder, setNewOrder] = useState({
        customer_name: "",
        product_id: 0,
        quantity: "1"
    });

    const fetchData = useCallback(async () => {
        try {
            const [ordersData, inventoryData, userData] = await Promise.all([
                getOrders(),
                getInventory(),
                getCurrentUser()
            ]);
            setOrders(ordersData);
            setInventory(inventoryData);
            if (userData.is_admin || userData.is_staff) {
                setIsAdminOrStaff(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleCreateOrder = async () => {
        if (!newOrder.customer_name || !newOrder.product_id || !newOrder.quantity) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        try {
            await createShipment({
                customer_name: newOrder.customer_name,
                items: [{ 
                    product: newOrder.product_id, 
                    quantity: parseInt(newOrder.quantity) 
                }]
            });
            Alert.alert("Success", "ALLOCATION_COMPLETE");
            setAllocationModalVisible(false);
            setNewOrder({ customer_name: "", product_id: 0, quantity: "1" });
            fetchData();
        } catch (error) {
            Alert.alert("Allocation Failed", "INSUFFICIENT_STOCK_OR_INVALID_DATA");
        }
    };

    const handleFulfill = async (id: number) => {
        try {
            await fulfillOrder(id);
            Alert.alert("Success", "Order successfully fulfilled and stock updated.");
            fetchData();
        } catch (error) {
            Alert.alert("SYSTEM_REJECTION", "Insufficient inventory levels to fulfill this order.");
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "PROTOCOL_CONFIRM",
            "Purge pending order from registry?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "PURGE", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.delete(`api/orders/${id}/`);
                            fetchData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to purge record.");
                        }
                    }
                }
            ]
        );
    };

    const handleOpenDetail = (order: Order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const renderItem = ({ item }: { item: Order }) => {
        const isShipped = item.status === 'SHIPPED';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleOpenDetail(item)}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.orderId}>TRACKING_ID: #{item.id}</Text>
                        <Text style={styles.customerName}>{item.customer_name}</Text>
                        {item.location ? (
                            <Text style={styles.locationTag}>📍 {item.location}{item.assigned_deliverer ? `  •  ${item.assigned_deliverer}` : ''}</Text>
                        ) : null}
                    </View>
                    <View style={styles.rightCol}>
                        <View style={[
                            styles.statusBadge, 
                            { backgroundColor: isShipped ? Colors.success + '20' : Colors.error + '20' }
                        ]}>
                            {isShipped ? (
                                <CheckCircle size={10} color={Colors.success} />
                            ) : (
                                <Clock size={10} color={Colors.primary} />
                            )}
                            <Text style={[
                                styles.statusText, 
                                { color: isShipped ? Colors.success : Colors.primary }
                            ]}>
                                {item.status}
                            </Text>
                        </View>
                        <Info size={14} color={Colors.textDim} style={{ marginTop: 8 }} />
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    {!isShipped ? (
                        isAdminOrStaff ? (
                            <View style={styles.actionRow}>
                                <TouchableOpacity 
                                    style={styles.fulfillButton} 
                                    onPress={(e) => { e.stopPropagation?.(); handleFulfill(item.id); }}
                                >
                                    <Truck size={16} color={Colors.background} />
                                    <Text style={styles.fulfillButtonText}>EXECUTE_SHIPMENT</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.purgeButton} 
                                    onPress={(e) => { e.stopPropagation?.(); handleDelete(item.id); }}
                                >
                                    <Trash2 size={16} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.readOnlyText}>TAP TO VIEW DETAILS</Text>
                        )
                    ) : (
                        <Text style={styles.completedText}>LOG_ENTRY: SHIPMENT_FINALIZED  •  TAP FOR DETAILS</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <View style={styles.container}>
            {loading && !refreshing ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                    <Text style={styles.loadingText}>LOADING_MANIFESTS...</Text>
                </View>
            ) : (
                <>
                    <FlatList 
                        data={orders}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
                        }
                        ListHeaderComponent={
                            <View style={styles.listHeader}>
                                <Text style={styles.listTitle}>[ ACTIVE_ORDER_MANIFEST ]</Text>
                                <Text style={styles.listSubtitle}>TOTAL_RECORDS: {orders.length}</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>NO_PENDING_ORDERS</Text>
                        }
                    />
                    {isAdminOrStaff && (
                        <TouchableOpacity 
                            style={styles.fab} 
                            onPress={() => setAllocationModalVisible(true)}
                        >
                            <Plus size={24} color={Colors.background} />
                        </TouchableOpacity>
                    )}
                </>
            )}

            {/* ORDER DETAIL MODAL */}
            <OrderStatusModal
                visible={detailModalVisible}
                order={selectedOrder}
                onClose={() => setDetailModalVisible(false)}
                onUpdated={() => { setDetailModalVisible(false); fetchData(); }}
                isAdminOrStaff={isAdminOrStaff}
            />

            {/* STOCK ALLOCATION MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={allocationModalVisible}
                onRequestClose={() => setAllocationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>[ STOCK_ALLOCATION ]</Text>
                            <TouchableOpacity onPress={() => setAllocationModalVisible(false)}>
                                <X size={24} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Input 
                                label="CLIENT_NAME" 
                                value={newOrder.customer_name} 
                                onChangeText={(v) => setNewOrder({...newOrder, customer_name: v})} 
                                placeholder="Client Designation" 
                            />
                            
                            <Text style={styles.dropdownLabel}>SELECT_SKU</Text>
                            <View style={styles.pickerContainer}>
                                {inventory.map(item => (
                                    <TouchableOpacity 
                                        key={item.id} 
                                        style={[
                                            styles.pickerItem,
                                            newOrder.product_id === item.product && styles.pickerItemActive
                                        ]}
                                        onPress={() => setNewOrder({...newOrder, product_id: item.product})}
                                    >
                                        <Text style={[
                                            styles.pickerItemText,
                                            newOrder.product_id === item.product && styles.pickerItemTextActive
                                        ]}>
                                            {item.product_name} ({item.quantity_available})
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Input 
                                label="QUANTITY" 
                                value={newOrder.quantity} 
                                onChangeText={(v) => setNewOrder({...newOrder, quantity: v})} 
                                placeholder="1" 
                                keyboardType="numeric" 
                            />
                            
                            <Button 
                                title="REQUEST_SHIPMENT" 
                                onPress={handleCreateOrder} 
                                style={{marginTop: 20}} 
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        color: Colors.primary,
        marginTop: 10,
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    listHeader: {
        marginBottom: 20,
    },
    listTitle: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    listSubtitle: {
        color: Colors.textDim,
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginTop: 4,
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    locationTag: {
        color: Colors.textDim,
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginTop: 4,
    },
    rightCol: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    orderId: {
        color: Colors.textDim,
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 4,
    },
    customerName: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.border + '40',
        paddingTop: 15,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    fulfillButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 4,
        gap: 8,
    },
    fulfillButtonText: {
        color: Colors.background,
        fontSize: 10,
        fontWeight: 'bold',
    },
    purgeButton: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.error + '40',
        borderRadius: 4,
    },
    completedText: {
        color: Colors.success,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    readOnlyText: {
        color: Colors.textDim,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    emptyText: {
        color: Colors.textDim,
        textAlign: 'center',
        marginTop: 50,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: 10,
    },
    modalTitle: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    modalBody: {
        gap: 15,
    },
    dropdownLabel: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 4,
        backgroundColor: Colors.background,
        maxHeight: 200,
    },
    pickerItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '40',
    },
    pickerItemActive: {
        backgroundColor: Colors.primary + '20',
    },
    pickerItemText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    pickerItemTextActive: {
        color: Colors.primary,
        fontWeight: 'bold',
    }
});

export default OrdersScreen;
