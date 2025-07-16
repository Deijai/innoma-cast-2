import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

export default function Settings() {
    const router = useRouter();
    const { colors, theme, setTheme, isDark } = useTheme();
    const { user, signOut } = useAuth();

    const [notifications, setNotifications] = useState(true);
    const [autoPlay, setAutoPlay] = useState(false);

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        await setTheme(newTheme);
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível sair da conta');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Excluir conta',
            'Esta ação é irreversível. Todos os seus dados serão perdidos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Funcionalidade em desenvolvimento');
                    }
                }
            ]
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            paddingTop: 60,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            padding: 8,
            marginRight: 12,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        section: {
            backgroundColor: colors.card,
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        sectionHeader: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        lastItem: {
            borderBottomWidth: 0,
        },
        settingIcon: {
            marginRight: 12,
        },
        settingContent: {
            flex: 1,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        settingDescription: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        settingValue: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
        },
        themeOptions: {
            padding: 16,
        },
        themeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
        },
        themeOptionText: {
            fontSize: 16,
            color: colors.text,
        },
        themeOptionSelected: {
            color: colors.primary,
            fontWeight: '500',
        },
        profileSection: {
            padding: 20,
            alignItems: 'center',
        },
        profileInfo: {
            alignItems: 'center',
            marginBottom: 24,
        },
        avatar: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        userName: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        userRole: {
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            marginTop: 8,
        },
        userRoleText: {
            fontSize: 12,
            color: colors.text,
            fontWeight: '500',
        },
        dangerSection: {
            marginTop: 32,
            marginBottom: 40,
        },
        dangerButton: {
            backgroundColor: colors.error,
            marginTop: 12,
        },
    });

    const themeOptions = [
        { key: 'light', label: 'Claro', icon: 'sunny' },
        { key: 'dark', label: 'Escuro', icon: 'moon' },
        { key: 'system', label: 'Sistema', icon: 'phone-portrait' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configurações</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.userRole}>
                            <Text style={styles.userRoleText}>
                                {user?.role === 'creator' ? 'Criador' : 'Ouvinte'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Aparência</Text>
                    </View>
                    <View style={styles.themeOptions}>
                        {themeOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.key}
                                style={styles.themeOption}
                                onPress={() => handleThemeChange(option.key as any)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons
                                        name={option.icon as any}
                                        size={20}
                                        color={theme === option.key ? colors.primary : colors.textSecondary}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text style={[
                                        styles.themeOptionText,
                                        theme === option.key && styles.themeOptionSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </View>
                                {theme === option.key && (
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Notificações</Text>
                    </View>
                    <View style={[styles.settingItem, styles.lastItem]}>
                        <Ionicons
                            name="notifications"
                            size={20}
                            color={colors.textSecondary}
                            style={styles.settingIcon}
                        />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Notificações push</Text>
                            <Text style={styles.settingDescription}>
                                Receber notificações de novos episódios
                            </Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Reprodução</Text>
                    </View>
                    <View style={[styles.settingItem, styles.lastItem]}>
                        <Ionicons
                            name="play"
                            size={20}
                            color={colors.textSecondary}
                            style={styles.settingIcon}
                        />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Reprodução automática</Text>
                            <Text style={styles.settingDescription}>
                                Reproduzir próximo episódio automaticamente
                            </Text>
                        </View>
                        <Switch
                            value={autoPlay}
                            onValueChange={setAutoPlay}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Conta</Text>
                    </View>
                    <TouchableOpacity style={styles.settingItem}>
                        <Ionicons
                            name="person"
                            size={20}
                            color={colors.textSecondary}
                            style={styles.settingIcon}
                        />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Editar perfil</Text>
                            <Text style={styles.settingDescription}>Alterar nome e foto</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Ionicons
                            name="lock-closed"
                            size={20}
                            color={colors.textSecondary}
                            style={styles.settingIcon}
                        />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Alterar senha</Text>
                            <Text style={styles.settingDescription}>Atualizar sua senha</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.settingItem, styles.lastItem]}>
                        <Ionicons
                            name="help-circle"
                            size={20}
                            color={colors.textSecondary}
                            style={styles.settingIcon}
                        />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Ajuda e suporte</Text>
                            <Text style={styles.settingDescription}>FAQ e contato</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.dangerSection}>
                    <Button
                        title="Sair da conta"
                        onPress={handleSignOut}
                        variant="outline"
                    />

                    <Button
                        title="Excluir conta"
                        onPress={handleDeleteAccount}
                        variant="danger"
                        style={styles.dangerButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
}