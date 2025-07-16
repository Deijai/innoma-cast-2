import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { podcastService } from '../../../services/firebase';
import { Episode, Podcast } from '../../../types';
import { formatDate, formatDuration } from '../../../utils/format';

export default function PodcastView() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();

    const [podcast, setPodcast] = useState<Podcast | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadPodcast();
        }
    }, [id]);

    const loadPodcast = async () => {
        try {
            console.log('📡 Carregando podcast:', id);
            const podcastData = await podcastService.getById(id!);

            if (podcastData) {
                setPodcast(podcastData);
                console.log('✅ Podcast carregado:', podcastData.title);
            } else {
                console.log('❌ Podcast não encontrado');
                // TODO: Mostrar tela de erro
            }
        } catch (error) {
            console.error('❌ Erro ao carregar podcast:', error);
        } finally {
            setLoading(false);
        }
    };

    const isOwner = podcast?.creatorId === user?.id;

    const handleEditPodcast = () => {
        router.push(`/(app)/podcasts/edit/${id}`);
    };

    const handleAddEpisode = () => {
        router.push(`/(app)/episodes/new?podcastId=${id}`);
    };

    const handlePlayEpisode = (episode: Episode) => {
        // TODO: Implementar player
        console.log('🎵 Reproduzir episódio:', episode.title);
    };

    const handleEditEpisode = (episodeId: string) => {
        router.push(`/(app)/episodes/edit/${episodeId}`);
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
        headerActions: {
            flexDirection: 'row',
            gap: 8,
        },
        headerButton: {
            padding: 8,
        },
        scrollView: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        podcastInfo: {
            padding: 20,
            alignItems: 'center',
        },
        podcastCover: {
            width: 200,
            height: 200,
            borderRadius: 16,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            overflow: 'hidden',
        },
        coverImage: {
            width: '100%',
            height: '100%',
        },
        podcastTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        podcastCreator: {
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        podcastCategory: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
            marginBottom: 16,
        },
        podcastDescription: {
            fontSize: 16,
            color: colors.text,
            lineHeight: 24,
            textAlign: 'center',
            marginBottom: 20,
        },
        podcastStats: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 30,
            marginBottom: 20,
        },
        statItem: {
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
        actionButtons: {
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 20,
            marginBottom: 20,
        },
        actionButton: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
        },
        secondaryButton: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
        },
        actionButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        secondaryButtonText: {
            color: colors.text,
        },
        episodesSection: {
            flex: 1,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
        },
        episodeCount: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        episodesList: {
            flex: 1,
        },
        episodeItem: {
            flexDirection: 'row',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            alignItems: 'center',
        },
        episodeNumber: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        episodeNumberText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.primary,
        },
        episodeInfo: {
            flex: 1,
        },
        episodeTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        episodeMeta: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 2,
        },
        episodeActions: {
            flexDirection: 'row',
            gap: 8,
        },
        episodeActionButton: {
            padding: 8,
        },
        emptyEpisodes: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
        },
        emptyEpisodesText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 16,
        },
        addEpisodeButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        addEpisodeButtonText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
        },
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Carregando...</Text>
                </View>

                <View style={styles.loadingContainer}>
                    <Ionicons name="radio" size={48} color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
                        Carregando podcast...
                    </Text>
                </View>
            </View>
        );
    }

    if (!podcast) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Podcast não encontrado</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {podcast.title}
                </Text>

                {isOwner && (
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={handleEditPodcast}
                        >
                            <Ionicons name="create" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.podcastInfo}>
                    <View style={styles.podcastCover}>
                        {podcast.coverImage ? (
                            <Image
                                source={{ uri: podcast.coverImage }}
                                style={styles.coverImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="mic" size={80} color={colors.primary} />
                        )}
                    </View>

                    <Text style={styles.podcastTitle}>{podcast.title}</Text>
                    <Text style={styles.podcastCreator}>por {podcast.creator.name}</Text>
                    <Text style={styles.podcastCategory}>{podcast.category}</Text>
                    <Text style={styles.podcastDescription}>{podcast.description}</Text>

                    <View style={styles.podcastStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{podcast.episodes?.length || 0}</Text>
                            <Text style={styles.statLabel}>Episódios</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{podcast.followers || 0}</Text>
                            <Text style={styles.statLabel}>Seguidores</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Reproduções</Text>
                        </View>
                    </View>
                </View>

                {isOwner && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleAddEpisode}
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Novo Episódio</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={handleEditPodcast}
                        >
                            <Ionicons name="create" size={20} color={colors.text} />
                            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                                Editar
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.episodesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Episódios</Text>
                        <Text style={styles.episodeCount}>
                            {podcast.episodes?.length || 0} episódios
                        </Text>
                    </View>

                    <View style={styles.episodesList}>
                        {podcast.episodes && podcast.episodes.length > 0 ? (
                            podcast.episodes.map((episode, index) => (
                                <TouchableOpacity
                                    key={episode.id}
                                    style={styles.episodeItem}
                                    onPress={() => handlePlayEpisode(episode)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.episodeNumber}>
                                        <Text style={styles.episodeNumberText}>
                                            {episode.episodeNumber || index + 1}
                                        </Text>
                                    </View>

                                    <View style={styles.episodeInfo}>
                                        <Text style={styles.episodeTitle} numberOfLines={2}>
                                            {episode.title}
                                        </Text>
                                        <Text style={styles.episodeMeta}>
                                            {formatDate(new Date(episode.publishedAt))}
                                        </Text>
                                        <Text style={styles.episodeMeta}>
                                            {formatDuration(episode.duration / 1000)}
                                        </Text>
                                    </View>

                                    <View style={styles.episodeActions}>
                                        <TouchableOpacity
                                            style={styles.episodeActionButton}
                                            onPress={() => handlePlayEpisode(episode)}
                                        >
                                            <Ionicons name="play" size={24} color={colors.primary} />
                                        </TouchableOpacity>

                                        {isOwner && (
                                            <TouchableOpacity
                                                style={styles.episodeActionButton}
                                                onPress={() => handleEditEpisode(episode.id)}
                                            >
                                                <Ionicons name="create" size={20} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyEpisodes}>
                                <Text style={styles.emptyEpisodesText}>
                                    {isOwner
                                        ? 'Nenhum episódio criado ainda.\nComece gravando seu primeiro episódio!'
                                        : 'Este podcast ainda não possui episódios.'
                                    }
                                </Text>

                                {isOwner && (
                                    <TouchableOpacity
                                        style={styles.addEpisodeButton}
                                        onPress={handleAddEpisode}
                                    >
                                        <Ionicons name="add" size={16} color="#FFFFFF" />
                                        <Text style={styles.addEpisodeButtonText}>
                                            Criar Primeiro Episódio
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}