import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export default function Analytics() {
    const { colors } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

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
        periodSelector: {
            flexDirection: 'row',
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 2,
            borderWidth: 1,
            borderColor: colors.border,
        },
        periodButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
        },
        periodButtonActive: {
            backgroundColor: colors.primary,
        },
        periodButtonText: {
            fontSize: 12,
            fontWeight: '500',
            color: colors.text,
        },
        periodButtonTextActive: {
            color: '#FFFFFF',
        },
        overview: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        overviewItem: {
            alignItems: 'center',
        },
        overviewValue: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
        },
        overviewLabel: {
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
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
        },
        metricCard: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        metricHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        metricTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        metricValue: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary,
        },
        metricChange: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        metricChangeText: {
            fontSize: 12,
            marginLeft: 4,
            fontWeight: '500',
        },
        metricChangePositive: {
            color: colors.success,
        },
        metricChangeNegative: {
            color: colors.error,
        },
        chartPlaceholder: {
            height: 120,
            backgroundColor: colors.surface,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
        },
        chartPlaceholderText: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        topEpisodes: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        episodeItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        episodeItemLast: {
            borderBottomWidth: 0,
        },
        episodeRank: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        episodeRankText: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        episodeInfo: {
            flex: 1,
        },
        episodeTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        episodePodcast: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        episodeStats: {
            alignItems: 'flex-end',
        },
        episodePlays: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.primary,
        },
        episodeDuration: {
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
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
    });

    const periods = [
        { key: '7d', label: '7 dias' },
        { key: '30d', label: '30 dias' },
        { key: '90d', label: '90 dias' },
    ];

    const mockTopEpisodes = [
        {
            id: '1',
            title: 'Como começar com React Native',
            podcast: 'Tech Talk Brasil',
            plays: 1250,
            duration: '45 min',
        },
        {
            id: '2',
            title: 'Dicas de JavaScript para iniciantes',
            podcast: 'Tech Talk Brasil',
            plays: 890,
            duration: '32 min',
        },
        {
            id: '3',
            title: 'O futuro do desenvolvimento mobile',
            podcast: 'Tech Talk Brasil',
            plays: 654,
            duration: '38 min',
        },
    ];

    const hasPodcasts = mockTopEpisodes.length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <View style={styles.periodSelector}>
                        {periods.map((period) => (
                            <TouchableOpacity
                                key={period.key}
                                style={[
                                    styles.periodButton,
                                    selectedPeriod === period.key && styles.periodButtonActive
                                ]}
                                onPress={() => setSelectedPeriod(period.key as any)}
                            >
                                <Text style={[
                                    styles.periodButtonText,
                                    selectedPeriod === period.key && styles.periodButtonTextActive
                                ]}>
                                    {period.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {hasPodcasts && (
                    <View style={styles.overview}>
                        <View style={styles.overviewItem}>
                            <Text style={styles.overviewValue}>2.8K</Text>
                            <Text style={styles.overviewLabel}>Reproduções</Text>
                        </View>
                        <View style={styles.overviewItem}>
                            <Text style={styles.overviewValue}>456</Text>
                            <Text style={styles.overviewLabel}>Ouvintes</Text>
                        </View>
                        <View style={styles.overviewItem}>
                            <Text style={styles.overviewValue}>3</Text>
                            <Text style={styles.overviewLabel}>Podcasts</Text>
                        </View>
                        <View style={styles.overviewItem}>
                            <Text style={styles.overviewValue}>12</Text>
                            <Text style={styles.overviewLabel}>Episódios</Text>
                        </View>
                    </View>
                )}
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {hasPodcasts ? (
                        <>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Métricas Principais</Text>

                                <View style={styles.metricCard}>
                                    <View style={styles.metricHeader}>
                                        <Text style={styles.metricTitle}>Reproduções Totais</Text>
                                        <Ionicons name="play" size={20} color={colors.primary} />
                                    </View>
                                    <Text style={styles.metricValue}>2,847</Text>
                                    <View style={styles.metricChange}>
                                        <Ionicons name="trending-up" size={12} color={colors.success} />
                                        <Text style={[styles.metricChangeText, styles.metricChangePositive]}>
                                            +12% vs período anterior
                                        </Text>
                                    </View>
                                    <View style={styles.chartPlaceholder}>
                                        <Text style={styles.chartPlaceholderText}>Gráfico de reproduções</Text>
                                    </View>
                                </View>

                                <View style={styles.metricCard}>
                                    <View style={styles.metricHeader}>
                                        <Text style={styles.metricTitle}>Novos Seguidores</Text>
                                        <Ionicons name="people" size={20} color={colors.primary} />
                                    </View>
                                    <Text style={styles.metricValue}>89</Text>
                                    <View style={styles.metricChange}>
                                        <Ionicons name="trending-up" size={12} color={colors.success} />
                                        <Text style={[styles.metricChangeText, styles.metricChangePositive]}>
                                            +23% vs período anterior
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.metricCard}>
                                    <View style={styles.metricHeader}>
                                        <Text style={styles.metricTitle}>Tempo Médio de Escuta</Text>
                                        <Ionicons name="time" size={20} color={colors.primary} />
                                    </View>
                                    <Text style={styles.metricValue}>18m 34s</Text>
                                    <View style={styles.metricChange}>
                                        <Ionicons name="trending-down" size={12} color={colors.error} />
                                        <Text style={[styles.metricChangeText, styles.metricChangeNegative]}>
                                            -3% vs período anterior
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Top Episódios</Text>
                                <View style={styles.topEpisodes}>
                                    {mockTopEpisodes.map((episode, index) => (
                                        <View
                                            key={episode.id}
                                            style={[
                                                styles.episodeItem,
                                                index === mockTopEpisodes.length - 1 && styles.episodeItemLast
                                            ]}
                                        >
                                            <View style={styles.episodeRank}>
                                                <Text style={styles.episodeRankText}>{index + 1}</Text>
                                            </View>
                                            <View style={styles.episodeInfo}>
                                                <Text style={styles.episodeTitle} numberOfLines={1}>
                                                    {episode.title}
                                                </Text>
                                                <Text style={styles.episodePodcast}>{episode.podcast}</Text>
                                            </View>
                                            <View style={styles.episodeStats}>
                                                <Text style={styles.episodePlays}>
                                                    {episode.plays.toLocaleString()} plays
                                                </Text>
                                                <Text style={styles.episodeDuration}>{episode.duration}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="stats-chart" size={32} color={colors.textSecondary} />
                            </View>
                            <Text style={styles.emptyTitle}>Nenhuma análise disponível</Text>
                            <Text style={styles.emptySubtitle}>
                                Crie e publique podcasts para ver suas estatísticas de desempenho aqui
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}