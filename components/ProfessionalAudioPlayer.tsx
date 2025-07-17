// components/ProfessionalAudioPlayer.tsx - VERSÃO CORRIGIDA
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { usePlayer } from '../hooks/useAudio';
import { useTheme } from '../hooks/useTheme';
import { podcastService } from '../services/firebase';
import { Podcast } from '../types';

interface ProfessionalAudioPlayerProps {
    compact?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ProfessionalAudioPlayer: React.FC<ProfessionalAudioPlayerProps> = ({ compact = false }) => {
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
        stop,
        isLoading,
        volume,
        setVolume,
        toggleMute,
        isMuted
    } = usePlayer();

    // Estados do player
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [tempPosition, setTempPosition] = useState(0);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    // ✅ CORRIGIDO: Estado para o podcast
    const [podcastInfo, setPodcastInfo] = useState<Podcast | null>(null);

    // Animações
    const [slideAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(1));
    const [rotateAnim] = useState(new Animated.Value(0));

    // ✅ CORRIGIDO: Carregar informações do podcast quando o episódio mudar
    useEffect(() => {
        const loadPodcastInfo = async () => {
            if (currentEpisode?.podcastId) {
                try {
                    console.log('📡 Carregando info do podcast:', currentEpisode.podcastId);
                    const podcast = await podcastService.getById(currentEpisode.podcastId);
                    setPodcastInfo(podcast);
                    console.log('✅ Info do podcast carregada:', podcast?.title);
                } catch (error) {
                    console.error('❌ Erro ao carregar podcast:', error);
                    setPodcastInfo(null);
                }
            } else {
                setPodcastInfo(null);
            }
        };

        loadPodcastInfo();
    }, [currentEpisode?.podcastId]);

    if (!currentEpisode) return null;

