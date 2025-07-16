import { Audio } from 'expo-av';
import { create } from 'zustand';
import { Episode, PlaybackState } from '../types';

interface AudioState extends PlaybackState {
    sound: Audio.Sound | null;
    recording: Audio.Recording | null;
    isRecording: boolean;
    recordingDuration: number;
    recordingUri: string | null;

    // Player Actions
    loadEpisode: (episode: Episode) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    setPlaybackSpeed: (speed: number) => Promise<void>;
    skipForward: (seconds?: number) => Promise<void>;
    skipBackward: (seconds?: number) => Promise<void>;

    // Recording Actions
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<string | null>;
    pauseRecording: () => Promise<void>;
    resumeRecording: () => Promise<void>;

    // Utility
    cleanup: () => Promise<void>;
    updatePosition: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    // Player State
    isPlaying: false,
    position: 0,
    duration: 0,
    currentEpisode: undefined,
    playbackSpeed: 1.0,
    isLoading: false,
    sound: null,

    // Recording State
    recording: null,
    isRecording: false,
    recordingDuration: 0,
    recordingUri: null,

    loadEpisode: async (episode: Episode) => {
        try {
            set({ isLoading: true });

            // Cleanup previous sound
            const { sound: currentSound } = get();
            if (currentSound) {
                await currentSound.unloadAsync();
            }

            // Set audio mode for playback
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                allowsRecordingIOS: false,
            });

            // Create and load new sound
            const { sound } = await Audio.Sound.createAsync(
                { uri: episode.audioUrl },
                {
                    shouldPlay: false,
                    isLooping: false,
                    rate: get().playbackSpeed,
                    shouldCorrectPitch: true,
                },
                (status) => {
                    if (status.isLoaded) {
                        set({
                            position: status.positionMillis || 0,
                            duration: status.durationMillis || 0,
                            isPlaying: status.isPlaying || false,
                        });
                    }
                }
            );

            set({
                sound,
                currentEpisode: episode,
                position: 0,
                isLoading: false
            });

        } catch (error) {
            console.error('Error loading episode:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    play: async () => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.playAsync();
                set({ isPlaying: true });
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    },

    pause: async () => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.pauseAsync();
                set({ isPlaying: false });
            }
        } catch (error) {
            console.error('Error pausing audio:', error);
        }
    },

    stop: async () => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.stopAsync();
                await sound.setPositionAsync(0);
                set({ position: 0, isPlaying: false });
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    },

    seekTo: async (position: number) => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.setPositionAsync(position);
                set({ position });
            }
        } catch (error) {
            console.error('Error seeking audio:', error);
        }
    },

    setPlaybackSpeed: async (speed: number) => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.setRateAsync(speed, true);
                set({ playbackSpeed: speed });
            }
        } catch (error) {
            console.error('Error setting playback speed:', error);
        }
    },

    skipForward: async (seconds = 30) => {
        try {
            const { position, duration } = get();
            const newPosition = Math.min(position + (seconds * 1000), duration);
            await get().seekTo(newPosition);
        } catch (error) {
            console.error('Error skipping forward:', error);
        }
    },

    skipBackward: async (seconds = 15) => {
        try {
            const { position } = get();
            const newPosition = Math.max(position - (seconds * 1000), 0);
            await get().seekTo(newPosition);
        } catch (error) {
            console.error('Error skipping backward:', error);
        }
    },

    startRecording: async () => {
        try {
            // Request permissions
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to record audio denied');
            }

            // Set audio mode for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Create new recording instance
            const recording = new Audio.Recording();

            // Prepare recording with HIGH_QUALITY preset
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

            // Start recording
            await recording.startAsync();

            set({
                recording,
                isRecording: true,
                recordingDuration: 0,
                recordingUri: null
            });

            // Update recording duration every second
            const interval = setInterval(() => {
                const { isRecording } = get();
                if (!isRecording) {
                    clearInterval(interval);
                    return;
                }
                set(state => ({ recordingDuration: state.recordingDuration + 1000 }));
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    },

    stopRecording: async (): Promise<string | null> => {
        try {
            const { recording } = get();
            if (!recording) return null;

            // Stop and unload recording
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            // Reset audio mode back to playback
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            set({
                recording: null,
                isRecording: false,
                recordingUri: uri,
            });

            return uri;
        } catch (error) {
            console.error('Error stopping recording:', error);
            throw error;
        }
    },

    pauseRecording: async () => {
        try {
            const { recording } = get();
            if (recording) {
                // Check if pauseAsync is available (Android API 24+)
                if (recording.pauseAsync) {
                    await recording.pauseAsync();
                } else {
                    console.warn('Pause recording not supported on this platform');
                }
            }
        } catch (error) {
            console.error('Error pausing recording:', error);
        }
    },

    resumeRecording: async () => {
        try {
            const { recording } = get();
            if (recording) {
                // Resume is done by calling startAsync again after pause
                await recording.startAsync();
            }
        } catch (error) {
            console.error('Error resuming recording:', error);
        }
    },

    cleanup: async () => {
        try {
            const { sound, recording } = get();

            if (sound) {
                await sound.unloadAsync();
            }

            if (recording) {
                try {
                    await recording.stopAndUnloadAsync();
                } catch (error) {
                    // Recording might already be stopped
                    console.log('Recording was already stopped');
                }
            }

            set({
                sound: null,
                recording: null,
                isPlaying: false,
                isRecording: false,
                position: 0,
                duration: 0,
                recordingDuration: 0,
                recordingUri: null,
                currentEpisode: undefined
            });
        } catch (error) {
            console.error('Error cleaning up audio:', error);
        }
    },

    updatePosition: () => {
        // Force position update by getting current status
        const { sound } = get();
        if (sound) {
            sound.getStatusAsync().then((status) => {
                if (status.isLoaded) {
                    set({
                        position: status.positionMillis || 0,
                        duration: status.durationMillis || 0,
                        isPlaying: status.isPlaying || false,
                    });
                }
            }).catch(error => {
                console.log('Error getting audio status:', error);
            });
        }
    }
}));