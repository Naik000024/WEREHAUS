import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { register } from '../api/client';

const RegisterScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password || !rePassword) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        if (password !== rePassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await register({ 
                username,
                email, 
                password, 
                re_password: rePassword,
                first_name: firstName,
                last_name: lastName
            });
            Alert.alert(
                "Registration Successful", 
                "Check your email for the activation link.",
                [{ text: "OK", onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : "Unable to create account.";
            Alert.alert("Registration Failed", errorMsg);
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
                <View style={styles.form}>
                    <Text style={styles.sectionTitle}>OPERATOR_REGISTRATION</Text>
                    
                    <Input 
                        label="Username *"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="operator_01"
                    />

                    <View style={styles.row}>
                        <Input 
                            label="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="John"
                            style={styles.halfInput}
                        />
                        <Input 
                            label="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Doe"
                            style={styles.halfInput}
                        />
                    </View>

                    <Input 
                        label="Email *"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                    />
                    <Input 
                        label="Password *"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry
                    />
                    <Input 
                        label="Confirm Password *"
                        value={rePassword}
                        onChangeText={setRePassword}
                        placeholder="••••••••"
                        secureTextEntry
                    />
                    
                    <Button 
                        title="Create Account" 
                        onPress={handleRegister} 
                        loading={loading}
                        style={styles.registerButton}
                    />

                    <Button 
                        title="Back to Login" 
                        variant="ghost" 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    />
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
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 30,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    halfInput: {
        flex: 1,
    },
    registerButton: {
        marginTop: 10,
    },
    backButton: {
        marginTop: 10,
    }
});

export default RegisterScreen;
