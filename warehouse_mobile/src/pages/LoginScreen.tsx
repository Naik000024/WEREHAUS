import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/client';

const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setLoading(true);
        try {
            const data = await login({ email, password });
            await signIn(data.access);
        } catch (error: any) {
            console.error(error);
            Alert.alert("Login Failed", error.response?.data?.detail || "Please check your credentials and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>WEREHAUS</Text>
                    <Text style={styles.subtitle}>Warehouse Management System</Text>
                </View>

                <View style={styles.form}>
                    <Input 
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                    />
                    <Input 
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry
                    />
                    
                    <Button 
                        title="Login" 
                        onPress={handleLogin} 
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Need to verify?</Text>
                        <Button 
                            title="Verify Account" 
                            variant="ghost" 
                            onPress={() => navigation.navigate('Activate')}
                            style={styles.registerButton}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <Button 
                            title="Register" 
                            variant="ghost" 
                            onPress={() => navigation.navigate('Register')}
                            style={styles.registerButton}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textDim,
        marginTop: 5,
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: Colors.textDim,
    },
    registerButton: {
        paddingHorizontal: 10,
    }
});

export default LoginScreen;
