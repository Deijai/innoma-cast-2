import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { podcastService, storageService } from '../../../services/firebase';
import { CATEGORIES } from '../../../types';

export default function NewPodcast() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectImage = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                setCoverImageUri(result.assets[0].uri);
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

    const handleCreatePodcast = async () => {
        if (!validateForm() || !user) return;

        try {
            setIsLoading(true);

            // Create podcast data
            const podcastData = {
                title: title.trim(),
                description: description.trim(),
                category,
                coverImage: '', // Will be updated after upload
            };

            // Create podcast in Firestore
            const podcastId = await podcastService.create(podcastData as any, user.id);

            // Upload cover image if selected
            let coverImageUrl = '';
            if (coverImageUri) {
                // Convert URI to blob for upload
                const response = await fetch(coverImageUri);
                const blob = await response.blob();

                coverImageUrl = await storageService.uploadPodcastCover(blob, podcastId);

                // Update podcast with cover image URL
                await podcastService.update(podcastId, { coverImage: coverImageUrl });
            }

            Alert.alert(
                'Sucesso! 🎉',
                'Podcast criado com sucesso! Agora você pode adicionar episódios.',
                [
                    {
                        text: 'Ver Podcasts',
                        onPress: () => router.replace('/(app)/(tabs)/my-podcasts')
                    },
                    {
                        text: 'Gravar Episódio',
                        onPress: () => router.push(`/(app)/episodes/new?podcastId=${podcastId}`)
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating podcast:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao criar o podcast. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
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
        scrollView: {
            flex: 1,
        },
        content: {
            padding: 20,
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
            borderStyle: coverImageUri ? 'solid' : 'dashed',
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
        createButton: {
            marginTop: 20,
        },
        tip: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
        },
        tipText: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Novo Podcast</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.tip}>
                        <Text style={styles.tipText}>
                            💡 Dica: Escolha um título marcante e uma descrição que explique claramente sobre o que é seu podcast. Isso ajuda os ouvintes a encontrar seu conteúdo!
                        </Text>
                    </View>

                    <View style={styles.imageSection}>
                        <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
                            {coverImageUri ? (
                                <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
                            ) : (
                                <>
                                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                    <Text style={styles.imageText}>Adicionar capa{'\n'}(opcional)</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
                            <Text style={styles.imageButtonText}>
                                {coverImageUri ? 'Alterar Imagem' : 'Escolher Imagem'}
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
                            placeholder="Conte sobre o que é seu podcast, qual o público-alvo e o que os ouvintes podem esperar..."
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

                    <Button
                        title="Criar Podcast"
                        onPress={handleCreatePodcast}
                        loading={isLoading}
                        style={styles.createButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
}