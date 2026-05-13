import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';

export const RootNavigator = () => {
    const { userToken, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {userToken ? <AppTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};
