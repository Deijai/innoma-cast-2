import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            padding: compact ? 12 : 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
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
        },
        playButton: {
            backgroundColor: colors.primary,
            borderRadius: compact ? 24 : 32,
            padding: compact ? 12 : 16,
            marginHorizontal: compact ? 12 : 16,
        },
        speedButton: {
            backgroundColor: colors.surface,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            minWidth: 40,
            alignItems: 'center',
        },
        speedText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
        },
    });

    const PlayPauseIcon = isPlaying ? 'pause' : 'play';

    return (
        <View style={styles.container}>
            {!compact && (
                <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                        {currentEpisode.title}
                    </Text>
                    <Text style={styles.podcastTitle} numberOfLines={1}>
                        Podcast Name
                    </Text>
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
                />
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formattedPosition}</Text>
                    <Text style={styles.timeText}>{formattedDuration}</Text>
                </View>
            </View>

            <View style={styles.controlsContainer}>
                {!compact && (
                    <TouchableOpacity style={styles.speedButton} onPress={toggleSpeed}>
                        <Text style={styles.speedText}>{playbackSpeed}×</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.controlButton} onPress={() => skipBackward(15)}>
                    <Ionicons name="play-back" size={compact ? 20 : 24} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                    <Ionicons name={PlayPauseIcon} size={compact ? 20 : 24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={() => skipForward(30)}>
                    <Ionicons name="play-forward" size={compact ? 20 : 24} color={colors.text} />
                </TouchableOpacity>

                {!compact && (
                    <TouchableOpacity style={styles.controlButton}>
                        <Ionicons name="heart-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};