import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export default function Library() {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'favorites' | 'history' | 'downloaded'>('favorites');

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
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 16,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
            marginLeft: 8,
        },
        tabsContainer: {
            flexDirection: 'row',
            gap: 8,
        },
        tab: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        tabActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        tabText: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
        },
        tabTextActive: {
            color: '#FFFFFF',
        },
        scrollView: {
            flex: 1,
        },
        content: {
            padding: 20,
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
        episodeItem: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        episodeCover: {
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
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
        episodePodcast: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 2,
        },
        episodeMeta: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        episodeActions: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 8,
        },
    });

    const tabs = [
        { key: 'favorites', label: 'Favoritos', icon: 'heart' },
        { key: 'history', label: 'Histórico', icon: 'time' },
        { key: 'downloaded', label: 'Downloads', icon: 'download' },
    ];

    const getEmptyState = () => {
        switch (selectedTab) {
            case 'favorites':
                return {
                    icon: 'heart',
                    title: 'Nenhum favorito ainda',
                    subtitle: 'Marque episódios como favoritos para encontrá-los facilmente aqui',
                };
            case 'history':
                return {
                    icon: 'time',
                    title: 'Histórico vazio',
                    subtitle: 'Os episódios que você ouvir aparecerão aqui',
                };
            case 'downloaded':
                return {
                    icon: 'download',
                    title: 'Nenhum download',
                    subtitle: 'Baixe episódios para ouvir offline',
                };
            default:
                return {
                    icon: 'library',
                    title: 'Biblioteca vazia',
                    subtitle: 'Suas atividades aparecerão aqui',
                };
        }
    };

    const emptyState = getEmptyState();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Biblioteca</Text>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar na biblioteca..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.tabsContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                selectedTab === tab.key && styles.tabActive
                            ]}
                            onPress={() => setSelectedTab(tab.key as any)}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedTab === tab.key && styles.tabTextActive
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name={emptyState.icon as any} size={32} color={colors.textSecondary} />
                        </View>
                        <Text style={styles.emptyTitle}>{emptyState.title}</Text>
                        <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}