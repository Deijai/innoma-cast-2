// app/(app)/episodes/new.tsx - CÓDIGO COMPLETO APÓS ALTERAÇÕES
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRecorder } from '@/hooks/useAudio';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { episodeService, podcastService, storageService } from '../../../services/firebase';
import { Podcast } from '../../../types';

export default function NewEpisode() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();
    const { podcastId } = useLocalSearchParams<{ podcastId?: string }>();

    const {
        isRecording,
        recordingDuration,
        formattedRecordingDuration,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
    } = useRecorder();

    // ESTADOS
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPodcast, setSelectedPodcast] = useState(podcastId || '');
    const [userPodcasts, setUserPodcasts] = useState<Podcast[]>([]);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingPaused, setRecordingPaused] = useState(false);
    const [loading, setLoading] = useState(true);

    // CARREGAR PODCASTS DO USUÁRIO
    useEffect(() => {
        loadUserPodcasts();
    }, [user]);

    const loadUserPodcasts = async () => {
        if (!user?.id) return;

        try {
            console.log('📡 Carregando podcasts do usuário para seleção...');
            const podcasts = await podcastService.getByCreator(user.id);
            setUserPodcasts(podcasts);

            // Se veio podcastId mas não existe, resetar
            if (podcastId && !podcasts.find(p => p.id === podcastId)) {
                setSelectedPodcast('');
                Alert.alert('Aviso', 'Podcast não encontrado. Selecione um podcast válido.');
            }

            console.log(`✅ ${podcasts.length} podcasts carregados`);
        } catch (error) {
            console.error('❌ Erro ao carregar podcasts:', error);
            Alert.alert('Erro', 'Não foi possível carregar seus podcasts');
        } finally {
            setLoading(false);
        }
    };

    // CALCULAR PRÓXIMO NÚMERO DO EPISÓDIO
    const getNextEpisodeNumber = () => {
        if (!selectedPodcast) return 1;

        const podcast = userPodcasts.find(p => p.id === selectedPodcast);
        if (!podcast?.episodes) return 1;

        const maxEpisodeNumber = Math.max(
            ...podcast.episodes.map(ep => ep.episodeNumber || 0),
            0
        );
        return maxEpisodeNumber + 1;
    };

    // VALIDAÇÕES
    const validateForm = () => {
        if (!selectedPodcast) {
            Alert.alert('Erro', 'Por favor, selecione um podcast');
            return false;
        }

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

        if (description.trim().length < 10) {
            Alert.alert('Erro', 'A descrição deve ter pelo menos 10 caracteres');
            return false;
        }

        if (!recordingUri) {
            Alert.alert('Erro', 'Por favor, grave o áudio do episódio');
            return false;
        }

        return true;
    };

    // GRAVAÇÃO
    const handleStartRecording = async () => {
        try {
            await startRecording();
            setRecordingPaused(false);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível iniciar a gravação');
            console.error('Recording error:', error);
        }
    };

    const handleStopRecording = async () => {
        try {
            const uri = await stopRecording();
            if (uri) {
                setRecordingUri(uri);
                Alert.alert('Gravação Concluída', 'Sua gravação foi salva com sucesso!');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível parar a gravação');
            console.error('Stop recording error:', error);
        }
    };

    const handlePauseRecording = async () => {
        try {
            await pauseRecording();
            setRecordingPaused(true);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível pausar a gravação');
        }
    };

    const handleResumeRecording = async () => {
        try {
            await resumeRecording();
            setRecordingPaused(false);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível retomar a gravação');
        }
    };

    // PUBLICAR EPISÓDIO - VERSÃO CORRIGIDA
    const handlePublishEpisode = async () => {
        if (!validateForm()) return;

        try {
            setIsUploading(true);

            console.log('📤 Iniciando publicação do episódio...');
            console.log('🎙️ Podcast selecionado:', selectedPodcast);
            console.log('📁 URI da gravação:', recordingUri);

            // 1. UPLOAD DO ÁUDIO PARA FIREBASE STORAGE
            console.log('⬆️ Fazendo upload do áudio...');
            const audioUrl = await storageService.uploadEpisodeAudio(
                recordingUri!,
                selectedPodcast,
                `episode-${Date.now()}`
            );
            console.log('✅ Upload concluído:', audioUrl);

            // 2. CRIAR EPISÓDIO NO FIRESTORE
            const episodeData = {
                title: title.trim(),
                description: description.trim(),
                audioUrl,
                duration: recordingDuration,
                podcastId: selectedPodcast, // ✅ AGORA TEM VALOR CORRETO!
                episodeNumber: getNextEpisodeNumber(),
                isPublished: true,
                publishedAt: new Date(),
            };

            console.log('💾 Salvando episódio no Firestore...', episodeData);
            const episodeId = await episodeService.create(episodeData);
            console.log('✅ Episódio criado com ID:', episodeId);

            Alert.alert(
                'Sucesso! 🎉',
                'Episódio publicado com sucesso!',
                [
                    {
                        text: 'Ver Podcast',
                        onPress: () => router.replace(`/(app)/podcasts/${selectedPodcast}`)
                    },
                    {
                        text: 'Meus Podcasts',
                        onPress: () => router.replace('/(app)/(tabs)/my-podcasts')
                    }
                ]
            );
        } catch (error) {
            console.error('❌ Erro ao publicar episódio:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao publicar o episódio. Tente novamente.');
        } finally {
            setIsUploading(false);
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
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
        },
        loadingText: {
            color: colors.textSecondary,
            marginTop: 16,
        },
        // NOVA SEÇÃO PARA SELEÇÃO DE PODCAST
        podcastSection: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
        },
        podcastSelector: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.surface,
        },
        podcastOption: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        podcastOptionLast: {
            borderBottomWidth: 0,
        },
        podcastOptionSelected: {
            backgroundColor: colors.primary,
        },
        radioButton: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: colors.border,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        radioButtonSelected: {
            borderColor: '#FFFFFF',
        },
        radioButtonInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#FFFFFF',
        },
        podcastInfo: {
            flex: 1,
        },
        podcastTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        podcastTitleSelected: {
            color: '#FFFFFF',
        },
        podcastMeta: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        podcastMetaSelected: {
            color: '#FFFFFF',
            opacity: 0.8,
        },
        episodePreview: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
        },
        episodePreviewText: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        recordingSection: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        recordingIcon: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isRecording && !recordingPaused ? colors.error : colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        recordingStatus: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        recordingTime: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 20,
        },
        recordingControls: {
            flexDirection: 'row',
            gap: 12,
        },
        controlButton: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            minWidth: 80,
        },
        primaryButton: {
            backgroundColor: colors.primary,
        },
        secondaryButton: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
        },
        dangerButton: {
            backgroundColor: colors.error,
        },
        buttonText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        secondaryButtonText: {
            color: colors.text,
        },
        form: {
            marginBottom: 24,
        },
        audioPreview: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
        },
        audioIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        audioInfo: {
            flex: 1,
        },
        audioTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 4,
        },
        audioDuration: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        publishButton: {
            marginTop: 20,
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
                    <Text style={styles.headerTitle}>Novo Episódio</Text>
                </View>

                <View style={styles.loadingContainer}>
                    <Ionicons name="mic" size={48} color={colors.primary} />
                    <Text style={styles.loadingText}>Carregando seus podcasts...</Text>
                </View>
            </View>
        );
    }

    if (userPodcasts.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Novo Episódio</Text>
                </View>

                <View style={styles.loadingContainer}>
                    <Ionicons name="mic-off" size={48} color={colors.textSecondary} />
                    <Text style={[styles.loadingText, { textAlign: 'center' }]}>
                        Você precisa criar um podcast antes de adicionar episódios.
                    </Text>
                    <Button
                        title="Criar Primeiro Podcast"
                        onPress={() => router.replace('/(app)/podcasts/new')}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </View>
        );
    }

    const getRecordingStatus = () => {
        if (!isRecording) return 'Pronto para gravar';
        if (recordingPaused) return 'Gravação pausada';
        return 'Gravando...';
    };

    const getRecordingIcon = () => {
        if (!isRecording) return 'mic';
        if (recordingPaused) return 'pause';
        return 'stop';
    };

    const selectedPodcastData = userPodcasts.find(p => p.id === selectedPodcast);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Novo Episódio</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* ✅ NOVA SEÇÃO: SELEÇÃO DE PODCAST */}
                    <View style={styles.podcastSection}>
                        <Text style={styles.sectionTitle}>Escolha o Podcast</Text>
                        <View style={styles.podcastSelector}>
                            {userPodcasts.map((podcast, index) => (
                                <TouchableOpacity
                                    key={podcast.id}
                                    style={[
                                        styles.podcastOption,
                                        index === userPodcasts.length - 1 && styles.podcastOptionLast,
                                        selectedPodcast === podcast.id && styles.podcastOptionSelected,
                                    ]}
                                    onPress={() => setSelectedPodcast(podcast.id)}
                                >
                                    <View style={[
                                        styles.radioButton,
                                        selectedPodcast === podcast.id && styles.radioButtonSelected
                                    ]}>
                                        {selectedPodcast === podcast.id && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>
                                    <View style={styles.podcastInfo}>
                                        <Text style={[
                                            styles.podcastTitle,
                                            selectedPodcast === podcast.id && styles.podcastTitleSelected
                                        ]}>
                                            {podcast.title}
                                        </Text>
                                        <Text style={[
                                            styles.podcastMeta,
                                            selectedPodcast === podcast.id && styles.podcastMetaSelected
                                        ]}>
                                            {podcast.episodes?.length || 0} episódios • {podcast.category}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {selectedPodcastData && (
                            <View style={styles.episodePreview}>
                                <Text style={styles.episodePreviewText}>
                                    Este será o episódio #{getNextEpisodeNumber()} de "{selectedPodcastData.title}"
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* SEÇÃO DE GRAVAÇÃO */}
                    <View style={styles.recordingSection}>
                        <View style={styles.recordingIcon}>
                            <Ionicons
                                name={getRecordingIcon() as any}
                                size={40}
                                color="#FFFFFF"
                            />
                        </View>

                        <Text style={styles.recordingStatus}>{getRecordingStatus()}</Text>
                        <Text style={styles.recordingTime}>{formattedRecordingDuration}</Text>

                        <View style={styles.recordingControls}>
                            {!isRecording ? (
                                <TouchableOpacity
                                    style={[styles.controlButton, styles.primaryButton]}
                                    onPress={handleStartRecording}
                                    disabled={!selectedPodcast}
                                >
                                    <Text style={styles.buttonText}>Iniciar</Text>
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[styles.controlButton, styles.secondaryButton]}
                                        onPress={recordingPaused ? handleResumeRecording : handlePauseRecording}
                                    >
                                        <Text style={styles.secondaryButtonText}>
                                            {recordingPaused ? 'Retomar' : 'Pausar'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.controlButton, styles.dangerButton]}
                                        onPress={handleStopRecording}
                                    >
                                        <Text style={styles.buttonText}>Parar</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>

                    {/* PREVIEW DO ÁUDIO */}
                    {recordingUri && (
                        <View style={styles.audioPreview}>
                            <View style={styles.audioIcon}>
                                <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.audioInfo}>
                                <Text style={styles.audioTitle}>Gravação concluída</Text>
                                <Text style={styles.audioDuration}>{formattedRecordingDuration}</Text>
                            </View>
                            <TouchableOpacity>
                                <Ionicons name="play" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* FORMULÁRIO */}
                    <View style={styles.form}>
                        <Input
                            label="Título do Episódio"
                            placeholder={`Ex: Episódio #${getNextEpisodeNumber()} - Introdução`}
                            value={title}
                            onChangeText={setTitle}
                            leftIcon="radio"
                            maxLength={200}
                        />

                        <Input
                            label="Descrição"
                            placeholder="Descreva sobre o que fala este episódio..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            leftIcon="document-text"
                            maxLength={2000}
                        />
                    </View>

                    {/* BOTÃO DE PUBLICAR */}
                    <Button
                        title={isUploading ? "Publicando..." : "Publicar Episódio"}
                        onPress={handlePublishEpisode}
                        loading={isUploading}
                        disabled={!recordingUri || !selectedPodcast}
                        style={styles.publishButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
}