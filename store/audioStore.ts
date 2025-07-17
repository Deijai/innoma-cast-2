// store/audioStore.ts - STORE DE ÁUDIO CORRIGIDO
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { create } from 'zustand';
import { Episode, PlaybackState } from '../types';

interface EnhancedAudioState extends PlaybackState {
    sound: Audio.Sound | null;
    recording: Audio.Recording | null;
    isRecording: boolean;
    recordingDuration: number;
    recordingUri: string | null;

    // Estados aprimorados
    isBuffering: boolean;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
    shouldLoop: boolean;
    progressUpdateInterval: NodeJS.Timeout | null;

    // Configurações de qualidade
    audioQuality: 'low' | 'medium' | 'high';
    shouldDuckAudio: boolean;

    // Estados de erro
    errorMessage: string | null;
    lastError: Error | null;

    // Player Actions Aprimoradas
    loadEpisode: (episode: Episode) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    setPlaybackSpeed: (speed: number) => Promise<void>;
    skipForward: (seconds?: number) => Promise<void>;
    skipBackward: (seconds?: number) => Promise<void>;

    // Controles de volume
    setVolume: (volume: number) => Promise<void>;
    toggleMute: () => Promise<void>;

    // Configurações avançadas
    setAudioQuality: (quality: 'low' | 'medium' | 'high') => void;
    setLooping: (shouldLoop: boolean) => Promise<void>;

    // Gestão de sessão
    handleAudioInterruption: (status: AVPlaybackStatus) => void;
    setupAudioSession: () => Promise<void>;

    // Recording Actions (mantidas)
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<string | null>;
    pauseRecording: () => Promise<void>;
    resumeRecording: () => Promise<void>;

    // Utility aprimoradas
    cleanup: () => Promise<void>;
    updatePosition: () => void;
    clearError: () => void;
    resetPlayer: () => void;
}

