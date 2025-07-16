import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRecorder } from '@/hooks/useAudio';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NewEpisode() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();
    const {
        isRecording,
        recordingDuration,
        formattedRecordingDuration,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
    } = useRecorder();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPodcast, setSelectedPodcast] = useState('');
    const [recordingUri, setRecordingUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingPaused, setRecordingPaused] = useState(false);

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

    const handlePublishEpisode = async () => {
        if (!title.trim()) {
            Alert.alert('Erro', 'Por favor, digite o título do episódio');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, digite a descrição do episódio');
            return;
        }

        if (!recordingUri) {
            Alert.alert('Erro', 'Por favor, grave o áudio do episódio');
            return;
        }

        try {
            setIsUploading(true);

            // Aqui você implementaria o upload do áudio e criação do episódio
            // const episodeData = {
            //   title: title.trim(),
            //   description: description.trim(),
            //   audioUri: recordingUri,
            //   duration: recordingDuration,
            //   podcastId: selectedPodcast,
            //   creatorId: user?.id,
            //   publishedAt: new Date(),
            //   createdAt: new Date()
            // };

            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 3000));

            Alert.alert(
                'Sucesso!',
                'Episódio publicado com sucesso!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error publishing episode:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao publicar o episódio');
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

                    <View style={styles.form}>
                        <Input
                            label="Título do Episódio"
                            placeholder="Ex: Episódio #1 - Introdução"
                            value={title}
                            onChangeText={setTitle}
                            leftIcon="radio"
                        />

                        <Input
                            label="Descrição"
                            placeholder="Descreva sobre o que fala este episódio..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            leftIcon="document-text"
                        />
                    </View>

                    <Button
                        title="Publicar Episódio"
                        onPress={handlePublishEpisode}
                        loading={isUploading}
                        disabled={!recordingUri}
                        style={styles.publishButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
}