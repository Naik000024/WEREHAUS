import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../api/client';
import { User, LogOut, Shield, Info, Smartphone } from 'lucide-react-native';

const ProfileScreen = () => {
    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { signOut } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getCurrentUser();
                setAccount(data);
            } catch (error) {
                console.error("Session Expired", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            "LOGOUT_PROTOCOL",
            "Terminate current session and purge local tokens?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "TERMINATE", style: "destructive", onPress: signOut }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.loadingText}>DECRYPTING_OPERATOR_DATA...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <User size={40} color={Colors.primary} />
                </View>
                <Text style={styles.userName}>
                    {account?.first_name || account?.last_name 
                        ? `${account.first_name} ${account.last_name}`.trim() 
                        : account?.username || 'UNKNOWN_OPERATOR'}
                </Text>
                <Text style={styles.userEmail}>{account?.email}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Shield size={14} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>ACCOUNT_DETAILS</Text>
                </View>
                
                <DetailItem label="DESIGNATION" value="Warehouse Admin" />
                <DetailItem label="ACCESS_LEVEL" value="Root_Operator" color={Colors.primary} />
                <DetailItem label="ACCOUNT_ID" value={`#${account?.id || '---'}`} />
                <DetailItem label="SESSION_STATUS" value="ENCRYPTED_ACTIVE" color={Colors.success} />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Info size={14} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>SYSTEM_INFO</Text>
                </View>
                
                <DetailItem label="APP_VERSION" value="1.0.0-STABLE" />
                <DetailItem label="ENVIRONMENT" value="PRODUCTION" />
                <DetailItem label="BUILD_TYPE" value="MOBILE_NATIVE" />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={20} color={Colors.error} />
                <Text style={styles.logoutText}>TERMINATE_SESSION</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Smartphone size={12} color={Colors.textDim} />
                <Text style={styles.footerText}>WEREHAUS_MOBILE_INTERFACE v1.0</Text>
            </View>
        </ScrollView>
    );
};

const DetailItem = ({ label, value, color }: any) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color: color || Colors.white }]}>{value}</Text>
    </View>
);

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
    header: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary + '40',
        marginBottom: 15,
    },
    userName: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    userEmail: {
        color: Colors.textDim,
        fontSize: 12,
        marginTop: 5,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '40',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    detailLabel: {
        color: Colors.textDim,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        margin: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.error + '40',
        borderRadius: 8,
    },
    logoutText: {
        color: Colors.error,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 40,
        opacity: 0.5,
    },
    footerText: {
        color: Colors.textDim,
        fontSize: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    }
});

export default ProfileScreen;
