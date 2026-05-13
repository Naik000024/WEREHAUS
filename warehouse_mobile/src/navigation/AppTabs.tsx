import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Package, ListOrdered, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';

// Placeholder Screens (to be implemented)
import DashboardScreen from '../pages/DashboardScreen';
import InventoryScreen from '../pages/InventoryScreen';
import OrdersScreen from '../pages/OrdersScreen';
import ProfileScreen from '../pages/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AppTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.background,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.border,
                },
                headerTintColor: Colors.primary,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    height: 60,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textDim,
            }}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={DashboardScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                }}
            />
            <Tab.Screen 
                name="Inventory" 
                component={InventoryScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
                }}
            />
            <Tab.Screen 
                name="Orders" 
                component={OrdersScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => <ListOrdered color={color} size={size} />,
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};
