// app/(app)/(tabs)/discover.tsx - CÓDIGO COMPLETO APÓS ALTERAÇÕES
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { podcastService } from '../../../services/firebase'; // ✅ IMPORTAR SERVIÇOS REAIS
import { CATEGORIES, Podcast } from '../../../types';

export default function Discover() {
    const { colors } = useTheme();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [podcasts, setPodcasts] = useState<Podcast[]>([]); // ✅ ESTADO REAL
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // ✅ CARREGAR PODCASTS REAIS
    useEffect(() => {
        loadPodcasts();
    }, [selectedCategory]);

    // ✅ DEBOUNCE PARA BUSCA
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (searchQuery.length > 0) {
            const timeout = setTimeout(() => {
                loadPodcasts();
            }, 500); // Aguardar 500ms após parar de digitar
            setSearchTimeout(timeout);
        } else if (searchQuery.length === 0) {
            loadPodcasts();
        }

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [searchQuery]);

    const loadPodcasts = async () => {
        try {
            console.log('📡 Carregando podcasts públicos...');
            console.log('🔍 Categoria:', selectedCategory);
            console.log('🔍 Busca:', searchQuery);

            setLoading(!refreshing); // Se não está refreshing, mostrar loading

            const { podcasts: publicPodcasts } = await podcastService.getPublic(
                selectedCategory || undefined,
                searchQuery || undefined
            );

            setPodcasts(publicPodcasts);
            console.log(`✅ ${publicPodcasts.length} podcasts carregados`);
        } catch (error) {
            console.error('❌ Erro ao carregar podcasts:', error);
            Alert.alert('Erro', 'Não foi possível carregar os podcasts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadPodcasts();
    };

    const handlePodcastPress = (podcast: Podcast) => {
        router.push(`/(app)/podcasts/${podcast.id}`);
    };

    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
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
        categoriesContainer: {
            marginBottom: 8,
        },
        categoriesScrollView: {
            paddingHorizontal: 16,
        },
        categoriesContent: {
            flexDirection: 'row',
            gap: 8,
            paddingVertical: 4,
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
        loadingContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            minHeight: 200,
        },
        loadingText: {
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 16,
        },
        podcastGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
        },
        podcastCard: {
            width: '47%', // Para ter 2 colunas com espaço
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
            overflow: 'hidden',
        },
        coverImage: {
            width: '100%',
            height: '100%',
        },
        podcastTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
            minHeight: 36, // Para manter altura consistente
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
        podcastStats: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        podcastStat: {
            alignItems: 'center',
        },
        podcastStatValue: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
        },
        podcastStatLabel: {
            fontSize: 10,
            color: colors.textSecondary,
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
        resultInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 4,
        },
        resultCount: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        clearFilters: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
        },
    });

    const getSectionTitle = () => {
        if (searchQuery && selectedCategory) {
            return `"${searchQuery}" em ${selectedCategory}`;
        } else if (searchQuery) {
            return `Resultados para "${searchQuery}"`;
        } else if (selectedCategory) {
            return `Podcasts de ${selectedCategory}`;
        } else {
            return 'Podcasts em Destaque';
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Descobrir</Text>

                {/* BARRA DE BUSCA */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar podcasts ou criadores..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* CATEGORIAS HORIZONTAIS */}
                <View style={styles.categoriesContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContent}
                    >
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                !selectedCategory && styles.categoryChipSelected
                            ]}
                            onPress={() => handleCategorySelect(null)}
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
                                onPress={() => handleCategorySelect(
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
                    </ScrollView>
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
                    {/* INFO DOS RESULTADOS */}
                    {!loading && (
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultCount}>
                                {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} encontrado{podcasts.length !== 1 ? 's' : ''}
                            </Text>
                            {(searchQuery || selectedCategory) && (
                                <TouchableOpacity onPress={clearFilters}>
                                    <Text style={styles.clearFilters}>Limpar filtros</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>

                    {/* LOADING */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Ionicons name="radio" size={48} color={colors.primary} />
                            <Text style={styles.loadingText}>Carregando podcasts...</Text>
                        </View>
                    ) : podcasts.length > 0 ? (
                        /* GRID DE PODCASTS */
                        <View style={styles.podcastGrid}>
                            {podcasts.map((podcast) => (
                                <TouchableOpacity
                                    key={podcast.id}
                                    style={styles.podcastCard}
                                    onPress={() => handlePodcastPress(podcast)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.podcastCover}>
                                        {podcast.coverImage ? (
                                            <Image
                                                source={{ uri: podcast.coverImage }}
                                                style={styles.coverImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Ionicons name="radio" size={32} color={colors.primary} />
                                        )}
                                    </View>

                                    <Text style={styles.podcastTitle} numberOfLines={2}>
                                        {podcast.title}
                                    </Text>

                                    <Text style={styles.podcastCreator} numberOfLines={1}>
                                        por {podcast.creator.name}
                                    </Text>

                                    <Text style={styles.podcastCategory}>
                                        {podcast.category}
                                    </Text>

                                    <View style={styles.podcastStats}>
                                        <View style={styles.podcastStat}>
                                            <Text style={styles.podcastStatValue}>
                                                {podcast.episodes?.length || 0}
                                            </Text>
                                            <Text style={styles.podcastStatLabel}>eps</Text>
                                        </View>
                                        <View style={styles.podcastStat}>
                                            <Text style={styles.podcastStatValue}>
                                                {podcast.followers || 0}
                                            </Text>
                                            <Text style={styles.podcastStatLabel}>seguidores</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        /* ESTADO VAZIO */
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons
                                    name={searchQuery ? "search" : "radio"}
                                    size={32}
                                    color={colors.textSecondary}
                                />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {searchQuery || selectedCategory
                                    ? 'Nenhum resultado encontrado'
                                    : 'Nenhum podcast ainda'
                                }
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery || selectedCategory
                                    ? 'Tente outros termos de busca ou navegue pelas categorias'
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