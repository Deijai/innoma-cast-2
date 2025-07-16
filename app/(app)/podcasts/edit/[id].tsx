import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { podcastService, storageService } from '../../../../services/firebase';
import { CATEGORIES, Podcast } from '../../../../types';

export default function EditPodcast() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [podcast, setPodcast] = useState<Podcast | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
    const [originalCoverImage, setOriginalCoverImage] = useState<string>('');

    useEffect(() => {
        console.log('📍 EditPodcast - ID recebido:', id);
        if (id) {
            loadPodcast();
        } else {
            console.error('❌ ID do podcast não fornecido');
            Alert.alert('Erro', 'ID do podcast não encontrado');
            router.back();
        }
    }, [id]);

    const loadPodcast = async () => {
        try {
            console.log('📡 Carregando podcast para edição:', id);
            const podcastData = await podcastService.getById(id!);

            if (podcastData) {
                console.log('✅ Podcast encontrado:', podcastData.title);

                // Verificar se é o dono do podcast
                if (podcastData.creatorId !== user?.id) {
                    console.error('❌ Usuário não é o dono do podcast');
                    Alert.alert('Erro', 'Você não tem permissão para editar este podcast');
                    router.back();
                    return;
                }

                setPodcast(podcastData);
                setTitle(podcastData.title);
                setDescription(podcastData.description);
                setCategory(podcastData.category);
                setOriginalCoverImage(podcastData.coverImage);

                console.log('✅ Dados do podcast carregados na interface');
            } else {
                console.error('❌ Podcast não encontrado no Firestore');
                Alert.alert('Erro', 'Podcast não encontrado');
                router.back();
            }
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
                Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setCoverImageUri(result.assets[0].uri);
                console.log('🖼️ Nova imagem selecionada');
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

    const uriToBlob = async (uri: string): Promise<Blob> => {
        const response = await fetch(uri);
        return await response.blob();
    };

    const handleSavePodcast = async () => {
        if (!validateForm() || !podcast) return;

        try {
            setSaving(true);
            console.log('💾 Salvando alterações do podcast...');

            // Preparar dados para atualização
            const updates: Partial<Podcast> = {
                title: title.trim(),
                description: description.trim(),
                category,
                updatedAt: new Date(),
            };

            // Se houver nova imagem, fazer upload
            if (coverImageUri) {
                try {
                    console.log('🖼️ Fazendo upload da nova capa...');
                    const blob = await uriToBlob(coverImageUri);
                    const newCoverUrl = await storageService.uploadPodcastCover(blob, podcast.id);
                    updates.coverImage = newCoverUrl;
                    console.log('✅ Nova capa enviada');
                } catch (uploadError) {
                    console.error('❌ Erro no upload da nova capa:', uploadError);
                    Alert.alert(
                        'Atenção',
                        'As informações foram salvas, mas houve um problema ao atualizar a capa. Tente novamente mais tarde.'
                    );
                }
            }

            // Atualizar podcast no Firestore
            await podcastService.update(podcast.id, updates);
            console.log('✅ Podcast atualizado');

            Alert.alert(
                'Sucesso! 🎉',
                'Podcast atualizado com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            console.log('🔙 Voltando para lista de podcasts');
                            router.back();
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Erro ao salvar podcast:', error);
            Alert.alert('Erro', 'Não foi possível salvar as alterações');
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
                            console.log('🗑️ Excluindo podcast...');
                            await podcastService.delete(podcast.id);

                            Alert.alert(
                                'Podcast Excluído',
                                'O podcast foi excluído com sucesso.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            console.log('🔙 Redirecionando para lista de podcasts');
                                            router.replace('/(app)/(tabs)/my-podcasts');
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('❌ Erro ao excluir podcast:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o podcast');
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
        },
        loadingText: {
            color: colors.textSecondary,
            marginTop: 16,
            fontSize: 16,
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
            borderStyle: coverImageUri || originalCoverImage ? 'solid' : 'dashed',
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
            marginTop: 20,
        },
        deleteButton: {
            backgroundColor: colors.error,
            marginTop: 40,
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
                    <Text style={styles.loadingText}>
                        Carregando podcast...
                    </Text>
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
                    <View style={styles.imageSection}>
                        <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
                            {coverImageUri ? (
                                <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
                            ) : originalCoverImage ? (
                                <Image source={{ uri: originalCoverImage }} style={styles.coverImage} />
                            ) : (
                                <>
                                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                    <Text style={styles.imageText}>Alterar capa</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
                            <Text style={styles.imageButtonText}>
                                {coverImageUri || originalCoverImage ? 'Alterar Imagem' : 'Adicionar Imagem'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Título do Podcast"
                            placeholder="Ex: Meu Podcast Incrível"
                            value={title}
                            onChangeText={setTitle}
                            leftIcon="radio"
                            maxLength={100}
                        />

                        <Input
                            label="Descrição"
                            placeholder="Conte sobre o que é seu podcast..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            leftIcon="document-text"
                            maxLength={2000}
                        />
                    </View>

                    <View style={styles.categorySection}>
                        <Text style={styles.categoryLabel}>Categoria</Text>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map((cat) => (
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

                    <View style={styles.actions}>
                        <Button
                            title="Salvar Alterações"
                            onPress={handleSavePodcast}
                            loading={saving}
                        />

                        <Button
                            title="Excluir Podcast"
                            onPress={handleDeletePodcast}
                            variant="danger"
                            style={styles.deleteButton}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}