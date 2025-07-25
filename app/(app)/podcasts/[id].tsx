// app/(app)/podcasts/edit/[id].tsx - CÓDIGO COMPLETO
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { podcastService, storageService } from '@/services/firebase';
import { CATEGORIES, Podcast } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EditPodcast() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();

    // Estados
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [podcast, setPodcast] = useState<Podcast | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [newCoverImageUri, setNewCoverImageUri] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadPodcast();
        }
    }, [id]);

    const loadPodcast = async () => {
        try {
            console.log('📡 Carregando podcast para edição:', id);
            const podcastData = await podcastService.getById(id!);

            if (!podcastData) {
                Alert.alert('Erro', 'Podcast não encontrado');
                router.back();
                return;
            }

            // Verificar se é o dono
            if (podcastData.creatorId !== user?.id) {
                Alert.alert('Acesso negado', 'Você não pode editar este podcast');
                router.back();
                return;
            }

            setPodcast(podcastData);
            setTitle(podcastData.title);
            setDescription(podcastData.description);
            setCategory(podcastData.category);
            setCoverImage(podcastData.coverImage);

            console.log('✅ Podcast carregado para edição');
        } catch (error) {
            console.error('❌ Erro ao carregar podcast:', error);
            Alert.alert('Erro', 'Não foi possível carregar o podcast');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setNewCoverImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert('Erro', 'Por favor, digite o título do podcast');
            return false;
        }
        if (title.trim().length < 3) {
            Alert.alert('Erro', 'O título deve ter pelo menos 3 caracteres');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, digite a descrição do podcast');
            return false;
        }
        if (description.trim().length < 10) {
            Alert.alert('Erro', 'A descrição deve ter pelo menos 10 caracteres');
            return false;
        }
        if (!category) {
            Alert.alert('Erro', 'Por favor, selecione uma categoria');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm() || !podcast) return;

        try {
            setSaving(true);

            let coverImageUrl = coverImage;

            // Upload nova imagem se selecionada
            if (newCoverImageUri) {
                console.log('📸 Fazendo upload da nova capa...');
                const response = await fetch(newCoverImageUri);
                const blob = await response.blob();
                coverImageUrl = await storageService.uploadPodcastCover(blob, podcast.id);
                console.log('✅ Nova capa carregada:', coverImageUrl);
            }

            // Atualizar podcast
            const updates = {
                title: title.trim(),
                description: description.trim(),
                category,
                coverImage: coverImageUrl,
                updatedAt: new Date()
            };

            console.log('💾 Atualizando podcast...', updates);
            await podcastService.update(podcast.id, updates as any);

            Alert.alert(
                'Sucesso! 🎉',
                'Podcast atualizado com sucesso!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error updating podcast:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao atualizar o podcast');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePodcast = () => {
        if (!podcast) return;

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
                            setSaving(true);
                            await podcastService.delete(podcast.id);

                            Alert.alert(
                                'Sucesso',
                                'Podcast excluído com sucesso',
                                [{
                                    text: 'OK',
                                    onPress: () => router.replace('/(app)/(tabs)/my-podcasts')
                                }]
                            );
                        } catch (error) {
                            console.error('Error deleting podcast:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o podcast');
                        } finally {
                            setSaving(false);
                        }
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
        headerActions: {
            flexDirection: 'row',
            gap: 8,
        },
        headerButton: {
            padding: 8,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            color: colors.textSecondary,
            marginTop: 16,
        },
        scrollView: {
            flex: 1,
        },
        content: {
            padding: 20,
        },
        warningBox: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.warning,
        },
        warningText: {
            fontSize: 14,
            color: colors.text,
            lineHeight: 20,
        },
        imageSection: {
            alignItems: 'center',
            marginBottom: 24,
        },
        imageContainer: {
            width: 120,
            height: 120,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            overflow: 'hidden',
        },
        coverImage: {
            width: '100%',
            height: '100%',
        },
        imageText: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        imageButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
        },
        imageButtonText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '500',
        },
        form: {
            marginBottom: 24,
        },
        categorySection: {
            marginBottom: 24,
        },
        categoryLabel: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 12,
        },
        categoryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
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
        actions: {
            gap: 12,
        },
        saveButton: {
            marginBottom: 12,
        },
        deleteButton: {
            backgroundColor: colors.error,
        },
        episodeStats: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
        },
        statsTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
        },
        statsGrid: {
            flexDirection: 'row',
            justifyContent: 'space-around',
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
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Carregando...</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Ionicons name="radio" size={48} color={colors.primary} />
                    <Text style={styles.loadingText}>Carregando podcast...</Text>
                </View>
            </View>
        );
    }

    if (!podcast) {
        return null;
    }

    const currentCoverImage = newCoverImageUri || coverImage;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Podcast</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleDeletePodcast}
                    >
                        <Ionicons name="trash" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            💡 As alterações feitas aqui afetarão como seu podcast aparece para os ouvintes.
                        </Text>
                    </View>

                    {/* ESTATÍSTICAS DO PODCAST */}
                    <View style={styles.episodeStats}>
                        <Text style={styles.statsTitle}>Estatísticas</Text>
                        <View style={styles.statsGrid}>
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

                    {/* SEÇÃO DE IMAGEM */}
                    <View style={styles.imageSection}>
                        <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
                            {currentCoverImage ? (
                                <Image source={{ uri: currentCoverImage }} style={styles.coverImage} />
                            ) : (
                                <>
                                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                    <Text style={styles.imageText}>Adicionar capa</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
                            <Text style={styles.imageButtonText}>
                                {currentCoverImage ? 'Alterar Imagem' : 'Escolher Imagem'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* FORMULÁRIO */}
                    <View style={styles.form}>
                        <Input
                            label="Título do Podcast"
                            value={title}
                            onChangeText={setTitle}
                            leftIcon="radio"
                            maxLength={100}
                            placeholder="Digite o título do podcast"
                        />

                        <Input
                            label="Descrição"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            leftIcon="document-text"
                            maxLength={2000}
                            placeholder="Descreva sobre o que é seu podcast..."
                        />
                    </View>

                    {/* SELEÇÃO DE CATEGORIA */}
                    <View style={styles.categorySection}>
                        <Text style={styles.categoryLabel}>Categoria</Text>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map((cat: any) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        category === cat && styles.categoryChipSelected
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        category === cat && styles.categoryChipTextSelected
                                    ]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* AÇÕES */}
                    <View style={styles.actions}>
                        <Button
                            title={saving ? "Salvando..." : "Salvar Alterações"}
                            onPress={handleSave}
                            loading={saving}
                            style={styles.saveButton}
                        />

                        <Button
                            title="Excluir Podcast"
                            onPress={handleDeletePodcast}
                            variant="danger"
                            style={styles.deleteButton}
                            disabled={saving}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}