    // Animação da capa quando está tocando
    useEffect(() => {
        if (isPlaying) {
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
    }, [isPlaying]);

    const handleSeek = (value: number) => {
        if (!isDragging) {
            const newPosition = value * duration;
            seekTo(newPosition);
        }
    };

    const handleSlidingStart = () => {
        setIsDragging(true);
    };

    const handleSlidingComplete = (value: number) => {
        const newPosition = value * duration;
        seekTo(newPosition);
        setIsDragging(false);
    };

    const handleValueChange = (value: number) => {
        if (isDragging) {
            setTempPosition(value * duration);
        }
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        Animated.spring(slideAnim, {
            toValue: isExpanded ? 0 : 1,
            useNativeDriver: true,
        }).start();
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        setShowSpeedMenu(false);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Ouça "${currentEpisode.title}" ${podcastInfo ? `do podcast "${podcastInfo.title}" ` : ''}no PodcastApp!`,
                title: currentEpisode.title,
            });
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
        }
    };

    const formatTimeFromMs = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const displayPosition = isDragging ? tempPosition : position;
    const displayProgress = isDragging ? tempPosition / duration : progress;

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

    const styles = StyleSheet.create({
        // PLAYER COMPACTO
        compactContainer: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 8,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
        },
        compactContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            paddingHorizontal: 16,
        },
        compactCover: {
            width: 50,
            height: 50,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            overflow: 'hidden',
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
            padding: 8,
        },
        playButtonCompact: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
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
        },

        // PLAYER EXPANDIDO
        expandedContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        expandedHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: (StatusBar.currentHeight || 44) + 10,
            paddingHorizontal: 20,
            paddingBottom: 10,
        },
        headerButton: {
            padding: 12,
            borderRadius: 25,
            backgroundColor: colors.surface,
        },
        headerTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            textAlign: 'center',
        },
        expandedContent: {
            flex: 1,
            paddingHorizontal: 40,
            justifyContent: 'center',
        },
        albumArt: {
            width: SCREEN_WIDTH * 0.8,
            height: SCREEN_WIDTH * 0.8,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignSelf: 'center',
            marginBottom: 40,
            elevation: 20,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            overflow: 'hidden',
        },
        albumArtImage: {
            width: '100%',
            height: '100%',
        },
        albumArtPlaceholder: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        trackInfo: {
            alignItems: 'center',
            marginBottom: 30,
        },
        trackTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        trackArtist: {
            fontSize: 18,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 4,
        },
        trackEpisode: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
        },
        progressSection: {
            marginBottom: 30,
        },
        progressSlider: {
            height: 40,
            marginBottom: 8,
        },
        progressTime: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        timeText: {
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: '500',
        },
        controlsSection: {
            alignItems: 'center',
            marginBottom: 20,
        },
        mainControls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        controlButton: {
            padding: 12,
            marginHorizontal: 8,
        },
        playButton: {
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 20,
            elevation: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        secondaryControls: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        secondaryButton: {
            padding: 12,
            alignItems: 'center',
        },
        secondaryButtonText: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 4,
        },
        speedButton: {
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
        },
        speedText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },

        // MENUS E MODAIS
        speedMenu: {
            position: 'absolute',
            bottom: 100,
            left: 20,
            right: 20,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            elevation: 20,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
        },
        speedMenuTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 20,
        },
        speedOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
        },
        speedOption: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.border,
            minWidth: 60,
            alignItems: 'center',
        },
        speedOptionActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        speedOptionText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        speedOptionTextActive: {
            color: '#FFFFFF',
        },
        closeSpeedMenu: {
            position: 'absolute',
            top: 10,
            right: 10,
            padding: 8,
        },

        // VOLUME CONTROL
        volumeContainer: {
            position: 'absolute',
            bottom: 200,
            left: 20,
            right: 20,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            elevation: 15,
        },
        volumeHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        volumeTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginLeft: 10,
        },
        volumeSlider: {
            height: 40,
        },
        volumeValues: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        volumeValue: {
            fontSize: 12,
            color: colors.textSecondary,
        },

        // LOADING E ESTADOS
        loadingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        loadingContent: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 30,
            alignItems: 'center',
            elevation: 20,
        },
        loadingText: {
            fontSize: 16,
            color: colors.text,
            marginTop: 15,
        },
        bufferingIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 10,
        },
        bufferingDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            marginHorizontal: 3,
        },
    });

    // RENDER PLAYER COMPACTO
    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <TouchableOpacity
                    style={styles.compactContent}
                    onPress={toggleExpanded}
                    activeOpacity={0.9}
                >
                    <View style={styles.compactCover}>
                        {/* ✅ CORRIGIDO: Usar podcastInfo ao invés de currentEpisode.podcast */}
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
                            />
                        ) : (
                            <Ionicons name="musical-notes" size={24} color={colors.primary} />
                        )}
                    </View>

                    <View style={styles.compactInfo}>
                        <Text style={styles.compactTitle} numberOfLines={1}>
                            {currentEpisode.title}
                        </Text>
                        <Text style={styles.compactArtist} numberOfLines={1}>
                            {/* ✅ CORRIGIDO: Mostrar nome do podcast ou episódio número */}
                            {podcastInfo?.title || `Episódio #${currentEpisode.episodeNumber}`}
                        </Text>
                    </View>

                    <View style={styles.compactControls}>
                        <TouchableOpacity
                            style={styles.compactButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                        >
                            <Ionicons
                                name={isLoading ? "hourglass" : (isPlaying ? "pause" : "play")}
                                size={20}
                                color={colors.text}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.playButtonCompact}
                            onPress={(e) => {
                                e.stopPropagation();
                                toggleExpanded();
                            }}
                        >
                            <Ionicons name="chevron-up" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                {/* BARRA DE PROGRESSO COMPACTA */}
                <View style={styles.progressBarCompact}>
                    <Animated.View
                        style={[
                            styles.progressFillCompact,
                            { width: `${displayProgress * 100}%` }
                        ]}
                    />
                </View>
            </View>
        );
    }

    // RENDER PLAYER EXPANDIDO
    return (
        <Modal
            visible={isExpanded}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => setIsExpanded(false)}
        >
            <View style={styles.expandedContainer}>
                <StatusBar barStyle="light-content" backgroundColor={colors.background} />

