import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function MyPodcasts() {
    const { colors } = useTheme();
    const router = useRouter();

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
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
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
            alignItems: 'center',
            justifyContent: 'center',
        },
        actionButton: {
            padding: 8,
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

    const mockPodcasts: any[] = []; // Simulando lista vazia para mostrar empty state

    const handleCreatePodcast = () => {
        router.push('/(app)/podcasts/new');
    };

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
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Podcasts</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Episódios</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Ouvintes</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Seguidores</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {mockPodcasts.length > 0 ? (
                        <>
                            <Text style={styles.sectionTitle}>Meus Podcasts</Text>
                            {mockPodcasts.map((podcast: any) => (
                                <TouchableOpacity
                                    key={podcast.id}
                                    style={styles.podcastItem}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.podcastHeader}>
                                        <View style={styles.podcastCover}>
                                            <Ionicons name="mic" size={24} color={colors.primary} />
                                        </View>
                                        <View style={styles.podcastInfo}>
                                            <Text style={styles.podcastTitle}>{podcast.title}</Text>
                                            <Text style={styles.podcastMeta}>{podcast.category}</Text>
                                            <Text style={styles.podcastMeta}>Criado em {podcast.createdAt}</Text>
                                        </View>
                                        <View style={styles.podcastActions}>
                                            <TouchableOpacity style={styles.actionButton}>
                                                <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.podcastStats}>
                                        <View style={styles.podcastStatItem}>
                                            <Text style={styles.podcastStatValue}>{podcast.episodes || 0}</Text>
                                            <Text style={styles.podcastStatLabel}>Episódios</Text>
                                        </View>
                                        <View style={styles.podcastStatItem}>
                                            <Text style={styles.podcastStatValue}>{podcast.plays || 0}</Text>
                                            <Text style={styles.podcastStatLabel}>Reproduções</Text>
                                        </View>
                                        <View style={styles.podcastStatItem}>
                                            <Text style={styles.podcastStatValue}>{podcast.followers || 0}</Text>
                                            <Text style={styles.podcastStatLabel}>Seguidores</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
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