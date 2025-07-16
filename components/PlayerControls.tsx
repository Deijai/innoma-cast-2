// components/PlayerControls.tsx - CÓDIGO COMPLETO APÓS ALTERAÇÕES
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../hooks/useAudio';
import { useTheme } from '../hooks/useTheme';

interface PlayerControlsProps {
    compact?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ compact = false }) => {
    const { colors } = useTheme();
    const {
        isPlaying,
        currentEpisode,
        position,
        duration,
        formattedPosition,
        formattedDuration,
        progress,
        playbackSpeed,
        togglePlayPause,
        seekTo,
        skipForward,
        skipBackward,
        setPlaybackSpeed,
        // ✅ ADICIONAR NOVAS FUNÇÕES
        stop,
        isLoading
    } = usePlayer();

    if (!currentEpisode) return null;

    const handleSeek = (value: number) => {
        const newPosition = value * duration;
        seekTo(newPosition);
    };

    const toggleSpeed = () => {
        const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIndex]);
    };

    // ✅ NOVA FUNÇÃO: Parar reprodução
    const handleStop = async () => {
        try {
            await stop();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível parar a reprodução');
        }
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            padding: compact ? 12 : 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            // ✅ ADICIONAR SOMBRA PARA DESTACAR
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
        },
        episodeInfo: {
            marginBottom: compact ? 8 : 16,
            alignItems: 'center',
        },
        episodeTitle: {
            fontSize: compact ? 14 : 16,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 4,
        },
        podcastTitle: {
            fontSize: compact ? 12 : 14,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        progressContainer: {
            marginBottom: compact ? 8 : 16,
        },
        slider: {
            height: 40,
        },
        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
        },
        timeText: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        controlsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        controlButton: {
            padding: compact ? 8 : 12,
            marginHorizontal: compact ? 8 : 12,
            borderRadius: 8,
            // ✅ ADICIONAR FEEDBACK VISUAL
            backgroundColor: 'transparent',
        },
        controlButtonPressed: {
            backgroundColor: colors.surface,
        },
        playButton: {
            backgroundColor: isLoading ? colors.textSecondary : colors.primary,
            borderRadius: compact ? 24 : 32,
            padding: compact ? 12 : 16,
            marginHorizontal: compact ? 12 : 16,
            // ✅ ADICIONAR SOMBRA
            shadowColor: colors.primary,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        speedButton: {
            backgroundColor: colors.surface,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            minWidth: 40,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        speedText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
        },
        // ✅ NOVOS ESTILOS
        loadingIndicator: {
            opacity: 0.6,
        },
        episodeProgress: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
        },
        progressDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.primary,
            marginHorizontal: 2,
            opacity: 0.6,
        },
        progressDotActive: {
            opacity: 1,
            transform: [{ scale: 1.2 }],
        },
        episodeMetadata: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 4,
        },
        episodeNumber: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '500',
        },
        divider: {
            fontSize: 12,
            color: colors.textSecondary,
            marginHorizontal: 8,
        },
        // ✅ ESTILOS PARA CONTROLES ADICIONAIS
        secondaryControls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: compact ? 8 : 12,
            paddingHorizontal: compact ? 0 : 20,
        },
        secondaryButton: {
            padding: 8,
            borderRadius: 6,
        },
        volumeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginHorizontal: 16,
        },
        volumeSlider: {
            flex: 1,
            height: 30,
        },
    });

    const PlayPauseIcon = isLoading ? 'hourglass' : (isPlaying ? 'pause' : 'play');

    return (
        <View style={styles.container}>
            {!compact && (
                <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                        {currentEpisode.title}
                    </Text>
                    <View style={styles.episodeMetadata}>
                        <Text style={styles.episodeNumber}>
                            Episódio #{currentEpisode.episodeNumber}
                        </Text>
                        <Text style={styles.divider}>•</Text>
                        <Text style={styles.podcastTitle}>
                            {/* ✅ MELHORAR: Mostrar nome do podcast se disponível */}
                            Podcast
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.progressContainer}>
                <Slider
                    style={styles.slider}
                    value={progress}
                    onValueChange={handleSeek}
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                    disabled={isLoading || duration === 0}
                />
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formattedPosition}</Text>
                    <Text style={styles.timeText}>{formattedDuration}</Text>
                </View>
            </View>

            {/* CONTROLES PRINCIPAIS */}
            <View style={styles.controlsContainer}>
                {!compact && (
                    <TouchableOpacity style={styles.speedButton} onPress={toggleSpeed}>
                        <Text style={styles.speedText}>{playbackSpeed}×</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => skipBackward(15)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="play-back"
                        size={compact ? 20 : 24}
                        color={isLoading ? colors.border : colors.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.playButton, isLoading && styles.loadingIndicator]}
                    onPress={togglePlayPause}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Ionicons name={PlayPauseIcon} size={compact ? 20 : 24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => skipForward(30)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="play-forward"
                        size={compact ? 20 : 24}
                        color={isLoading ? colors.border : colors.text}
                    />
                </TouchableOpacity>

                {!compact && (
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleStop}
                        disabled={isLoading}
                    >
                        <Ionicons
                            name="stop"
                            size={20}
                            color={isLoading ? colors.border : colors.text}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* CONTROLES SECUNDÁRIOS (apenas em modo não compacto) */}
            {!compact && (
                <View style={styles.secondaryControls}>
                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="heart-outline" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="bookmark-outline" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="share-outline" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            )}

            {/* ✅ INDICADOR DE LOADING ANIMADO */}
            {isLoading && (
                <View style={styles.episodeProgress}>
                    <Text style={[styles.timeText, { marginRight: 8 }]}>
                        {compact ? 'Carregando...' : 'Preparando episódio...'}
                    </Text>
                    {[0, 1, 2].map((index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressDot,
                                // ✅ ADICIONAR ANIMAÇÃO SIMPLES
                                index === Math.floor(Date.now() / 200) % 3 && styles.progressDotActive
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};