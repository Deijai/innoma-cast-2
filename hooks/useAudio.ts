import { useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';
import { Episode } from '../types';
import { formatTime } from '../utils/format';

export const useAudio = () => {
    const audioStore = useAudioStore();

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            audioStore.cleanup();
        };
    }, []);

    const getProgress = (): number => {
        if (audioStore.duration === 0) return 0;
        return audioStore.position / audioStore.duration;
    };

    return {
        // State
        isPlaying: audioStore.isPlaying,
        position: audioStore.position,
        duration: audioStore.duration,
        currentEpisode: audioStore.currentEpisode,
        playbackSpeed: audioStore.playbackSpeed,
        isLoading: audioStore.isLoading,

        // Recording state
        isRecording: audioStore.isRecording,
        recordingDuration: audioStore.recordingDuration,

        // Player actions
        loadEpisode: audioStore.loadEpisode,
        play: audioStore.play,
        pause: audioStore.pause,
        stop: audioStore.stop,
        seekTo: audioStore.seekTo,
        setPlaybackSpeed: audioStore.setPlaybackSpeed,
        skipForward: audioStore.skipForward,
        skipBackward: audioStore.skipBackward,

        // Recording actions
        startRecording: audioStore.startRecording,
        stopRecording: audioStore.stopRecording,
        pauseRecording: audioStore.pauseRecording,
        resumeRecording: audioStore.resumeRecording,

        // Computed values
        formattedPosition: formatTime(audioStore.position),
        formattedDuration: formatTime(audioStore.duration),
        formattedRecordingDuration: formatTime(audioStore.recordingDuration),
        progress: getProgress(),

        // Utility
        cleanup: audioStore.cleanup,
        togglePlayPause: () => {
            if (audioStore.isPlaying) {
                audioStore.pause();
            } else {
                audioStore.play();
            }
        }
    };
};

export const usePlayer = () => {
    const audio = useAudio();

    const playEpisode = async (episode: Episode) => {
        try {
            await audio.loadEpisode(episode);
            await audio.play();
        } catch (error) {
            console.error('Error playing episode:', error);
        }
    };

    return {
        ...audio,
        playEpisode
    };
};

export const useRecorder = () => {
    const audio = useAudio();

    return {
        isRecording: audio.isRecording,
        recordingDuration: audio.recordingDuration,
        formattedRecordingDuration: audio.formattedRecordingDuration,
        startRecording: audio.startRecording,
        stopRecording: audio.stopRecording,
        pauseRecording: audio.pauseRecording,
        resumeRecording: audio.resumeRecording,
    };
};