import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { podcastService } from '../../../services/firebase';
import { Podcast } from '../../../types';
import { formatDate } from '../../../utils/format';

export default function MyPodcasts() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();

    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPodcasts = async () => {
        if (!user?.id) return;

        try {
            console.log('📡 Carregando podcasts do usuário...');
            const userPodcasts = await podcastService.getByCreator(user.id);
            console.log('✅ Podcasts carregados:', userPodcasts.length);
            setPodcasts(userPodcasts);
        } catch (error) {
            console.error('❌ Erro ao carregar podcasts:', error);
            Alert.alert('Erro', 'Não foi possível carregar seus podcasts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Recarregar quando a tela ganhar foco
    useFocusEffect(
        useCallback(() => {
            loadPodcasts();
        }, [user?.id])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadPodcasts();
    };

    const handleCreatePodcast = () => {
        router.push('/(app)/podcasts/new');
    };

    const handleEditPodcast = (podcastId: string) => {
        console.log('🔧 Navegando para edição do podcast:', podcastId);
        router.push(`/(app)/podcasts/edit/${podcastId}`);
    };

    const handleViewPodcast = (podcastId: string) => {
        router.push(`/(app)/podcasts/${podcastId}`);
    };

    const handleDeletePodcast = (podcast: Podcast) => {
        Alert.alert(
            'Excluir Podcast',
            `Tem certeza que deseja excluir "${podcast.title}"?\n\nEsta ação não pode ser desfeita e todos os episódios também serão excluídos.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ Excluindo podcast:', podcast.id);
                            await podcastService.delete(podcast.id);
                            console.log('✅ Podcast excluído');

                            // Remover da lista local
                            setPodcasts(prev => prev.filter(p => p.id !== podcast.id));

                            Alert.alert('Sucesso', 'Podcast excluído com sucesso');
                        } catch (error) {
                            console.error('❌ Erro ao excluir podcast:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o podcast');
                        }
                    }
                }
            ]
        );
    };

    const handleAddEpisode = (podcastId: string) => {
        router.push(`/(app)/episodes/new?podcastId=${podcastId}`);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            padding: 20,
            paddingTop: 60,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
        },
        createButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        createButtonText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
        },
        stats: {
            flexDirection: 'row',
            gap: 20,
        },
        stat: {
            alignItems: 'center',
        },
        statValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.primary,
        },
        statLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        scrollView: {
            flex: 1,
        },
        content: {
            padding: 20,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
        },
        loadingText: {
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 16,
        },
        podcastItem: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        podcastHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        podcastCover: {
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            overflow: 'hidden',
        },
        coverImage: {
            width: '100%',
            height: '100%',
        },
        podcastInfo: {
            flex: 1,
        },
        podcastTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        podcastMeta: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 2,
        },
        podcastActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        actionButton: {
            padding: 8,
            borderRadius: 6,
        },
        podcastDescription: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: 12,
        },
        podcastStats: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        podcastStatItem: {
            alignItems: 'center',
        },
        podcastStatValue: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        podcastStatLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        quickActions: {
            flexDirection: 'row',
            marginTop: 12,
            gap: 8,
        },
        quickActionButton: {
            flex: 1,
            backgroundColor: colors.surface,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 4,
        },
        primaryAction: {
            backgroundColor: colors.primary,
        },
        quickActionText: {
            fontSize: 12,
            fontWeight: '500',
            color: colors.text,
        },
        primaryActionText: {
            color: '#FFFFFF',
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            minHeight: 300,
        },
        emptyIcon: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 24,
        },
        emptyButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        emptyButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
    });

    // Calcular estatísticas
    const totalEpisodes = podcasts.reduce((sum, podcast) => sum + (podcast.episodes?.length || 0), 0);
    const totalFollowers = podcasts.reduce((sum, podcast) => sum + (podcast.followers || 0), 0);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Meus Podcasts</Text>
                    </View>
                </View>

                <View style={styles.loadingContainer}>
                    <Ionicons name="radio" size={48} color={colors.primary} />
                    <Text style={styles.loadingText}>Carregando seus podcasts...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Meus Podcasts</Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreatePodcast}
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>Criar</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{podcasts.length}</Text>
                        <Text style={styles.statLabel}>Podcasts</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{totalEpisodes}</Text>
                        <Text style={styles.statLabel}>Episódios</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Ouvintes</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{totalFollowers}</Text>
                        <Text style={styles.statLabel}>Seguidores</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.content}>
                    {podcasts.length > 0 ? (
                        podcasts.map((podcast) => (
                            <TouchableOpacity
                                key={podcast.id}
                                style={styles.podcastItem}
                                onPress={() => handleViewPodcast(podcast.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.podcastHeader}>
                                    <View style={styles.podcastCover}>
                                        {podcast.coverImage ? (
                                            <Image
                                                source={{ uri: podcast.coverImage }}
                                                style={styles.coverImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Ionicons name="mic" size={24} color={colors.primary} />
                                        )}
                                    </View>

                                    <View style={styles.podcastInfo}>
                                        <Text style={styles.podcastTitle} numberOfLines={1}>
                                            {podcast.title}
                                        </Text>
                                        <Text style={styles.podcastMeta}>{podcast.category}</Text>
                                        <Text style={styles.podcastMeta}>
                                            Criado em {formatDate(podcast.createdAt)}
                                        </Text>
                                    </View>

                                    <View style={styles.podcastActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleEditPodcast(podcast.id)}
                                        >
                                            <Ionicons name="create" size={20} color={colors.primary} />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleDeletePodcast(podcast)}
                                        >
                                            <Ionicons name="trash" size={20} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.podcastDescription} numberOfLines={2}>
                                    {podcast.description}
                                </Text>

                                <View style={styles.podcastStats}>
                                    <View style={styles.podcastStatItem}>
                                        <Text style={styles.podcastStatValue}>
                                            {podcast.episodes?.length || 0}
                                        </Text>
                                        <Text style={styles.podcastStatLabel}>Episódios</Text>
                                    </View>
                                    <View style={styles.podcastStatItem}>
                                        <Text style={styles.podcastStatValue}>0</Text>
                                        <Text style={styles.podcastStatLabel}>Reproduções</Text>
                                    </View>
                                    <View style={styles.podcastStatItem}>
                                        <Text style={styles.podcastStatValue}>
                                            {podcast.followers || 0}
                                        </Text>
                                        <Text style={styles.podcastStatLabel}>Seguidores</Text>
                                    </View>
                                </View>

                                <View style={styles.quickActions}>
                                    <TouchableOpacity
                                        style={[styles.quickActionButton, styles.primaryAction]}
                                        onPress={() => handleAddEpisode(podcast.id)}
                                    >
                                        <Ionicons name="add" size={16} color="#FFFFFF" />
                                        <Text style={[styles.quickActionText, styles.primaryActionText]}>
                                            Novo Episódio
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quickActionButton}
                                        onPress={() => handleViewPodcast(podcast.id)}
                                    >
                                        <Ionicons name="eye" size={16} color={colors.text} />
                                        <Text style={styles.quickActionText}>Visualizar</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="mic" size={40} color={colors.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>Crie seu primeiro podcast!</Text>
                            <Text style={styles.emptySubtitle}>
                                Compartilhe suas ideias, conhecimentos e paixões com o mundo.{'\n'}
                                É fácil e rápido começar!
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={handleCreatePodcast}
                            >
                                <Ionicons name="add" size={20} color="#FFFFFF" />
                                <Text style={styles.emptyButtonText}>Criar Podcast</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}