import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { CATEGORIES } from '../../types';

export default function NewPodcast() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectImage = () => {
        // Implementar seleção de imagem
        Alert.alert('Selecionar Imagem', 'Funcionalidade em desenvolvimento');
    };

    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert('Erro', 'Por favor, digite o título do podcast');
            return false;
        }

        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, digite a descrição do podcast');
            return false;
        }

        if (!category) {
            Alert.alert('Erro', 'Por favor, selecione uma categoria');
            return false;
        }

        return true;
    };

    const handleCreatePodcast = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            // Aqui você implementaria a criação do podcast no Firebase
            // const podcastData = {
            //   title: title.trim(),
            //   description: description.trim(),
            //   category,
            //   creatorId: user?.id,
            //   coverImage: coverImage || null,
            //   createdAt: new Date(),
            //   updatedAt: new Date()
            // };

            // Simular criação
            await new Promise(resolve => setTimeout(resolve, 2000));

            Alert.alert(
                'Sucesso!',
                'Podcast criado com sucesso!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error creating podcast:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao criar o podcast');
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
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        coverImage: {
            width: '100%',
            height: '100%',
            borderRadius: 10,
        },
        imageText: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
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
                    <View style={styles.imageSection}>
                        <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
                            {coverImage ? (
                                <Image source={{ uri: coverImage }} style={styles.coverImage} />
                            ) : (
                                <>
                                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                    <Text style={styles.imageText}>Adicionar capa{'\n'}(opcional)</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Título do Podcast"
                            placeholder="Ex: Meu Podcast Incrível"
                            value={title}
                            onChangeText={setTitle}
                            leftIcon="radio"
                        />

                        <Input
                            label="Descrição"
                            placeholder="Conte sobre o que é seu podcast..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            leftIcon="document-text"
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