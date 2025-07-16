import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { CATEGORIES } from '../../../types';

export default function Discover() {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
            marginLeft: 8,
        },
        scrollView: {
            flex: 1,
        },
        section: {
            padding: 20,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
        },
        categoriesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 20,
        },
        categoryChip: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        categoryChipSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        categoryChipText: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
        },
        categoryChipTextSelected: {
            color: '#FFFFFF',
        },
        podcastGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
        },
        podcastCard: {
            width: '45%',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        podcastCover: {
            width: '100%',
            aspectRatio: 1,
            backgroundColor: colors.surface,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
        },
        podcastTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        podcastCreator: {
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        podcastCategory: {
            fontSize: 10,
            color: colors.primary,
            fontWeight: '500',
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
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

    const mockPodcasts = [
        {
            id: '1',
            title: 'Tech Talk Brasil',
            creator: 'João Silva',
            category: 'Tecnologia',
            cover: null,
        },
        {
            id: '2',
            title: 'Histórias do Passado',
            creator: 'Maria Santos',
            category: 'História',
            cover: null,
        },
    ];

    const filteredPodcasts = mockPodcasts.filter(podcast => {
        const matchesSearch = searchQuery === '' ||
            podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            podcast.creator.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !selectedCategory || podcast.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Descobrir</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar podcasts ou criadores..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categorias</Text>
                    <View style={styles.categoriesContainer}>
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                !selectedCategory && styles.categoryChipSelected
                            ]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                !selectedCategory && styles.categoryChipTextSelected
                            ]}>
                                Todas
                            </Text>
                        </TouchableOpacity>
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category && styles.categoryChipSelected
                                ]}
                                onPress={() => setSelectedCategory(
                                    selectedCategory === category ? null : category
                                )}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    selectedCategory === category && styles.categoryChipTextSelected
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {searchQuery ? `Resultados para "${searchQuery}"` : 'Podcasts em Destaque'}
                    </Text>

                    {filteredPodcasts.length > 0 ? (
                        <View style={styles.podcastGrid}>
                            {filteredPodcasts.map((podcast) => (
                                <TouchableOpacity
                                    key={podcast.id}
                                    style={styles.podcastCard}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.podcastCover}>
                                        <Ionicons name="radio" size={32} color={colors.primary} />
                                    </View>
                                    <Text style={styles.podcastTitle} numberOfLines={2}>
                                        {podcast.title}
                                    </Text>
                                    <Text style={styles.podcastCreator} numberOfLines={1}>
                                        {podcast.creator}
                                    </Text>
                                    <Text style={styles.podcastCategory}>
                                        {podcast.category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="search" size={32} color={colors.textSecondary} />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum podcast ainda'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery
                                    ? `Tente buscar por outros termos ou navegue pelas categorias`
                                    : 'Os criadores ainda estão preparando conteúdo incrível para você!'
                                }
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}