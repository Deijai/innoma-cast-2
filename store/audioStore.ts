import { AudioPlayer, AudioQuality, AudioRecorder, RecordingOptions, useAudioPlayer, useAudioRecorder } from 'expo-audio';
import { create } from 'zustand';
import { Episode, PlaybackState } from '../types';

interface AudioState extends PlaybackState {
    player: AudioPlayer | null;
    recorder: AudioRecorder | null;
    isRecording: boolean;
    recordingDuration: number;

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
    startRecording: () => Promise<string>;
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
    player: null,

    // Recording State
    recorder: null,
    isRecording: false,
    recordingDuration: 0,

    loadEpisode: async (episode: Episode) => {
        try {
            set({ isLoading: true });

            // Cleanup previous player
            const { player: currentPlayer } = get();
            if (currentPlayer) {
                currentPlayer.remove();
            }

            // Create new player with just the source URL
            const player = useAudioPlayer(episode.audioUrl);

            set({
                player,
                currentEpisode: episode,
                duration: 0, // Will be updated when loaded
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
            const { player } = get();
            if (player) {
                player.play();
                set({ isPlaying: true });
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    },

    pause: async () => {
        try {
            const { player } = get();
            if (player) {
                player.pause();
                set({ isPlaying: false });
            }
        } catch (error) {
            console.error('Error pausing audio:', error);
        }
    },

    stop: async () => {
        try {
            const { player } = get();
            if (player) {
                player.pause();
                // Reset position through seekTo if available
                if ('seekTo' in player) {
                    (player as any).seekTo(0);
                }
                set({ position: 0, isPlaying: false });
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    },

    seekTo: async (position: number) => {
        try {
            const { player } = get();
            if (player && 'seekTo' in player) {
                (player as any).seekTo(position / 1000); // Convert to seconds
                set({ position });
            }
        } catch (error) {
            console.error('Error seeking audio:', error);
        }
    },

    setPlaybackSpeed: async (speed: number) => {
        try {
            const { player } = get();
            if (player && 'setRate' in player) {
                (player as any).setRate(speed);
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

    startRecording: async (): Promise<string> => {
        try {
            // Recording options with correct types
            const options: RecordingOptions = {
                android: {
                    extension: '.m4a',
                    outputFormat: 'mpeg4',
                    audioEncoder: 'aac',
                    sampleRate: 44100,
                },
                ios: {
                    extension: '.m4a',
                    audioQuality: AudioQuality.HIGH,
                    sampleRate: 44100,
                    //bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,

                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
                extension: '',
                sampleRate: 0,
                numberOfChannels: 0,
                bitRate: 0
            };

            // Create recorder with options
            const recorder = useAudioRecorder(options);

            // Start recording
            await recorder.record();

            set({ recorder, isRecording: true, recordingDuration: 0 });

            // Update recording duration
            const interval = setInterval(() => {
                const { isRecording } = get();
                if (!isRecording) {
                    clearInterval(interval);
                    return;
                }
                set(state => ({ recordingDuration: state.recordingDuration + 1000 }));
            }, 1000);

            return 'Recording started';
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    },

    stopRecording: async (): Promise<string | null> => {
        try {
            const { recorder } = get();
            if (!recorder) return null;

            const uri = await recorder.stop();

            set({
                recorder: null,
                isRecording: false,
                recordingDuration: 0
            });

            return uri ?? null;
        } catch (error) {
            console.error('Error stopping recording:', error);
            throw error;
        }
    },

    pauseRecording: async () => {
        try {
            const { recorder } = get();
            if (recorder && 'pause' in recorder) {
                await (recorder as any).pause();
            }
        } catch (error) {
            console.error('Error pausing recording:', error);
        }
    },

    resumeRecording: async () => {
        try {
            const { recorder } = get();
            if (recorder) {
                await recorder.record();
            }
        } catch (error) {
            console.error('Error resuming recording:', error);
        }
    },

    cleanup: async () => {
        try {
            const { player, recorder } = get();

            if (player) {
                player.remove();
            }

            if (recorder) {
                try {
                    await recorder.stop();
                } catch (error) {
                    // Recorder might already be stopped
                }
            }

            set({
                player: null,
                recorder: null,
                isPlaying: false,
                isRecording: false,
                position: 0,
                duration: 0,
                recordingDuration: 0,
                currentEpisode: undefined
            });
        } catch (error) {
            console.error('Error cleaning up audio:', error);
        }
    },

    updatePosition: () => {
        // This method can be called to force position update
        const { player } = get();
        if (player && 'currentTime' in player) {
            const currentTime = (player as any).currentTime || 0;
            set({ position: currentTime * 1000 }); // Convert to milliseconds
        }
    }
}));