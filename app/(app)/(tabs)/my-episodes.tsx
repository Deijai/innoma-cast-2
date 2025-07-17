// app/(app)/(tabs)/my-episodes.tsx - NOVA ABA PARA CRIADORES
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../../../hooks/useAudio';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { episodeService, podcastService } from '../../../services/firebase';
import { Episode, Podcast } from '../../../types';
import { formatDate, formatDuration } from '../../../utils/format';

interface EpisodeWithPodcast extends Episode {
    podcast: Podcast;
}

export default function MyEpisodes() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const { currentEpisode, isPlaying, playEpisode } = usePlayer();
    const router = useRouter();

    const [episodes, setEpisodes] = useState<EpisodeWithPodcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'draft'>('all');

    const loadEpisodes = async () => {
        if (!user?.id) return;

        try {
            console.log('📡 Carregando episódios do usuário...');

            // 1. Buscar todos os podcasts do usuário
            const userPodcasts = await podcastService.getByCreator(user.id);

            // 2. Para cada podcast, buscar todos os episódios (incluindo rascunhos)
            const allEpisodes: EpisodeWithPodcast[] = [];

            for (const podcast of userPodcasts) {
                const podcastEpisodes = await episodeService.getByPodcast(podcast.id, false); // false = incluir rascunhos

                // Adicionar informação do podcast a cada episódio
                const episodesWithPodcast = podcastEpisodes.map(episode => ({
                    ...episode,
                    podcast
                }));

                allEpisodes.push(...episodesWithPodcast);
            }

            // 3. Ordenar por data de criação (mais recentes primeiro)
            allEpisodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setEpisodes(allEpisodes);
            console.log(`✅ ${allEpisodes.length} episódios carregados`);
        } catch (error) {
            console.error('❌ Erro ao carregar episódios:', error);
            Alert.alert('Erro', 'Não foi possível carregar seus episódios');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Recarregar quando a tela ganhar foco
    useFocusEffect(
        useCallback(() => {
            loadEpisodes();
        }, [user?.id])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadEpisodes();
    };

    const handlePlayEpisode = async (episode: Episode) => {
        try {
            console.log('🎵 Reproduzindo episódio:', episode.title);
            await playEpisode(episode);
        } catch (error) {
            console.error('❌ Erro ao reproduzir:', error);
            Alert.alert('Erro', 'Não foi possível reproduzir este episódio');
        }
    };

    const handleEditEpisode = (episodeId: string) => {
        router.push(`/(app)/episodes/edit/${episodeId}`);
    };

    const handleDeleteEpisode = (episode: Episode) => {
        Alert.alert(
            'Excluir Episódio',
            `Tem certeza que deseja excluir "${episode.title}"?\n\nEsta ação não pode ser desfeita.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ Excluindo episódio:', episode.id);
                            await episodeService.delete(episode.id);

                            // Remover da lista local
                            setEpisodes(prev => prev.filter(ep => ep.id !== episode.id));

                            Alert.alert('Sucesso', 'Episódio excluído com sucesso');
                        } catch (error) {
                            console.error('❌ Erro ao excluir:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o episódio');
                        }
                    }
                }
            ]
        );
    };

    const handleViewPodcast = (podcastId: string) => {
        router.push(`/(app)/podcasts/${podcastId}`);
    };

    const handleCreateEpisode = () => {
        router.push('/(app)/episodes/new');
    };

    // Filtrar episódios
    const filteredEpisodes = episodes.filter(episode => {
        if (selectedFilter === 'published') return episode.isPublished;
        if (selectedFilter === 'draft') return !episode.isPublished;
        return true; // 'all'
    });

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
        filters: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
        },
        filterButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        filterButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        filterButtonText: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
        },
        filterButtonTextActive: {
            color: '#FFFFFF',
        },
        stats: {
            flexDirection: 'row',
            justifyContent: 'space-around',
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
        episodeItem: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        episodeItemCurrent: {
            borderColor: colors.primary,
            backgroundColor: colors.surface,
        },
        episodeHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
        },
        episodeInfo: {
            flex: 1,
            marginRight: 8,
        },
        episodeTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        episodeTitleCurrent: {
            color: colors.primary,
        },
        podcastName: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
            marginBottom: 2,
        },
        episodeMeta: {
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 1,
        },
        episodeActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        actionButton: {
            padding: 8,
            borderRadius: 6,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginTop: 8,
        },
        statusBadgePublished: {
            backgroundColor: colors.success,
        },
        statusBadgeDraft: {
            backgroundColor: colors.warning,
        },
        statusBadgeText: {
            fontSize: 12,
            fontWeight: '500',
            color: '#FFFFFF',
        },
        episodeDescription: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
            marginTop: 8,
        },
        quickActions: {
            flexDirection: 'row',
            marginTop: 12,
            gap: 8,
        },
        quickAction: {
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

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Meus Episódios</Text>
                    </View>
                </View>

                <View style={styles.loadingContainer}>
                    <Ionicons name="musical-notes" size={48} color={colors.primary} />
                    <Text style={styles.loadingText}>Carregando seus episódios...</Text>
                </View>
            </View>
        );
    }

    // Calcular estatísticas
    const totalEpisodes = episodes.length;
    const publishedCount = episodes.filter(ep => ep.isPublished).length;
    const draftCount = episodes.filter(ep => !ep.isPublished).length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Meus Episódios</Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateEpisode}
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>Novo</Text>
                    </TouchableOpacity>
                </View>

                {/* FILTROS */}
                <View style={styles.filters}>
                    {[
                        { key: 'all', label: 'Todos', count: totalEpisodes },
                        { key: 'published', label: 'Publicados', count: publishedCount },
                        { key: 'draft', label: 'Rascunhos', count: draftCount },
                    ].map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter.key && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter(filter.key as any)}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                selectedFilter === filter.key && styles.filterButtonTextActive
                            ]}>
                                {filter.label} ({filter.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ESTATÍSTICAS */}
                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{totalEpisodes}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{publishedCount}</Text>
                        <Text style={styles.statLabel}>Publicados</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{draftCount}</Text>
                        <Text style={styles.statLabel}>Rascunhos</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Reproduções</Text>
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
                    {filteredEpisodes.length > 0 ? (
                        filteredEpisodes.map((episode) => {
                            const isCurrentEpisode = currentEpisode?.id === episode.id;

                            return (
                                <View
                                    key={episode.id}
                                    style={[
                                        styles.episodeItem,
                                        isCurrentEpisode && styles.episodeItemCurrent
                                    ]}
                                >
                                    <View style={styles.episodeHeader}>
                                        <View style={styles.episodeInfo}>
                                            <Text style={styles.podcastName}>
                                                {episode.podcast.title}
                                            </Text>
                                            <Text style={[
                                                styles.episodeTitle,
                                                isCurrentEpisode && styles.episodeTitleCurrent
                                            ]} numberOfLines={2}>
                                                {episode.title}
                                            </Text>
                                            <Text style={styles.episodeMeta}>
                                                Episódio #{episode.episodeNumber} • {formatDate(episode.createdAt)}
                                            </Text>
                                            <Text style={styles.episodeMeta}>
                                                {formatDuration(episode.duration / 1000)}
                                            </Text>
                                        </View>

                                        <View style={styles.episodeActions}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handlePlayEpisode(episode)}
                                            >
                                                <Ionicons
                                                    name={isCurrentEpisode && isPlaying ? "pause" : "play"}
                                                    size={24}
                                                    color={isCurrentEpisode ? colors.primary : colors.textSecondary}
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleEditEpisode(episode.id)}
                                            >
                                                <Ionicons name="create" size={20} color={colors.textSecondary} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleDeleteEpisode(episode)}
                                            >
                                                <Ionicons name="trash" size={20} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* STATUS */}
                                    <View style={[
                                        styles.statusBadge,
                                        episode.isPublished ? styles.statusBadgePublished : styles.statusBadgeDraft
                                    ]}>
                                        <Text style={styles.statusBadgeText}>
                                            {episode.isPublished ? 'Publicado' : 'Rascunho'}
                                        </Text>
                                    </View>

                                    {/* DESCRIÇÃO */}
                                    {episode.description && (
                                        <Text style={styles.episodeDescription} numberOfLines={2}>
                                            {episode.description}
                                        </Text>
                                    )}

                                    {/* AÇÕES RÁPIDAS */}
                                    <View style={styles.quickActions}>
                                        <TouchableOpacity
                                            style={[styles.quickAction, styles.primaryAction]}
                                            onPress={() => handlePlayEpisode(episode)}
                                        >
                                            <Ionicons
                                                name={isCurrentEpisode && isPlaying ? "pause" : "play"}
                                                size={16}
                                                color="#FFFFFF"
                                            />
                                            <Text style={[styles.quickActionText, styles.primaryActionText]}>
                                                {isCurrentEpisode && isPlaying ? 'Pausar' : 'Reproduzir'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.quickAction}
                                            onPress={() => handleViewPodcast(episode.podcast.id)}
                                        >
                                            <Ionicons name="radio" size={16} color={colors.text} />
                                            <Text style={styles.quickActionText}>Ver Podcast</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.quickAction}
                                            onPress={() => handleEditEpisode(episode.id)}
                                        >
                                            <Ionicons name="create" size={16} color={colors.text} />
                                            <Text style={styles.quickActionText}>Editar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="musical-notes" size={40} color={colors.textSecondary} />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {selectedFilter === 'published' ? 'Nenhum episódio publicado' :
                                    selectedFilter === 'draft' ? 'Nenhum rascunho' :
                                        'Nenhum episódio criado'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {selectedFilter === 'published' ? 'Publique seus primeiros episódios para aparecerem aqui.' :
                                    selectedFilter === 'draft' ? 'Episódios em rascunho aparecerão aqui.' :
                                        'Comece gravando seu primeiro episódio!'
                                }
                            </Text>
                            {selectedFilter === 'all' && (
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={handleCreateEpisode}
                                >
                                    <Ionicons name="add" size={20} color="#FFFFFF" />
                                    <Text style={styles.emptyButtonText}>Criar Primeiro Episódio</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}