export const useAudioStore = create<EnhancedAudioState>((set, get) => ({
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

    // Estados aprimorados
    isBuffering: false,
    volume: 1.0,
    isMuted: false,
    playbackRate: 1.0,
    shouldLoop: false,
    progressUpdateInterval: null,

    // Configurações
    audioQuality: 'high',
    shouldDuckAudio: true,

    // Estados de erro
    errorMessage: null,
    lastError: null,

    // CONFIGURAÇÃO INICIAL DE ÁUDIO
    setupAudioSession: async () => {
        try {
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                allowsRecordingIOS: false,
                interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            });
            console.log('✅ Sessão de áudio configurada');
        } catch (error) {
            console.error('❌ Erro ao configurar sessão de áudio:', error);
            set({ lastError: error as Error, errorMessage: 'Erro na configuração de áudio' });
        }
    },

    // CARREGAR EPISÓDIO APRIMORADO
    loadEpisode: async (episode: Episode) => {
        try {
            set({ isLoading: true, errorMessage: null });

            // Cleanup previous sound
            const { sound: currentSound, progressUpdateInterval } = get();
            if (currentSound) {
                await currentSound.unloadAsync();
            }
            if (progressUpdateInterval) {
                clearInterval(progressUpdateInterval);
            }

            // Configurar sessão de áudio
            await get().setupAudioSession();

            console.log('🎵 Carregando episódio:', episode.title);
            console.log('🔗 URL do áudio:', episode.audioUrl);

            // Criar e carregar novo som
            const { sound } = await Audio.Sound.createAsync(
                { uri: episode.audioUrl },
                {
                    shouldPlay: false,
                    isLooping: get().shouldLoop,
                    rate: get().playbackSpeed,
                    shouldCorrectPitch: true,
                    volume: get().volume,
                    isMuted: get().isMuted,
                },
                // Callback de status atualizado
                (status) => get().handleAudioInterruption(status)
            );

            // Configurar intervalo de atualização de progresso
            const interval = setInterval(() => {
                get().updatePosition();
            }, 500); // Atualiza a cada 500ms para suavidade

            set({
                sound,
                currentEpisode: episode,
                position: 0,
                isLoading: false,
                progressUpdateInterval: interval,
                errorMessage: null
            });

            console.log('✅ Episódio carregado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao carregar episódio:', error);
            set({
                isLoading: false,
                lastError: error as Error,
                errorMessage: 'Não foi possível carregar o episódio'
            });
            throw error;
        }
    },

    // CONTROLES DE REPRODUÇÃO APRIMORADOS
    play: async () => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.playAsync();
                set({ isPlaying: true, errorMessage: null });
                console.log('▶️ Reprodução iniciada');
            }
        } catch (error) {
            console.error('❌ Erro ao reproduzir:', error);
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao reproduzir áudio'
            });
        }
    },

    pause: async () => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.pauseAsync();
                set({ isPlaying: false });
                console.log('⏸️ Reprodução pausada');
            }
        } catch (error) {
            console.error('❌ Erro ao pausar:', error);
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao pausar áudio'
            });
        }
    },

    stop: async () => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.stopAsync();
                await sound.setPositionAsync(0);
                set({ position: 0, isPlaying: false });
                console.log('⏹️ Reprodução parada');
            }
        } catch (error) {
            console.error('❌ Erro ao parar:', error);
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao parar áudio'
            });
        }
    },

    seekTo: async (position: number) => {
        try {
            const { sound, duration } = get();
            if (sound && duration > 0) {
                // Garantir que a posição está dentro dos limites
                const clampedPosition = Math.max(0, Math.min(position, duration));
                await sound.setPositionAsync(clampedPosition);
                set({ position: clampedPosition });
                console.log(`⏭️ Posição alterada para: ${clampedPosition}ms`);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar posição:', error);
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao alterar posição'
            });
        }
    },

    setPlaybackSpeed: async (speed: number) => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.setRateAsync(speed, true);
                set({ playbackSpeed: speed, playbackRate: speed });
                console.log(`🎛️ Velocidade alterada para: ${speed}x`);
            }
        } catch (error) {
            console.error('❌ Erro ao alterar velocidade:', error);
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao alterar velocidade'
            });
        }
    },

    skipForward: async (seconds = 30) => {
        try {
            const { position, duration } = get();
            const newPosition = Math.min(position + (seconds * 1000), duration);
            await get().seekTo(newPosition);
            console.log(`⏭️ Avançou ${seconds}s`);
        } catch (error) {
            console.error('❌ Erro ao avançar:', error);
        }
    },

    skipBackward: async (seconds = 15) => {
        try {
            const { position } = get();
            const newPosition = Math.max(position - (seconds * 1000), 0);
            await get().seekTo(newPosition);
            console.log(`⏮️ Retrocedeu ${seconds}s`);
        } catch (error) {
            console.error('❌ Erro ao retroceder:', error);
        }
    },

    // CONTROLES DE VOLUME
    setVolume: async (volume: number) => {
        try {
            const { sound } = get();
            const clampedVolume = Math.max(0, Math.min(volume, 1));

            if (sound) {
                await sound.setVolumeAsync(clampedVolume);
            }

            set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
            console.log(`🔊 Volume alterado para: ${Math.round(clampedVolume * 100)}%`);
        } catch (error) {
            console.error('❌ Erro ao alterar volume:', error);
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao alterar volume'
            });
        }
    },

    toggleMute: async () => {
        try {
            const { sound, isMuted, volume } = get();

            if (sound) {
                if (isMuted) {
                    // Desmutear - restaurar volume anterior
                    await sound.setVolumeAsync(volume);
                    set({ isMuted: false });
                    console.log('🔊 Som desmutado');
                } else {
                    // Mutear - volume zero
                    await sound.setVolumeAsync(0);
                    set({ isMuted: true });
                    console.log('🔇 Som mutado');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao alterar mudo:', error);
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao alterar som'
            });
        }
    },

    // CONFIGURAÇÕES AVANÇADAS
    setAudioQuality: (quality: 'low' | 'medium' | 'high') => {
        set({ audioQuality: quality });
        console.log(`🎛️ Qualidade de áudio alterada para: ${quality}`);
    },

    setLooping: async (shouldLoop: boolean) => {
        try {
            const { sound } = get();
            if (sound) {
                await sound.setIsLoopingAsync(shouldLoop);
            }
            set({ shouldLoop });
            console.log(`🔁 Loop ${shouldLoop ? 'ativado' : 'desativado'}`);
        } catch (error) {
            console.error('❌ Erro ao alterar loop:', error);
        }
    },

    // ✅ GESTÃO DE INTERRUPÇÕES - CORRIGIDA
    handleAudioInterruption: (status: AVPlaybackStatus) => {
        // Verificar se o status está carregado e tem as propriedades necessárias
        if (status.isLoaded) {
            const loadedStatus = status as AVPlaybackStatusSuccess;
            const currentState = get();

            // Atualizar estado baseado no status
            const updates: Partial<EnhancedAudioState> = {
                position: loadedStatus.positionMillis || 0,
                duration: loadedStatus.durationMillis || 0,
                isPlaying: loadedStatus.isPlaying || false,
                isBuffering: loadedStatus.isBuffering || false,
                playbackRate: loadedStatus.rate || 1.0,
            };

            // Detectar fim da reprodução
            if (loadedStatus.didJustFinish && !currentState.shouldLoop) {
                updates.isPlaying = false;
                updates.position = 0;
                console.log('🏁 Reprodução finalizada');
            }

            set(updates);
        } else {
            // Status não carregado - possível erro
            const errorStatus = status as { error?: string };
            if (errorStatus.error) {
                set({
                    errorMessage: 'Erro ao carregar áudio',
                    lastError: new Error(errorStatus.error),
                    isLoading: false,
                    isPlaying: false
                });
                console.error('❌ Erro ao carregar:', errorStatus.error);
            }
        }
    },

    // RECORDING ACTIONS (mantidas do código original)
    startRecording: async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to record audio denied');
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await recording.startAsync();

            set({
                recording,
                isRecording: true,
                recordingDuration: 0,
                recordingUri: null
            });

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
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao iniciar gravação'
            });
            throw error;
        }
    },

    stopRecording: async (): Promise<string | null> => {
        try {
            const { recording } = get();
            if (!recording) return null;

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

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
            set({
                lastError: error as Error,
                errorMessage: 'Erro ao parar gravação'
            });
            throw error;
        }
    },

    pauseRecording: async () => {
        try {
            const { recording } = get();
            if (recording && recording.pauseAsync) {
                await recording.pauseAsync();
            }
        } catch (error) {
            console.error('Error pausing recording:', error);
        }
    },

    resumeRecording: async () => {
        try {
            const { recording } = get();
            if (recording) {
                await recording.startAsync();
            }
        } catch (error) {
            console.error('Error resuming recording:', error);
        }
    },

    // UTILITIES APRIMORADAS
    cleanup: async () => {
        try {
            const { sound, recording, progressUpdateInterval } = get();

            if (progressUpdateInterval) {
                clearInterval(progressUpdateInterval);
            }

            if (sound) {
                await sound.unloadAsync();
            }

            if (recording) {
                try {
                    await recording.stopAndUnloadAsync();
                } catch (error) {
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
                currentEpisode: undefined,
                progressUpdateInterval: null,
                isBuffering: false,
                errorMessage: null,
                lastError: null
            });

            console.log('🧹 Cleanup completo do áudio');
        } catch (error) {
            console.error('❌ Erro no cleanup:', error);
        }
    },

    // ✅ UPDATE POSITION - CORRIGIDO
    updatePosition: () => {
        const { sound } = get();
        if (sound) {
            sound.getStatusAsync().then((status) => {
                if (status.isLoaded) {
                    const loadedStatus = status as AVPlaybackStatusSuccess;
                    set({
                        position: loadedStatus.positionMillis || 0,
                        duration: loadedStatus.durationMillis || 0,
                        isPlaying: loadedStatus.isPlaying || false,
                        isBuffering: loadedStatus.isBuffering || false,
                    });
                }
            }).catch(error => {
                console.log('Error getting audio status:', error);
            });
        }
    },

    clearError: () => {
        set({ errorMessage: null, lastError: null });
    },

    resetPlayer: () => {
        const { cleanup } = get();
        cleanup();
        set({
            playbackSpeed: 1.0,
            volume: 1.0,
            isMuted: false,
            shouldLoop: false,
            audioQuality: 'high'
        });
        console.log('🔄 Player resetado');
    }
}));