import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    style?: ViewStyle;
    variant?: 'primary' | 'outline' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, loading, style, variant = 'primary' }) => {
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                isOutline && styles.outline, 
                isGhost && styles.ghost,
                style
            ]} 
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? Colors.primary : Colors.background} />
            ) : (
                <Text style={[
                    styles.text, 
                    isOutline && styles.outlineText,
                    isGhost && styles.ghostText
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    text: {
        color: Colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    },
    outlineText: {
        color: Colors.primary,
    },
    ghostText: {
        color: Colors.primary,
    }
});
