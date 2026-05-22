import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Platform, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { Colors } from '../theme/colors';
import { getFulfillmentReport, chatbotQuery } from '../api/client';
import { RefreshCw, TrendingUp, CheckCircle, AlertTriangle, MessageSquare, Send, X } from 'lucide-react-native';

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

    // Chatbot States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([
        { id: '1', sender: 'bot', text: "🤖 [WEREHAUS_INTELLIGENCE_ONLINE]\nGreetings! I am your automated inventory assistant. Type `help` to list supported system diagnostics." }
    ]);
    const [input, setInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);

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

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const userText = input;
        setInput("");
        const userMsgId = Date.now().toString();
        setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
        setChatLoading(true);

        try {
            const data = await chatbotQuery(userText);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "🤖 [CONNECTION_FAIL] Could not establish secure uplink to intelligence core." }]);
        } finally {
            setChatLoading(false);
        }
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
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
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

                    {/* System Status Display */}
                    <View style={styles.placeholderSection}>
                        <Text style={styles.sectionTitle}>System Status: [ ONLINE ]</Text>
                        <View style={styles.statusIndicator} />
                    </View>
                </View>
            </ScrollView>

            {/* Chat Floating Action Button (FAB) */}
            <TouchableOpacity style={styles.fab} onPress={() => setIsChatOpen(true)}>
                <MessageSquare size={24} color={Colors.background} />
            </TouchableOpacity>

            {/* Chatbot Modal Dialog */}
            <Modal
                visible={isChatOpen}
                animationType="slide"
                onRequestClose={() => setIsChatOpen(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>🤖 WEREHAUS CO-PILOT</Text>
                        <TouchableOpacity onPress={() => setIsChatOpen(false)}>
                            <X size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        ref={scrollViewRef}
                        style={styles.messageList}
                        contentContainerStyle={styles.messageContent}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {messages.map((m) => (
                            <View 
                                key={m.id} 
                                style={[
                                    styles.messageBubble, 
                                    m.sender === 'user' ? styles.userBubble : styles.botBubble
                                ]}
                            >
                                <Text style={[
                                    styles.messageText,
                                    m.sender === 'user' ? styles.userText : styles.botText
                                ]}>
                                    {m.text}
                                </Text>
                            </View>
                        ))}
                        {chatLoading && (
                            <View style={[styles.messageBubble, styles.botBubble, { opacity: 0.7 }]}>
                                <Text style={[styles.messageText, styles.botText]}>[ ANALYZING_QUERY... ]</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.inputRow}>
                        <TextInput 
                            value={input}
                            onChangeText={setInput}
                            placeholder="TRANSMIT MESSAGE..."
                            placeholderTextColor={Colors.textDim}
                            style={styles.textInput}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                            <Send size={16} color={Colors.background} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
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
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
        zIndex: 99,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    modalTitle: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    messageList: {
        flex: 1,
        padding: 15,
    },
    messageContent: {
        paddingBottom: 20,
        gap: 15,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    messageText: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        lineHeight: 16,
    },
    userText: {
        color: Colors.background,
        fontWeight: 'bold',
    },
    botText: {
        color: Colors.primary,
    },
    inputRow: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        gap: 10,
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 6,
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    sendButton: {
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default DashboardScreen;
