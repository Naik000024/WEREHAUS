import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, Platform, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { getInventory, API, createProduct, updateProduct } from '../api/client';
import { Inventory as InventoryType } from '../types';
import { Search, RotateCcw, Trash2, Info, X, Plus } from 'lucide-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const InventoryScreen = () => {
    const [items, setItems] = useState<InventoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState<InventoryType | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    
    // New functionality state
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [restockQty, setRestockQty] = useState("");
    const [newProduct, setNewProduct] = useState({
        product_name: "",
        product: "",
        price: "",
        quantity_available: ""
    });

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getInventory();
            setItems(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Sync Error", "Failed to load inventory database.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleAddProduct = async () => {
        if (!newProduct.product_name || !newProduct.product || !newProduct.price || !newProduct.quantity_available) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        try {
            await createProduct({
                name: newProduct.product_name,
                sku: newProduct.product,
                price: parseFloat(newProduct.price),
                initial_stock: parseInt(newProduct.quantity_available)
            });
            Alert.alert("Success", "SKU registered successfully.");
            setAddModalVisible(false);
            setNewProduct({ product_name: "", product: "", price: "", quantity_available: "" });
            fetchInventory();
        } catch (error) {
            Alert.alert("Registration Failed", "Check SKU uniqueness or price format.");
        }
    };

    const handleRestock = async () => {
        if (!selectedItem || !restockQty) return;

        try {
            const newTotal = selectedItem.quantity_available + parseInt(restockQty);
            await updateProduct(selectedItem.id, {
                quantity_available: newTotal
            });
            Alert.alert("Success", `Stock updated to ${newTotal} units.`);
            setRestockQty("");
            setModalVisible(false);
            fetchInventory();
        } catch (error) {
            Alert.alert("Update Failed", "System rejected the stock modification.");
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            "CRITICAL_ACTION",
            `Purge ${name} from database?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "DELETE", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.delete(`api/inventory/${id}/`);
                            setItems(prev => prev.filter(i => i.id !== id));
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete item.");
                        }
                    }
                }
            ]
        );
    };

    const filteredItems = items.filter(item => 
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: InventoryType }) => {
        const isLow = item.quantity_available < 5;
        
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.skuText}>SKU_INDEX: {item.product}</Text>
                        <Text style={styles.productName}>{item.product_name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
                        <Info size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.stockContainer}>
                    <View style={styles.stockInfo}>
                        <Text style={styles.stockLabel}>STOCK_LEVEL</Text>
                        <Text style={[styles.stockValue, { color: isLow ? Colors.error : Colors.success }]}>
                            {item.quantity_available} UNITS
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[
                            styles.progressFill, 
                            { 
                                width: `${Math.min((item.quantity_available / 50) * 100, 100)}%`,
                                backgroundColor: isLow ? Colors.error : Colors.primary
                            }
                        ]} />
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => handleDelete(item.id, item.product_name)}
                    >
                        <Trash2 size={16} color={Colors.error} />
                        <Text style={styles.deleteButtonText}>DELETE_SKU</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Search size={18} color={Colors.textDim} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="SEARCH_BY_NAME..."
                        placeholderTextColor={Colors.textDim}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity onPress={fetchInventory} style={styles.refreshIcon}>
                    <RotateCcw size={20} color={Colors.textDim} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                    <Text style={styles.loadingText}>SYNCING_REGISTRY...</Text>
                </View>
            ) : (
                <>
                    <FlatList 
                        data={filteredItems}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>NO_RECORDS_FOUND</Text>
                        }
                    />
                    <TouchableOpacity 
                        style={styles.fab} 
                        onPress={() => setAddModalVisible(true)}
                    >
                        <Plus size={24} color={Colors.background} />
                    </TouchableOpacity>
                </>
            )}

            {/* DETAIL MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>PRODUCT_INDEX_DETAILS</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                        {selectedItem && (
                            <View style={styles.modalBody}>
                                <DetailRow label="DESIGNATION" value={selectedItem.product_name} />
                                <DetailRow label="STOCK_AVAIL" value={`${selectedItem.quantity_available} UNITS`} color={Colors.primary} />
                                <DetailRow label="LAST_SYNC" value={new Date(selectedItem.last_updated).toLocaleString()} />
                                
                                <View style={styles.restockSection}>
                                    <Text style={styles.restockTitle}>[ RESTOCK_INVENTORY ]</Text>
                                    <View style={styles.restockRow}>
                                        <TextInput 
                                            style={styles.restockInput}
                                            keyboardType="numeric"
                                            placeholder="QTY"
                                            placeholderTextColor={Colors.textDim}
                                            value={restockQty}
                                            onChangeText={setRestockQty}
                                        />
                                        <TouchableOpacity 
                                            style={styles.restockButton}
                                            onPress={handleRestock}
                                        >
                                            <Text style={styles.restockButtonText}>COMMIT_STOCK</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ADD PRODUCT MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>[ REGISTER_NEW_SKU ]</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <X size={24} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Input label="PRODUCT_NAME" value={newProduct.product_name} onChangeText={(v) => setNewProduct({...newProduct, product_name: v})} placeholder="Item Designation" />
                            <Input label="SKU_CODE" value={newProduct.product} onChangeText={(v) => setNewProduct({...newProduct, product: v})} placeholder="SKU-XXXX" />
                            <View style={styles.row}>
                                <Input label="PRICE ($)" value={newProduct.price} onChangeText={(v) => setNewProduct({...newProduct, price: v})} placeholder="0.00" style={{flex: 1}} keyboardType="numeric" />
                                <Input label="INITIAL_QTY" value={newProduct.quantity_available} onChangeText={(v) => setNewProduct({...newProduct, quantity_available: v})} placeholder="0" style={{flex: 1}} keyboardType="numeric" />
                            </View>
                            <Button title="COMMIT_TO_DATABASE" onPress={handleAddProduct} style={{marginTop: 20}} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const DetailRow = ({ label, value, color }: any) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={[styles.detailValue, { color: color || Colors.white }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        gap: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        color: Colors.white,
        paddingVertical: 10,
        marginLeft: 10,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    refreshIcon: {
        padding: 5,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.primary,
        marginTop: 10,
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    skuText: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    productName: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    stockContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 10,
        borderRadius: 4,
        marginBottom: 15,
    },
    stockInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    stockLabel: {
        color: Colors.textDim,
        fontSize: 9,
        fontWeight: 'bold',
    },
    stockValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 4,
        backgroundColor: Colors.background,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.error + '40',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: Colors.error,
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        color: Colors.textDim,
        textAlign: 'center',
        marginTop: 50,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '40',
        paddingBottom: 8,
    },
    detailLabel: {
        color: Colors.textDim,
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailValue: {
        fontSize: 12,
        fontWeight: '600',
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
    restockSection: {
        marginTop: 25,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    restockTitle: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 15,
        letterSpacing: 1,
    },
    restockRow: {
        flexDirection: 'row',
        gap: 10,
    },
    restockInput: {
        flex: 1,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 4,
        paddingHorizontal: 15,
        color: Colors.white,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    restockButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 4,
    },
    restockButtonText: {
        color: Colors.background,
        fontSize: 10,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 10,
    }
});

export default InventoryScreen;
