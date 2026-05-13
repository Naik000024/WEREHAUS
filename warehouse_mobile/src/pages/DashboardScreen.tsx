import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { getFulfillmentReport } from '../api/client';
import { RefreshCw, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react-native';

const AnalyticsCard = ({ label, value, color, icon: Icon, alert }: any) => (
    <View style={[styles.card, { borderColor: color }]}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Icon size={16} color={color} />
        </View>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
        {alert && (
            <Text style={styles.alertText}>Action Required</Text>
        )}
    </View>
);

const DashboardScreen = () => {
    const [stats, setStats] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const data = await getFulfillmentReport();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (!stats && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.loadingText}>SCANNING_DATA...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
            }
        >
            <View style={styles.content}>
                <View style={styles.syncRow}>
                    <TouchableOpacity style={styles.syncButton} onPress={onRefresh}>
                        <RefreshCw size={12} color={Colors.primary} />
                        <Text style={styles.syncButtonText}>FORCE_RE-SYNC</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    <AnalyticsCard 
                        label="Total Orders" 
                        value={stats?.total_orders || 0} 
                        color={Colors.primary} 
                        icon={TrendingUp} 
                    />
                    <AnalyticsCard 
                        label="Shipped" 
                        value={stats?.shipped_orders || 0} 
                        color={Colors.success} 
                        icon={CheckCircle} 
                    />
                    <AnalyticsCard 
                        label="Low Stock SKU" 
                        value={stats?.low_stock_items || 0} 
                        color={stats?.low_stock_items > 0 ? Colors.error : Colors.textDim} 
                        icon={AlertTriangle}
                        alert={stats?.low_stock_items > 0}
                    />
                </View>

                {/* More sections can be added here as we implement other modules */}
                <View style={styles.placeholderSection}>
                    <Text style={styles.sectionTitle}>System Status: [ ONLINE ]</Text>
                    <View style={styles.statusIndicator} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.primary,
        marginTop: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    syncRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary + '80',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    syncButtonText: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 8,
        letterSpacing: 1,
    },
    statsGrid: {
        gap: 15,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardLabel: {
        color: Colors.textDim,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    cardValue: {
        fontSize: 36,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    alertText: {
        color: Colors.error,
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 8,
    },
    placeholderSection: {
        marginTop: 40,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        alignItems: 'center',
    },
    sectionTitle: {
        color: Colors.textDim,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.success,
        marginTop: 10,
    }
});

export default DashboardScreen;
