import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlayerControls } from '../../components/PlayerControls';
import { usePlayer } from '../../hooks/useAudio';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function Dashboard() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user, isCreator, signOut, isLoading, isAuthenticated } = useAuth();
    const { currentEpisode } = usePlayer();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            paddingTop: 60,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerLeft: {
            flex: 1,
        },
        greeting: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        roleIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        roleText: {
            fontSize: 14,
            color: colors.textSecondary,
            marginLeft: 4,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        iconButton: {
            padding: 8,
        },
        scrollView: {
            flex: 1,
        },
        quickActions: {
            padding: 20,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
        },
        actionGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        actionCard: {
            flex: 1,
            minWidth: '45%',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        actionIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        actionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
            textAlign: 'center',
        },
        actionDescription: {
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        stats: {
            padding: 20,
            paddingTop: 0,
        },
        statsGrid: {
            flexDirection: 'row',
            gap: 12,
        },
        statCard: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        statValue: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        recentSection: {
            padding: 20,
            paddingTop: 0,
        },
        recentItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        recentIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        recentContent: {
            flex: 1,
        },
        recentTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        recentSubtitle: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        playerContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },
    });

    useEffect(() => {
        // Only redirect if we're sure the user is not authenticated
        console.log('Dashboard useEffect:', { isLoading, isAuthenticated, user: !!user });
        if (!isLoading && !isAuthenticated) {
            console.log('Not authenticated, redirecting to home');
            router.replace('/');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.greeting, { marginTop: 16 }]}>Carregando...</Text>
            </View>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated || !user) {
        return null;
    }

    const creatorActions = [
        {
            icon: 'add-circle',
            title: 'Novo Podcast',
            description: 'Criar um novo podcast',
            onPress: () => router.push('/podcasts/new'),
        },
        {
            icon: 'mic',
            title: 'Gravar Episódio',
            description: 'Gravar novo episódio',
            onPress: () => router.push('/episodes/new'),
        },
        {
            icon: 'stats-chart',
            title: 'Estatísticas',
            description: 'Ver desempenho',
            onPress: () => alert('Em breve'),
        },
        {
            icon: 'wallet',
            title: 'Monetização',
            description: 'Doações e receita',
            onPress: () => alert('Em breve'),
        },
    ];

    const listenerActions = [
        {
            icon: 'search',
            title: 'Descobrir',
            description: 'Encontrar podcasts',
            onPress: () => alert('Em breve'),
        },
        {
            icon: 'heart',
            title: 'Favoritos',
            description: 'Seus podcasts salvos',
            onPress: () => alert('Em breve'),
        },
        {
            icon: 'time',
            title: 'Histórico',
            description: 'Episódios ouvidos',
            onPress: () => alert('Em breve'),
        },
        {
            icon: 'people',
            title: 'Seguindo',
            description: 'Criadores que segue',
            onPress: () => alert('Em breve'),
        },
    ];

    const actions = isCreator ? creatorActions : listenerActions;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>Olá, {user.name.split(' ')[0]}!</Text>
                    <View style={styles.roleIndicator}>
                        <Ionicons
                            name={isCreator ? "mic" : "headset"}
                            size={14}
                            color={colors.primary}
                        />
                        <Text style={styles.roleText}>
                            {isCreator ? "Criador" : "Ouvinte"}
                        </Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Ionicons name="settings" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleSignOut}
                    >
                        <Ionicons name="log-out" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: currentEpisode ? 120 : 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    <View style={styles.actionGrid}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={action.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={styles.actionIcon}>
                                    <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Text style={styles.actionDescription}>{action.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {isCreator && (
                    <View style={styles.stats}>
                        <Text style={styles.sectionTitle}>Estatísticas</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Podcasts</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Episódios</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Seguidores</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>
                        {isCreator ? "Episódios Recentes" : "Ouvido Recentemente"}
                    </Text>

                    <View style={styles.recentItem}>
                        <View style={styles.recentIcon}>
                            <Ionicons name="musical-notes" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.recentContent}>
                            <Text style={styles.recentTitle}>
                                {isCreator ? "Nenhum episódio ainda" : "Nenhum episódio ouvido"}
                            </Text>
                            <Text style={styles.recentSubtitle}>
                                {isCreator
                                    ? "Comece gravando seu primeiro episódio"
                                    : "Explore podcasts na aba Descobrir"
                                }
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {currentEpisode && (
                <View style={styles.playerContainer}>
                    <PlayerControls compact />
                </View>
            )}
        </View>
    );
}