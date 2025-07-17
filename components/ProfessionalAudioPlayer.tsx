// components/ProfessionalAudioPlayer.tsx - VERSÃO CORRIGIDA E MELHORADA
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
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
        isMuted,
        hasError,
        errorMessage
    } = usePlayer();

    // Estados locais
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [tempPosition, setTempPosition] = useState(0);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [podcastInfo, setPodcastInfo] = useState<Podcast | null>(null);

    const styles = StyleSheet.create({
        // PLAYER COMPACTO - CORRIGIDO
        compactContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 20,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            zIndex: 1000, // 🔧 CORREÇÃO: Z-index alto para ficar sobre tudo
        },
        compactContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            paddingHorizontal: 16,
            minHeight: 70, // 🔧 CORREÇÃO: Altura mínima
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
            justifyContent: 'center', // 🔧 CORREÇÃO: Centralizar verticalmente
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
            borderRadius: 20, // 🔧 CORREÇÃO: Bordas arredondadas
            backgroundColor: colors.surface,
        },
        playButtonCompact: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 4, // 🔧 CORREÇÃO: Sombra
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

        // PLAYER EXPANDIDO - CORRIGIDO
        expandedContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        safeArea: {
            flex: 1,
        },
        expandedHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerButton: {
            padding: 12,
            borderRadius: 25,
            backgroundColor: colors.surface,
        },
        headerTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
        },
        expandedContent: {
            flex: 1,
            paddingHorizontal: 40,
            paddingVertical: 20,
            justifyContent: 'space-between', // 🔧 CORREÇÃO: Distribuir espaço
        },
        albumArt: {
            width: SCREEN_WIDTH * 0.75, // 🔧 CORREÇÃO: Tamanho mais responsivo
            height: SCREEN_WIDTH * 0.75,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignSelf: 'center',
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
            paddingVertical: 20,
        },
        trackTitle: {
            fontSize: 22, // 🔧 CORREÇÃO: Tamanho menor para caber melhor
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        trackArtist: {
            fontSize: 16,
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
            paddingVertical: 20,
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
            paddingBottom: 20,
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
            borderRadius: 25, // 🔧 CORREÇÃO: Bordas arredondadas
            backgroundColor: 'transparent',
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
            borderRadius: 12, // 🔧 CORREÇÃO: Bordas arredondadas
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
            minWidth: 50, // 🔧 CORREÇÃO: Largura mínima
            alignItems: 'center',
        },
        speedText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },

        // MENUS E OVERLAYS - CORRIGIDOS
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // 🔧 CORREÇÃO: Z-index muito alto
        },
        menuContainer: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            marginHorizontal: 20,
            elevation: 25,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            maxHeight: SCREEN_HEIGHT * 0.7, // 🔧 CORREÇÃO: Altura máxima
        },
        menuTitle: {
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
        closeButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            padding: 8,
            borderRadius: 15,
            backgroundColor: colors.surface,
        },

        // VOLUME CONTROL - CORRIGIDO
        volumeSlider: {
            height: 40,
            marginVertical: 10,
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

        // LOADING E ESTADOS - CORRIGIDOS
        loadingIndicator: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        },
        loadingText: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 10,
            textAlign: 'center',
        },
    });

    // Animações
    const [rotateAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(1));

    // 🔧 CORREÇÃO: Carregar informações do podcast
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

    // 🔧 CORREÇÃO: Animação da capa melhorada
    useEffect(() => {
        if (isPlaying && !isLoading) {
            const animation = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 20000,
                    useNativeDriver: true,
                })
            );
            animation.start();
            return () => animation.stop();
        } else {
            rotateAnim.stopAnimation();
        }
    }, [isPlaying, isLoading]);

    // 🔧 CORREÇÃO: Não renderizar se não há episódio
    if (!currentEpisode) {
        console.log('❌ Nenhum episódio carregado no player');
        return null;
    }

    // 🔧 CORREÇÃO: Gestão de erro melhorada
    if (hasError() && errorMessage) {
        console.error('❌ Player com erro:', errorMessage);
        return (
            <View style={[styles.compactContainer, { backgroundColor: colors.error }]}>
                <View style={styles.compactContent}>
                    <Ionicons name="warning" size={24} color="#FFFFFF" />
                    <Text style={[styles.compactTitle, { color: '#FFFFFF', marginLeft: 12 }]}>
                        Erro no áudio
                    </Text>
                    <TouchableOpacity onPress={stop} style={{ marginLeft: 'auto' }}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // 🔧 CORREÇÃO: Melhorar controle de posição
    const handleSeek = (value: number) => {
        if (duration > 0) {
            const newPosition = value * duration;
            console.log(`🎯 Seeking to: ${newPosition}ms (${(value * 100).toFixed(1)}%)`);
            seekTo(newPosition);
        }
    };

    const handleSlidingStart = () => {
        console.log('🎯 Slider dragging started');
        setIsDragging(true);
    };

    const handleSlidingComplete = (value: number) => {
        console.log('🎯 Slider dragging completed:', value);
        setIsDragging(false);
        handleSeek(value);
    };

    const handleValueChange = (value: number) => {
        if (isDragging) {
            setTempPosition(value * duration);
        }
    };

    // 🔧 CORREÇÃO: Toggle expandido mais confiável
    const toggleExpanded = () => {
        console.log(`📱 Toggling expanded: ${!isExpanded}`);
        setIsExpanded(!isExpanded);
    };

    // 🔧 CORREÇÃO: Controles de velocidade melhorados
    const handleSpeedChange = (speed: number) => {
        console.log(`⚡ Changing speed to: ${speed}x`);
        setPlaybackSpeed(speed);
        setShowSpeedMenu(false);
    };

    // 🔧 CORREÇÃO: Ações sociais
    const handleLike = () => {
        setIsLiked(!isLiked);
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
        console.log(`❤️ Episode ${isLiked ? 'unliked' : 'liked'}`);
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        console.log(`📚 Episode ${isSaved ? 'unsaved' : 'saved'}`);
    };

    const handleShare = async () => {
        try {
            console.log('📤 Sharing episode...');
            await Share.share({
                message: `Ouça "${currentEpisode.title}" ${podcastInfo ? `do podcast "${podcastInfo.title}" ` : ''}no PodcastApp!`,
                title: currentEpisode.title,
            });
        } catch (error) {
            console.error('❌ Erro ao compartilhar:', error);
        }
    };

    // 🔧 CORREÇÃO: Valores de exibição melhorados
    const displayPosition = isDragging ? tempPosition : position;
    const displayProgress = isDragging ? tempPosition / duration : progress;
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

    // 🔧 CORREÇÃO: Formatação de tempo local
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // 🔧 CORREÇÃO: RENDER PLAYER COMPACTO MELHORADO
    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <TouchableOpacity
                    style={styles.compactContent}
                    onPress={toggleExpanded}
                    activeOpacity={0.9}
                    disabled={isLoading}
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
                            disabled={isLoading}
                        >
                            <Ionicons
                                name={isLoading ? "hourglass" : (isPlaying ? "pause" : "play")}
                                size={18}
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

                {/* BARRA DE PROGRESSO */}
                <View style={styles.progressBarCompact}>
                    <Animated.View
                        style={[
                            styles.progressFillCompact,
                            { width: `${Math.max(0, Math.min(100, displayProgress * 100))}%` }
                        ]}
                    />
                </View>
            </View>
        );
    }

    // 🔧 CORREÇÃO: RENDER PLAYER EXPANDIDO MELHORADO
    return (
        <Modal
            visible={isExpanded}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => setIsExpanded(false)}
            supportedOrientations={['portrait']}
        >
            <SafeAreaView style={styles.safeArea}>
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

                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>REPRODUZINDO AGORA</Text>
                        </View>

                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.expandedContent}>
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
                                    {formatTime(displayPosition)}
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
                    </View>

                    {/* LOADING OVERLAY */}
                    {isLoading && (
                        <View style={styles.overlay}>
                            <View style={styles.menuContainer}>
                                <View style={styles.loadingIndicator}>
                                    <Ionicons name="hourglass" size={48} color={colors.primary} />
                                    <Text style={styles.loadingText}>Carregando áudio...</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* MENU DE VELOCIDADE */}
                    {showSpeedMenu && (
                        <View style={styles.overlay}>
                            <View style={styles.menuContainer}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowSpeedMenu(false)}
                                >
                                    <Ionicons name="close" size={20} color={colors.text} />
                                </TouchableOpacity>

                                <Text style={styles.menuTitle}>Velocidade de Reprodução</Text>

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
                        </View>
                    )}

                    {/* CONTROLE DE VOLUME */}
                    {showVolumeSlider && (
                        <View style={styles.overlay}>
                            <View style={styles.menuContainer}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowVolumeSlider(false)}
                                >
                                    <Ionicons name="close" size={20} color={colors.text} />
                                </TouchableOpacity>

                                <Text style={styles.menuTitle}>Volume</Text>

                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="volume-medium" size={32} color={colors.primary} />
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
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};