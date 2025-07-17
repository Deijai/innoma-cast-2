// app/(app)/episodes/edit/[id].tsx - TELA DE EDIÇÃO DE EPISÓDIO
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { episodeService, podcastService } from '../../../../services/firebase';
import { Episode, Podcast } from '../../../../types';
import { formatTime } from '../../../../utils/format';

export default function EditEpisode() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();

    // Estados
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [podcast, setPodcast] = useState<Podcast | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(true);

    useEffect(() => {
        if (id) {
            loadEpisode();
        }
    }, [id]);

    const loadEpisode = async () => {
        try {
            console.log('📡 Carregando episódio para edição:', id);

            // Carregar episódio
            const episodeData = await episodeService.getById(id!);
            if (!episodeData) {
                Alert.alert('Erro', 'Episódio não encontrado');
                router.back();
                return;
            }

            // Carregar podcast do episódio
            const podcastData = await podcastService.getById(episodeData.podcastId);
            if (!podcastData) {
                Alert.alert('Erro', 'Podcast do episódio não encontrado');
                router.back();
                return;
            }

            // Verificar se é o dono
            if (podcastData.creatorId !== user?.id) {
                Alert.alert('Acesso negado', 'Você não pode editar este episódio');
                router.back();
                return;
            }

            setEpisode(episodeData);
            setPodcast(podcastData);
            setTitle(episodeData.title);
            setDescription(episodeData.description);
            setIsPublished(episodeData.isPublished);

            console.log('✅ Episódio carregado para edição');
        } catch (error) {
            console.error('❌ Erro ao carregar episódio:', error);
            Alert.alert('Erro', 'Não foi possível carregar o episódio');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert('Erro', 'Por favor, digite o título do episódio');
            return false;
        }
        if (title.trim().length < 3) {
            Alert.alert('Erro', 'O título deve ter pelo menos 3 caracteres');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, digite a descrição do episódio');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm() || !episode) return;

        try {
            setSaving(true);

            const updates = {
                title: title.trim(),
                description: description.trim(),
                isPublished,
                updatedAt: new Date()
            };

            await episodeService.update(episode.id, updates);

            Alert.alert(
                'Sucesso! 🎉',
                'Episódio atualizado com sucesso!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error updating episode:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao atualizar o episódio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        if (!episode) return;

        Alert.alert(
            'Excluir Episódio',
            `Tem certeza que deseja excluir "${episode.title}"?\n\nEsta ação não pode ser desfeita e o arquivo de áudio também será removido.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSaving(true);
                            await episodeService.delete(episode.id);

                            Alert.alert(
                                'Sucesso',
                                'Episódio excluído com sucesso',
                                [{ text: 'OK', onPress: () => router.back() }]
                            );
                        } catch (error) {
                            console.error('Error deleting episode:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o episódio');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleViewPodcast = () => {
        if (podcast) {
            router.push(`/(app)/podcasts/${podcast.id}`);
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
        episodeInfo: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
        },
        podcastTitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        episodeNumber: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '500',
            marginBottom: 8,
        },
        audioDuration: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
            marginBottom: 8,
        },
        viewPodcastButton: {
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: colors.border,
        },
        viewPodcastText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '500',
        },
        form: {
            marginBottom: 24,
        },
        publishSection: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
        },
        publishHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        publishTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        publishDescription: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 4,
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
        actions: {
            gap: 12,
        },
        saveButton: {
            marginBottom: 12,
        },
        deleteButton: {
            backgroundColor: colors.error,
        },
        audioSection: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
        },
        audioSectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
        },
        audioInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
        },
        audioIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        audioDetails: {
            flex: 1,
        },
        audioTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        audioMeta: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        playButton: {
            padding: 8,
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
                    <Ionicons name="musical-notes" size={48} color={colors.primary} />
                    <Text style={styles.loadingText}>Carregando episódio...</Text>
                </View>
            </View>
        );
    }

    if (!episode || !podcast) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Episódio</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                        <Ionicons name="trash" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            ⚠️ Cuidado: As alterações feitas aqui afetarão como o episódio aparece para os ouvintes.
                        </Text>
                    </View>

                    {/* INFORMAÇÕES DO EPISÓDIO */}
                    <View style={styles.episodeInfo}>
                        <Text style={styles.podcastTitle}>{podcast.title}</Text>
                        <Text style={styles.episodeNumber}>
                            Episódio #{episode.episodeNumber}
                        </Text>
                        <Text style={styles.audioDuration}>
                            Duração: {formatTime(episode.duration)}
                        </Text>
                        <TouchableOpacity style={styles.viewPodcastButton} onPress={handleViewPodcast}>
                            <Text style={styles.viewPodcastText}>Ver Podcast</Text>
                        </TouchableOpacity>
                    </View>

                    {/* SEÇÃO DE ÁUDIO */}
                    <View style={styles.audioSection}>
                        <Text style={styles.audioSectionTitle}>Arquivo de Áudio</Text>
                        <View style={styles.audioInfo}>
                            <View style={styles.audioIcon}>
                                <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.audioDetails}>
                                <Text style={styles.audioTitle}>Áudio do episódio</Text>
                                <Text style={styles.audioMeta}>
                                    {formatTime(episode.duration)} • Gravado em {new Date(episode.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.playButton}>
                                <Ionicons name="play" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* FORMULÁRIO */}
                    <View style={styles.form}>
                        <Input
                            label="Título do Episódio"
                            value={title}
                            onChangeText={setTitle}
                            leftIcon="radio"
                            maxLength={200}
                            placeholder="Digite o título do episódio"
                        />

                        <Input
                            label="Descrição"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={6}
                            leftIcon="document-text"
                            maxLength={2000}
                            placeholder="Descreva sobre o que fala este episódio..."
                        />
                    </View>

                    {/* SEÇÃO DE PUBLICAÇÃO */}
                    <View style={styles.publishSection}>
                        <View style={styles.publishHeader}>
                            <View>
                                <Text style={styles.publishTitle}>Status de Publicação</Text>
                                <Text style={styles.publishDescription}>
                                    {isPublished ? 'Episódio visível publicamente' : 'Episódio salvo como rascunho'}
                                </Text>
                            </View>
                            <Switch
                                value={isPublished}
                                onValueChange={setIsPublished}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
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
                            title="Excluir Episódio"
                            onPress={handleDelete}
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