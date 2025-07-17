// components/FloatingAudioPlayer.tsx - VERSÃO SEM CONFLITOS DE ANIMAÇÃO
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { usePlayer } from '../hooks/useAudio';
import { useTheme } from '../hooks/useTheme';
import { podcastService } from '../services/firebase';
import { Podcast } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constantes para o player
const PLAYER_WIDTH = 280;
const PLAYER_HEIGHT_COMPACT = 80;
const PLAYER_HEIGHT_EXPANDED = 200;
const MARGIN = 20;

export const FloatingAudioPlayer: React.FC = () => {
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
        togglePlayPause,
        seekTo,
        skipForward,
        skipBackward,
        setPlaybackSpeed,
        stop,
        hasError,
        errorMessage,
    } = usePlayer();

    // Estados do player
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [podcastInfo, setPodcastInfo] = useState<Podcast | null>(null);

    // ✅ POSIÇÃO DO PLAYER (sem animação - apenas state)
    const [playerPosition, setPlayerPosition] = useState({
        x: SCREEN_WIDTH - PLAYER_WIDTH - MARGIN,
        y: SCREEN_HEIGHT - PLAYER_HEIGHT_COMPACT - 120
    });

    // ✅ APENAS UMA animação simples para feedback visual
    const feedbackScale = useRef(new Animated.Value(1)).current;

    // Não renderizar se não há episódio
    if (!currentEpisode) {
        return null;
    }

    // Carregar info do podcast
    React.useEffect(() => {
        const loadPodcastInfo = async () => {
            if (currentEpisode?.podcastId) {
                try {
                    const podcast = await podcastService.getById(currentEpisode.podcastId);
                    setPodcastInfo(podcast);
                } catch (error) {
                    console.error('Erro ao carregar podcast:', error);
                }
            }
        };
        loadPodcastInfo();
    }, [currentEpisode?.podcastId]);

    // ✅ PAN RESPONDER SIMPLES SEM ANIMAÇÕES
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },

            onPanResponderGrant: () => {
                setIsDragging(true);
                // ✅ Feedback visual simples
                Animated.spring(feedbackScale, {
                    toValue: 1.05,
                    useNativeDriver: true,
                }).start();
            },

            onPanResponderMove: (evt, gestureState) => {
                // ✅ Atualizar posição diretamente no state (sem animação)
                const playerHeight = isExpanded ? PLAYER_HEIGHT_EXPANDED : PLAYER_HEIGHT_COMPACT;

                const newX = Math.max(
                    0,
                    Math.min(SCREEN_WIDTH - PLAYER_WIDTH, gestureState.moveX - PLAYER_WIDTH / 2)
                );

                const newY = Math.max(
                    60,
                    Math.min(SCREEN_HEIGHT - playerHeight - 60, gestureState.moveY - playerHeight / 2)
                );

                setPlayerPosition({ x: newX, y: newY });
            },

            onPanResponderRelease: (evt, gestureState) => {
                setIsDragging(false);

                // ✅ Remover feedback visual
                Animated.spring(feedbackScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();

                // ✅ Snap para bordas (direto no state)
                const currentX = gestureState.moveX - PLAYER_WIDTH / 2;
                const currentY = gestureState.moveY - (isExpanded ? PLAYER_HEIGHT_EXPANDED : PLAYER_HEIGHT_COMPACT) / 2;

                let snapX = currentX;
                let snapY = currentY;

                // Snap horizontal
                if (currentX < SCREEN_WIDTH / 3) {
                    snapX = MARGIN;
                } else if (currentX > (SCREEN_WIDTH * 2) / 3) {
                    snapX = SCREEN_WIDTH - PLAYER_WIDTH - MARGIN;
                }

                // Limites verticais
                const playerHeight = isExpanded ? PLAYER_HEIGHT_EXPANDED : PLAYER_HEIGHT_COMPACT;
                snapY = Math.max(60, Math.min(SCREEN_HEIGHT - playerHeight - 100, currentY));

                // ✅ Atualizar posição final no state (sem animação)
                setPlayerPosition({ x: snapX, y: snapY });
            },
        })
    ).current;

    // Expandir/Recolher player
    const toggleExpanded = () => {
        if (isDragging) return;
        setIsExpanded(!isExpanded);
    };

    // Controles de seek
    const handleSeek = (value: number) => {
        if (duration > 0) {
            const newPosition = value * duration;
            seekTo(newPosition);
        }
    };

    // Controles de velocidade
    const toggleSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIndex]);
    };

    // Ícone do botão play
    const getPlayIcon = () => {
        if (isLoading) return 'hourglass';
        return isPlaying ? 'pause' : 'play';
    };

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            left: playerPosition.x,
            top: playerPosition.y,
            width: PLAYER_WIDTH,
            backgroundColor: colors.card,
            borderRadius: 16,
            elevation: 15,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            borderWidth: 1,
            borderColor: isDragging ? colors.primary : colors.border,
            overflow: 'hidden',
            zIndex: 999,
            minHeight: isExpanded ? PLAYER_HEIGHT_EXPANDED : PLAYER_HEIGHT_COMPACT,
        },
        dragHandle: {
            position: 'absolute',
            top: 6,
            left: '50%',
            marginLeft: -15,
            width: 30,
            height: 4,
            backgroundColor: isDragging ? colors.primary : colors.border,
            borderRadius: 2,
            zIndex: 1000,
        },
        compactContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            paddingTop: 16,
            minHeight: PLAYER_HEIGHT_COMPACT,
        },
        compactCover: {
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginRight: 12,
        },
        compactCoverImage: {
            width: '100%',
            height: '100%',
        },
        rotatingCover: {
            // ✅ Animação CSS simples para rotação (sem conflicts)
            transform: isPlaying ? [{ rotate: '360deg' }] : undefined,
        },
        compactInfo: {
            flex: 1,
            marginRight: 8,
        },
        compactTitle: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
        },
        compactArtist: {
            fontSize: 11,
            color: colors.textSecondary,
        },
        compactControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        compactButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandedContent: {
            padding: 16,
            paddingTop: 20,
        },
        expandedHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        headerTitle: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            flex: 1,
        },
        closeButton: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandedInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        expandedCover: {
            width: 50,
            height: 50,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginRight: 12,
        },
        expandedCoverImage: {
            width: '100%',
            height: '100%',
        },
        expandedInfoText: {
            flex: 1,
        },
        expandedTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 3,
        },
        expandedArtist: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        progressContainer: {
            marginBottom: 12,
        },
        progressSlider: {
            height: 30,
            marginBottom: 2,
        },
        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        timeText: {
            fontSize: 10,
            color: colors.textSecondary,
        },
        mainControls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        controlButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 6,
        },
        playButtonExpanded: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 8,
        },
        secondaryControls: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        secondaryButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        speedButton: {
            backgroundColor: colors.surface,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            minWidth: 40,
            alignItems: 'center',
        },
        speedText: {
            fontSize: 10,
            fontWeight: '600',
            color: colors.text,
        },
        errorContainer: {
            backgroundColor: colors.error,
            padding: 12,
            paddingTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: PLAYER_HEIGHT_COMPACT,
        },
        errorText: {
            color: '#FFFFFF',
            fontSize: 12,
            flex: 1,
            marginLeft: 8,
        },
        errorCloseButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        progressBarCompact: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: colors.border,
        },
        progressFillCompact: {
            height: '100%',
            backgroundColor: colors.primary,
            width: `${Math.max(0, Math.min(100, progress * 100))}%`,
        },
        loadingText: {
            fontSize: 10,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 4,
        },
        dragIndicator: {
            opacity: isDragging ? 0.5 : 0,
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: 'transparent',
        },
    });

    // ✅ Estado de erro (sem animações complexas)
    if (hasError && typeof hasError === 'function' && hasError() && errorMessage) {
        return (
            <Animated.View
                style={[
                    styles.container,
                    { transform: [{ scale: feedbackScale }] }
                ]}
                {...panResponder.panHandlers}
            >
                <View style={styles.dragHandle} />
                <View style={styles.dragIndicator} />
                <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={20} color="#FFFFFF" />
                    <Text style={styles.errorText} numberOfLines={2}>
                        Erro: {errorMessage}
                    </Text>
                    <TouchableOpacity style={styles.errorCloseButton} onPress={stop}>
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ scale: feedbackScale }] }
            ]}
            {...panResponder.panHandlers}
        >
            <View style={styles.dragHandle} />
            <View style={styles.dragIndicator} />

            {!isExpanded ? (
                /* MODO COMPACTO */
                <TouchableOpacity
                    style={styles.compactContent}
                    onPress={toggleExpanded}
                    activeOpacity={0.9}
                    disabled={isDragging}
                >
                    <View style={styles.compactCover}>
                        {podcastInfo?.coverImage ? (
                            <Image
                                source={{ uri: podcastInfo.coverImage }}
                                style={[styles.compactCoverImage, styles.rotatingCover]}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="musical-notes" size={20} color={colors.primary} />
                        )}
                    </View>

                    <View style={styles.compactInfo}>
                        <Text style={styles.compactTitle} numberOfLines={1}>
                            {currentEpisode.title}
                        </Text>
                        <Text style={styles.compactArtist} numberOfLines={1}>
                            {podcastInfo?.title || `Ep. #${currentEpisode.episodeNumber}`}
                        </Text>
                    </View>

                    <View style={styles.compactControls}>
                        <TouchableOpacity
                            style={styles.compactButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                            disabled={isLoading || isDragging}
                        >
                            <Ionicons name={getPlayIcon()} size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                toggleExpanded();
                            }}
                            disabled={isDragging}
                        >
                            <Ionicons name="chevron-up" size={12} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.progressBarCompact}>
                        <View style={styles.progressFillCompact} />
                    </View>
                </TouchableOpacity>
            ) : (
                /* MODO EXPANDIDO */
                <View style={styles.expandedContent}>
                    <View style={styles.expandedHeader}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={toggleExpanded}
                            disabled={isDragging}
                        >
                            <Ionicons name="chevron-down" size={14} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>REPRODUZINDO</Text>

                        <TouchableOpacity style={styles.closeButton} onPress={stop} disabled={isDragging}>
                            <Ionicons name="close" size={14} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.expandedInfo}>
                        <View style={styles.expandedCover}>
                            {podcastInfo?.coverImage ? (
                                <Image
                                    source={{ uri: podcastInfo.coverImage }}
                                    style={[styles.expandedCoverImage, styles.rotatingCover]}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="musical-notes" size={20} color={colors.primary} />
                            )}
                        </View>

                        <View style={styles.expandedInfoText}>
                            <Text style={styles.expandedTitle} numberOfLines={2}>
                                {currentEpisode.title}
                            </Text>
                            <Text style={styles.expandedArtist}>
                                {podcastInfo?.title || 'Podcast'} • Ep. #{currentEpisode.episodeNumber}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <Slider
                            style={styles.progressSlider}
                            value={progress}
                            onValueChange={handleSeek}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                            disabled={isLoading || duration === 0 || isDragging}
                        />
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>{formattedPosition}</Text>
                            <Text style={styles.timeText}>{formattedDuration}</Text>
                        </View>
                    </View>

                    <View style={styles.mainControls}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => skipBackward(15)}
                            disabled={isLoading || isDragging}
                        >
                            <Ionicons name="play-back" size={16} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.playButtonExpanded}
                            onPress={togglePlayPause}
                            disabled={isLoading || isDragging}
                        >
                            <Ionicons name={getPlayIcon()} size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => skipForward(30)}
                            disabled={isLoading || isDragging}
                        >
                            <Ionicons name="play-forward" size={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.secondaryControls}>
                        <TouchableOpacity style={styles.speedButton} onPress={toggleSpeed} disabled={isDragging}>
                            <Text style={styles.speedText}>{playbackSpeed}×</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} disabled={isDragging}>
                            <Ionicons name="heart-outline" size={14} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} disabled={isDragging}>
                            <Ionicons name="bookmark-outline" size={14} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} disabled={isDragging}>
                            <Ionicons name="share-outline" size={14} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {isLoading && <Text style={styles.loadingText}>Carregando...</Text>}
                </View>
            )}
        </Animated.View>
    );
};