                {/* HEADER */}
                <View style={styles.expandedHeader}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={toggleExpanded}
                    >
                        <Ionicons name="chevron-down" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View>
                        <Text style={styles.headerTitle}>REPRODUZINDO AGORA</Text>
                    </View>

                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.expandedContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* CAPA DO ÁLBUM */}
                    <Animated.View
                        style={[
                            styles.albumArt,
                            {
                                transform: [
                                    {
                                        rotate: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    },
                                    { scale: scaleAnim }
                                ]
                            }
                        ]}
                    >
                        {/* ✅ CORRIGIDO: Usar podcastInfo */}
                        {podcastInfo?.coverImage ? (
                            <Image
                                source={{ uri: podcastInfo.coverImage }}
                                style={styles.albumArtImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.albumArtPlaceholder}>
                                <Ionicons name="musical-notes" size={80} color={colors.primary} />
                            </View>
                        )}
                    </Animated.View>

                    {/* INFORMAÇÕES DA FAIXA */}
                    <View style={styles.trackInfo}>
                        <Text style={styles.trackTitle} numberOfLines={2}>
                            {currentEpisode.title}
                        </Text>
                        <Text style={styles.trackArtist} numberOfLines={1}>
                            {/* ✅ CORRIGIDO: Usar podcastInfo */}
                            {podcastInfo?.title || 'Podcast'}
                        </Text>
                        <Text style={styles.trackEpisode}>
                            Episódio #{currentEpisode.episodeNumber}
                        </Text>
                    </View>

                    {/* BARRA DE PROGRESSO */}
                    <View style={styles.progressSection}>
                        <Slider
                            style={styles.progressSlider}
                            value={displayProgress}
                            onValueChange={handleValueChange}
                            onSlidingStart={handleSlidingStart}
                            onSlidingComplete={handleSlidingComplete}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                            disabled={isLoading || duration === 0}
                        />
                        <View style={styles.progressTime}>
                            <Text style={styles.timeText}>
                                {formatTimeFromMs(displayPosition)}
                            </Text>
                            <Text style={styles.timeText}>
                                {formattedDuration}
                            </Text>
                        </View>
                    </View>

                    {/* CONTROLES PRINCIPAIS */}
                    <View style={styles.controlsSection}>
                        <View style={styles.mainControls}>
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => skipBackward(15)}
                                disabled={isLoading}
                            >
                                <Ionicons name="play-back" size={32} color={colors.text} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={togglePlayPause}
                                disabled={isLoading}
                            >
                                <Ionicons
                                    name={isLoading ? "hourglass" : (isPlaying ? "pause" : "play")}
                                    size={36}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => skipForward(30)}
                                disabled={isLoading}
                            >
                                <Ionicons name="play-forward" size={32} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* CONTROLES SECUNDÁRIOS */}
                        <View style={styles.secondaryControls}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => setShowVolumeSlider(!showVolumeSlider)}
                            >
                                <Ionicons
                                    name={isMuted ? "volume-mute" : "volume-medium"}
                                    size={24}
                                    color={colors.text}
                                />
                                <Text style={styles.secondaryButtonText}>Volume</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => setShowSpeedMenu(!showSpeedMenu)}
                            >
                                <View style={styles.speedButton}>
                                    <Text style={styles.speedText}>{playbackSpeed}×</Text>
                                </View>
                                <Text style={styles.secondaryButtonText}>Velocidade</Text>
                            </TouchableOpacity>

                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={handleLike}
                                >
                                    <Ionicons
                                        name={isLiked ? "heart" : "heart-outline"}
                                        size={24}
                                        color={isLiked ? colors.error : colors.text}
                                    />
                                    <Text style={styles.secondaryButtonText}>Curtir</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleSave}
                            >
                                <Ionicons
                                    name={isSaved ? "bookmark" : "bookmark-outline"}
                                    size={24}
                                    color={isSaved ? colors.primary : colors.text}
                                />
                                <Text style={styles.secondaryButtonText}>Salvar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleShare}
                            >
                                <Ionicons name="share-outline" size={24} color={colors.text} />
                                <Text style={styles.secondaryButtonText}>Compartilhar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* LOADING OVERLAY */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <View style={styles.loadingContent}>
                            <View style={styles.bufferingIndicator}>
                                {[0, 1, 2].map((index) => (
                                    <Animated.View
                                        key={index}
                                        style={[
                                            styles.bufferingDot,
                                            {
                                                opacity: new Animated.Value(0.3),
                                                transform: [{
                                                    scale: new Animated.Value(1)
                                                }]
                                            }
                                        ]}
                                    />
                                ))}
                            </View>
                            <Text style={styles.loadingText}>Carregando áudio...</Text>
                        </View>
                    </View>
                )}

                {/* MENU DE VELOCIDADE */}
                {showSpeedMenu && (
                    <View style={styles.speedMenu}>
                        <TouchableOpacity
                            style={styles.closeSpeedMenu}
                            onPress={() => setShowSpeedMenu(false)}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={styles.speedMenuTitle}>Velocidade de Reprodução</Text>

                        <View style={styles.speedOptions}>
                            {speeds.map((speed) => (
                                <TouchableOpacity
                                    key={speed}
                                    style={[
                                        styles.speedOption,
                                        playbackSpeed === speed && styles.speedOptionActive
                                    ]}
                                    onPress={() => handleSpeedChange(speed)}
                                >
                                    <Text style={[
                                        styles.speedOptionText,
                                        playbackSpeed === speed && styles.speedOptionTextActive
                                    ]}>
                                        {speed}×
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* CONTROLE DE VOLUME */}
                {showVolumeSlider && (
                    <View style={styles.volumeContainer}>
                        <View style={styles.volumeHeader}>
                            <Ionicons name="volume-medium" size={24} color={colors.primary} />
                            <Text style={styles.volumeTitle}>Volume</Text>
                        </View>

                        <Slider
                            style={styles.volumeSlider}
                            value={volume}
                            onValueChange={setVolume}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                        />

                        <View style={styles.volumeValues}>
                            <Text style={styles.volumeValue}>0%</Text>
                            <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
                            <Text style={styles.volumeValue}>100%</Text>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
};