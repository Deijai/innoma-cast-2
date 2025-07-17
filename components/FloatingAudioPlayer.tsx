// components/FloatingAudioPlayer.tsx - VERSÃO SIMPLIFICADA SEM DEPENDÊNCIAS EXTERNAS
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
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

interface FloatingAudioPlayerProps {
    // Sem props necessárias - sempre ativo quando há episódio
}

export const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = () => {
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
        canPlay,
    } = usePlayer();

    // Estados do player flutuante
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [podcastInfo, setPodcastInfo] = useState<Podcast | null>(null);

    // Animações para o player flutuante
    const [rotateAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(1));

    // 🔧 CORREÇÃO: Não renderizar se não há episódio
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

    // Animação da capa quando tocando
    React.useEffect(() => {
        if (isPlaying && !isLoading) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 20000,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotateAnim.stopAnimation();
        }
    }, [isPlaying, isLoading]);

    // Expandir/Recolher player
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);

        Animated.spring(scaleAnim, {
            toValue: isExpanded ? 1 : 1.05,
            useNativeDriver: true,
        }).start();
    };

    // Controles de seek
    const handleSeek = (value: number) => {
        if (duration > 0) {
            const newPosition = value * duration;
            seekTo(newPosition);
        }
    };

    const handleSlidingStart = () => {
        setIsDragging(true);
    };

    const handleSlidingComplete = (value: number) => {
        setIsDragging(false);
        handleSeek(value);
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
        // CONTAINER PRINCIPAL - POSIÇÃO FIXA NA PARTE INFERIOR
        container: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: colors.card,
            borderRadius: isExpanded ? 16 : 12,
            elevation: 20,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
            zIndex: 999,
            minHeight: isExpanded ? 200 : 80,
            maxHeight: isExpanded ? 300 : 80,
        },

        // MODO COMPACTO
        compactContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            minHeight: 80,
        },
        compactCover: {
            width: 56,
            height: 56,
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
        compactInfo: {
            flex: 1,
            marginRight: 12,
        },
        compactTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
        },
        compactArtist: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        compactControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        compactButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // MODO EXPANDIDO
        expandedContent: {
            padding: 16,
        },
        expandedHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        headerTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            flex: 1,
        },
        closeButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // INFO EXPANDIDA
        expandedInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        expandedCover: {
            width: 60,
            height: 60,
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
        expandedCoverPlaceholder: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandedInfoText: {
            flex: 1,
        },
        expandedTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        expandedArtist: {
            fontSize: 14,
            color: colors.textSecondary,
        },

        // CONTROLES EXPANDIDOS
        progressContainer: {
            marginBottom: 16,
        },
        progressSlider: {
            height: 40,
            marginBottom: 4,
        },
        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        timeText: {
            fontSize: 12,
            color: colors.textSecondary,
        },

        mainControls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        controlButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 8,
        },
        playButtonExpanded: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 12,
        },

        secondaryControls: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        secondaryButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
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

        // ESTADOS DE ERRO
        errorContainer: {
            backgroundColor: colors.error,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 80,
        },
        errorText: {
            color: '#FFFFFF',
            fontSize: 14,
            flex: 1,
            marginLeft: 12,
        },
        errorCloseButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
        },

        // PROGRESS BAR COMPACTA
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
        },

        // LOADING STATE
        loadingText: {
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 8,
        },
    });

    // 🔧 CORREÇÃO: Renderizar estado de erro
    if (hasError() && errorMessage) {
        return (
            <Animated.View
                style={[
                    styles.container,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={24} color="#FFFFFF" />
                    <Text style={styles.errorText} numberOfLines={2}>
                        Erro: {errorMessage}
                    </Text>
                    <TouchableOpacity
                        style={styles.errorCloseButton}
                        onPress={stop}
                    >
                        <Ionicons name="close" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ scale: scaleAnim }] }
            ]}
        >
            {!isExpanded ? (
                /* MODO COMPACTO */
                <TouchableOpacity
                    style={styles.compactContent}
                    onPress={toggleExpanded}
                    activeOpacity={0.9}
                >
                    {/* CAPA */}
                    <View style={styles.compactCover}>
                        {podcastInfo?.coverImage ? (
                            <Animated.Image
                                source={{ uri: podcastInfo.coverImage }}
                                style={[
                                    styles.compactCoverImage,
                                    {
                                        transform: [{
                                            rotate: rotateAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '360deg']
                                            })
                                        }]
                                    }
                                ]}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="musical-notes" size={24} color={colors.primary} />
                        )}
                    </View>

                    {/* INFO */}
                    <View style={styles.compactInfo}>
                        <Text style={styles.compactTitle} numberOfLines={1}>
                            {currentEpisode.title}
                        </Text>
                        <Text style={styles.compactArtist} numberOfLines={1}>
                            {podcastInfo?.title || `Episódio #${currentEpisode.episodeNumber}`}
                        </Text>
                    </View>

                    {/* CONTROLES */}
                    <View style={styles.compactControls}>
                        <TouchableOpacity
                            style={styles.compactButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                            disabled={isLoading || !canPlay()}
                        >
                            <Ionicons
                                name={getPlayIcon()}
                                size={20}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                toggleExpanded();
                            }}
                        >
                            <Ionicons name="chevron-up" size={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* BARRA DE PROGRESSO COMPACTA */}
                    <View style={styles.progressBarCompact}>
                        <Animated.View
                            style={[
                                styles.progressFillCompact,
                                { width: `${Math.max(0, Math.min(100, progress * 100))}%` }
                            ]}
                        />
                    </View>
                </TouchableOpacity>
            ) : (
                /* MODO EXPANDIDO */
                <View style={styles.expandedContent}>
                    {/* HEADER */}
                    <View style={styles.expandedHeader}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={toggleExpanded}
                        >
                            <Ionicons name="chevron-down" size={18} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>REPRODUZINDO AGORA</Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={stop}
                        >
                            <Ionicons name="close" size={18} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* INFO EXPANDIDA */}
                    <View style={styles.expandedInfo}>
                        <Animated.View
                            style={[
                                styles.expandedCover,
                                {
                                    transform: [{
                                        rotate: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }]
                                }
                            ]}
                        >
                            {podcastInfo?.coverImage ? (
                                <Image
                                    source={{ uri: podcastInfo.coverImage }}
                                    style={styles.expandedCoverImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.expandedCoverPlaceholder}>
                                    <Ionicons name="musical-notes" size={24} color={colors.primary} />
                                </View>
                            )}
                        </Animated.View>

                        <View style={styles.expandedInfoText}>
                            <Text style={styles.expandedTitle} numberOfLines={2}>
                                {currentEpisode.title}
                            </Text>
                            <Text style={styles.expandedArtist}>
                                {podcastInfo?.title || 'Podcast'} • Ep. #{currentEpisode.episodeNumber}
                            </Text>
                        </View>
                    </View>

                    {/* BARRA DE PROGRESSO */}
                    <View style={styles.progressContainer}>
                        <Slider
                            style={styles.progressSlider}
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
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => skipBackward(15)}
                            disabled={isLoading}
                        >
                            <Ionicons name="play-back" size={20} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.playButtonExpanded}
                            onPress={togglePlayPause}
                            disabled={isLoading || !canPlay()}
                        >
                            <Ionicons
                                name={getPlayIcon()}
                                size={28}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => skipForward(30)}
                            disabled={isLoading}
                        >
                            <Ionicons name="play-forward" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* CONTROLES SECUNDÁRIOS */}
                    <View style={styles.secondaryControls}>
                        <TouchableOpacity
                            style={styles.speedButton}
                            onPress={toggleSpeed}
                        >
                            <Text style={styles.speedText}>{playbackSpeed}×</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton}>
                            <Ionicons name="heart-outline" size={18} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton}>
                            <Ionicons name="bookmark-outline" size={18} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton}>
                            <Ionicons name="share-outline" size={18} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* LOADING INDICATOR */}
                    {isLoading && (
                        <Text style={styles.loadingText}>
                            Carregando áudio...
                        </Text>
                    )}
                </View>
            )}
        </Animated.View>
    );
};