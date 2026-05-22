import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, updateAvatar } from '../api/client';
import { User, LogOut, Shield, Info, Smartphone } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { signOut } = useAuth();

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

    useEffect(() => {
        fetchProfile();
    }, []);

    const getAvatarUri = () => {
        if (!account?.profile_picture) return null;
        if (account.profile_picture.startsWith('http')) return account.profile_picture;
        const path = account.profile_picture.startsWith('/') ? account.profile_picture.slice(1) : account.profile_picture;
        return `http://192.168.1.15:8000/${path}`;
    };

    const handleSelectAvatar = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert("PERMISSION_DENIED", "Access to camera roll is required to upload a profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append('profile_picture', {
            uri: localUri,
            name: filename,
            type,
        } as any);

        setLoading(true);
        try {
            const updatedAccount = await updateAvatar(formData);
            setAccount(updatedAccount);
            Alert.alert("AVATAR_UPLOAD_SUCCESS", "Profile picture updated successfully.");
        } catch (error: any) {
            console.error("Avatar upload failed", error);
            Alert.alert("AVATAR_UPLOAD_FAILED", "Please ensure the file is an image and try again.");
        } finally {
            setLoading(false);
        }
    };

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

    const getDesignation = () => {
        if (account?.is_admin) return "Administrator";
        if (account?.is_staff) return "Warehouse Staff";
        return "Standard Operator";
    };

    const getAccessLevel = () => {
        if (account?.is_admin) return "ROOT_OPERATOR";
        if (account?.is_staff) return "STAFF_OPERATOR";
        return "BASIC_OPERATOR";
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
                <TouchableOpacity style={styles.avatarContainer} onPress={handleSelectAvatar}>
                    {getAvatarUri() ? (
                        <Image source={{ uri: getAvatarUri() }} style={styles.avatarImage} />
                    ) : (
                        <User size={40} color={Colors.primary} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSelectAvatar}>
                    <Text style={styles.uploadText}>[ TAP_TO_UPDATE_AVATAR ]</Text>
                </TouchableOpacity>
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
                
                <DetailItem label="DESIGNATION" value={getDesignation()} />
                <DetailItem label="ACCESS_LEVEL" value={getAccessLevel()} color={Colors.primary} />
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
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    uploadText: {
        color: Colors.primary,
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginTop: 8,
        marginBottom: 15,
        letterSpacing: 1,
        fontWeight: 'bold',
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
