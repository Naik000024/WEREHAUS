import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { activate } from '../api/client';

const ActivateScreen = ({ navigation, route }: any) => {
    // These might come from a deep link or manual entry
    const [uid, setUid] = useState(route.params?.uid || '');
    const [token, setToken] = useState(route.params?.token || '');
    const [loading, setLoading] = useState(false);

    const handleActivate = async () => {
        if (!uid || !token) {
            Alert.alert("Error", "Missing UID or Activation Token.");
            return;
        }

        setLoading(true);
        try {
            await activate(uid, token);
            Alert.alert(
                "Account Activated", 
                "Your operator credentials are now valid.",
                [{ text: "Login Now", onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            console.error(error);
            Alert.alert("Activation Failed", "Invalid or expired token.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>VERIFY_OPERATOR</Text>
                <Text style={styles.description}>
                    Enter the activation credentials sent to your email to verify your access to the system.
                </Text>

                <Input 
                    label="UID"
                    value={uid}
                    onChangeText={setUid}
                    placeholder="User Identification"
                />
                <Input 
                    label="Token"
                    value={token}
                    onChangeText={setToken}
                    placeholder="Activation Token"
                />
                
                <Button 
                    title="Activate Account" 
                    onPress={handleActivate} 
                    loading={loading}
                    style={styles.button}
                />

                <Button 
                    title="Back to Login" 
                    variant="ghost" 
                    onPress={() => navigation.navigate('Login')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 20,
        justifyContent: 'center',
    },
    content: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        color: Colors.textDim,
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        marginTop: 20,
        marginBottom: 10,
    }
});

export default ActivateScreen;
