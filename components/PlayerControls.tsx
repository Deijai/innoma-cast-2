// components/PlayerControls.tsx - VERSÃO SIMPLIFICADA E CORRIGIDA
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../hooks/useAudio';
import { useTheme } from '../hooks/useTheme';

interface PlayerControlsProps {
    compact?: boolean;
    showExtraControls?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    compact = false,
    showExtraControls = true
}) => {
    const { colors } = useTheme();
    const {
        isPlaying,
        isLoading,
        currentEpisode,
        position,
        duration,
        formattedPosition,
        formattedDuration,
        progress,
        playbackSpeed,
        volume,
        isMuted,
        togglePlayPause,
        seekTo,
        skipForward,
        skipBackward,
        setPlaybackSpeed,
        setVolume,
        toggleMute,
        stop,
        hasError,
        errorMessage,
        canPlay,
    } = usePlayer();

    // Estados locais para controle de UI
    const [isDragging, setIsDragging] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            padding: compact ? 12 : 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
        },

        // INFO DO EPISÓDIO
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
        episodeSubtitle: {
            fontSize: compact ? 12 : 14,
            color: colors.textSecondary,
            textAlign: 'center',
        },

        // PROGRESSO
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

        // CONTROLES PRINCIPAIS
        mainControls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: compact ? 0 : 12,
        },
        controlButton: {
            padding: compact ? 8 : 12,
            marginHorizontal: compact ? 8 : 12,
            borderRadius: compact ? 20 : 25,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        playButton: {
            backgroundColor: isLoading ? colors.textSecondary : colors.primary,
            borderRadius: compact ? 24 : 32,
            padding: compact ? 12 : 16,
            marginHorizontal: compact ? 12 : 16,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
            minWidth: compact ? 48 : 64,
            minHeight: compact ? 48 : 64,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // CONTROLES SECUNDÁRIOS
        secondaryControls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingHorizontal: compact ? 0 : 20,
        },
        secondaryButton: {
            padding: 8,
            borderRadius: 6,
            alignItems: 'center',
            minWidth: 40,
        },
        speedButton: {
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            minWidth: 50,
            alignItems: 'center',
        },
        speedText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
        },

        // CONTROLES DE VOLUME
        volumeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 8,
            marginTop: 8,
        },
        volumeSlider: {
            flex: 1,
            height: 30,
            marginHorizontal: 8,
        },
        volumeButton: {
            padding: 4,
        },

        // ESTADOS DE ERRO
        errorContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
        },
        errorText: {
            flex: 1,
            fontSize: 14,
            color: '#FFFFFF',
            marginLeft: 12,
        },
        errorCloseButton: {
            padding: 4,
        },

        // ESTADOS DE LOADING
        loadingIndicator: {
            opacity: 0.6,
        },
        loadingText: {
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 4,
        },

        // ANIMAÇÃO DE LOADING
        progressDots: {
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
            opacity: 0.3,
        },
        progressDotActive: {
            opacity: 1,
            transform: [{ scale: 1.2 }],
        },
    });

    // 🔧 CORREÇÃO: Não renderizar se não há episódio
    if (!currentEpisode) {
        return null;
    }

    // 🔧 CORREÇÃO: Exibir erro se houver
    if (hasError() && errorMessage) {
        return (
            <View style={[styles.container, { backgroundColor: colors.error }]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={24} color="#FFFFFF" />
                    <Text style={styles.errorText}>
                        Erro: {errorMessage}
                    </Text>
                    <TouchableOpacity onPress={stop} style={styles.errorCloseButton}>
                        <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // 🔧 CORREÇÃO: Controle de seek melhorado
    const handleSeek = (value: number) => {
        if (duration > 0) {
            const newPosition = value * duration;
            console.log(`🎯 Seeking to: ${Math.round(newPosition / 1000)}s`);
            seekTo(newPosition);
        }
    };

    const handleSlidingStart = () => {
        setIsDragging(true);
        console.log('🎯 Slider dragging started');
    };

    const handleSlidingComplete = (value: number) => {
        setIsDragging(false);
        handleSeek(value);
        console.log('🎯 Slider dragging completed');
    };

    // 🔧 CORREÇÃO: Controles de velocidade
    const toggleSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        const newSpeed = speeds[nextIndex];

        console.log(`⚡ Changing speed: ${playbackSpeed}x → ${newSpeed}x`);
        setPlaybackSpeed(newSpeed);
    };

    // 🔧 CORREÇÃO: Controle de play/pause seguro
    const handlePlayPause = async () => {
        try {
            if (!canPlay()) {
                Alert.alert('Aviso', 'Não é possível reproduzir agora. Tente novamente.');
                return;
            }

            console.log(`🎵 Toggle play/pause - Current state: ${isPlaying ? 'playing' : 'paused'}`);
            await togglePlayPause();
        } catch (error) {
            console.error('❌ Erro no play/pause:', error);
            Alert.alert('Erro', 'Não foi possível controlar a reprodução');
        }
    };

    // 🔧 CORREÇÃO: Controles de skip seguros
    const handleSkipForward = async () => {
        try {
            console.log('⏭️ Skipping forward 30s...');
            await skipForward(30);
        } catch (error) {
            console.error('❌ Erro ao avançar:', error);
        }
    };

    const handleSkipBackward = async () => {
        try {
            console.log('⏮️ Skipping backward 15s...');
            await skipBackward(15);
        } catch (error) {
            console.error('❌ Erro ao retroceder:', error);
        }
    };

    // 🔧 CORREÇÃO: Controle de volume melhorado
    const handleVolumeChange = (newVolume: number) => {
        console.log(`🔊 Volume changed to: ${Math.round(newVolume * 100)}%`);
        setVolume(newVolume);
    };

    const handleMuteToggle = () => {
        console.log(`🔇 Toggling mute: ${isMuted ? 'unmute' : 'mute'}`);
        toggleMute();
    };

    // 🔧 CORREÇÃO: Ícone do botão play/pause
    const getPlayIcon = () => {
        if (isLoading) return 'hourglass';
        return isPlaying ? 'pause' : 'play';
    };

    return (
        <View style={styles.container}>
            {/* INFO DO EPISÓDIO */}
            {!compact && (
                <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                        {currentEpisode.title}
                    </Text>
                    <Text style={styles.episodeSubtitle}>
                        Episódio #{currentEpisode.episodeNumber}
                    </Text>
                </View>
            )}

            {/* BARRA DE PROGRESSO */}
            <View style={styles.progressContainer}>
                <Slider
                    style={styles.slider}
                    value={progress}
                    onSlidingStart={handleSlidingStart}
                    onSlidingComplete={handleSlidingComplete}
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
            <View style={styles.mainControls}>
                {/* VOLTAR 15s */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={handleSkipBackward}
                    disabled={isLoading}
                >
                    <Ionicons
                        name="play-back"
                        size={compact ? 18 : 22}
                        color={isLoading ? colors.border : colors.text}
                    />
                </TouchableOpacity>

                {/* PLAY/PAUSE */}
                <TouchableOpacity
                    style={[styles.playButton, isLoading && styles.loadingIndicator]}
                    onPress={handlePlayPause}
                    disabled={isLoading || !canPlay()}
                >
                    <Ionicons
                        name={getPlayIcon()}
                        size={compact ? 20 : 28}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>

                {/* AVANÇAR 30s */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={handleSkipForward}
                    disabled={isLoading}
                >
                    <Ionicons
                        name="play-forward"
                        size={compact ? 18 : 22}
                        color={isLoading ? colors.border : colors.text}
                    />
                </TouchableOpacity>
            </View>

            {/* CONTROLES SECUNDÁRIOS */}
            {!compact && showExtraControls && (
                <View style={styles.secondaryControls}>
                    {/* VELOCIDADE */}
                    <TouchableOpacity
                        style={styles.speedButton}
                        onPress={toggleSpeed}
                        disabled={isLoading}
                    >
                        <Text style={styles.speedText}>{playbackSpeed}×</Text>
                    </TouchableOpacity>

                    {/* VOLUME */}
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setShowVolumeSlider(!showVolumeSlider)}
                    >
                        <Ionicons
                            name={isMuted ? "volume-mute" : "volume-medium"}
                            size={20}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    {/* PARAR */}
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={stop}
                        disabled={isLoading}
                    >
                        <Ionicons
                            name="stop"
                            size={18}
                            color={isLoading ? colors.border : colors.text}
                        />
                    </TouchableOpacity>

                    {/* FAVORITAR */}
                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="heart-outline" size={20} color={colors.text} />
                    </TouchableOpacity>

                    {/* COMPARTILHAR */}
                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="share-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            )}

            {/* CONTROLE DE VOLUME EXPANDIDO */}
            {showVolumeSlider && (
                <View style={styles.volumeContainer}>
                    <TouchableOpacity
                        style={styles.volumeButton}
                        onPress={handleMuteToggle}
                    >
                        <Ionicons
                            name={isMuted ? "volume-mute" : "volume-low"}
                            size={16}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    <Slider
                        style={styles.volumeSlider}
                        value={volume}
                        onValueChange={handleVolumeChange}
                        minimumValue={0}
                        maximumValue={1}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />

                    <TouchableOpacity
                        style={styles.volumeButton}
                        onPress={() => setVolume(1.0)}
                    >
                        <Ionicons
                            name="volume-high"
                            size={16}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* INDICADOR DE LOADING */}
            {isLoading && (
                <View>
                    <Text style={styles.loadingText}>
                        {compact ? 'Carregando...' : 'Preparando episódio...'}
                    </Text>
                    <View style={styles.progressDots}>
                        {[0, 1, 2].map((index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    // Animação simples alternando os pontos
                                    index === Math.floor(Date.now() / 500) % 3 && styles.progressDotActive
                                ]}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};