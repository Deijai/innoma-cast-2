// hooks/useAudio.ts - HOOKS ATUALIZADOS PARA PLAYER PROFISSIONAL
import { useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';
import { Episode } from '../types';
import { formatTime } from '../utils/format';

export const useAudio = () => {
    const audioStore = useAudioStore();

    useEffect(() => {
        // Configurar sessão de áudio na inicialização
        audioStore.setupAudioSession();

        // Cleanup on unmount
        return () => {
            audioStore.cleanup();
        };
    }, []);

    const getProgress = (): number => {
        if (audioStore.duration === 0) return 0;
        return audioStore.position / audioStore.duration;
    };

    const getProgressPercent = (): string => {
        return `${Math.round(getProgress() * 100)}%`;
    };

    const getRemainingTime = (): string => {
        const remaining = audioStore.duration - audioStore.position;
        return formatTime(remaining);
    };

    return {
        // State básico
        isPlaying: audioStore.isPlaying,
        position: audioStore.position,
        duration: audioStore.duration,
        currentEpisode: audioStore.currentEpisode,
        playbackSpeed: audioStore.playbackSpeed,
        isLoading: audioStore.isLoading,

        // Estados aprimorados
        isBuffering: audioStore.isBuffering,
        volume: audioStore.volume,
        isMuted: audioStore.isMuted,
        shouldLoop: audioStore.shouldLoop,
        audioQuality: audioStore.audioQuality,

        // Estados de erro
        errorMessage: audioStore.errorMessage,
        lastError: audioStore.lastError,

        // Recording state
        isRecording: audioStore.isRecording,
        recordingDuration: audioStore.recordingDuration,

        // Player actions básicas
        loadEpisode: audioStore.loadEpisode,
        play: audioStore.play,
        pause: audioStore.pause,
        stop: audioStore.stop,
        seekTo: audioStore.seekTo,
        setPlaybackSpeed: audioStore.setPlaybackSpeed,
        skipForward: audioStore.skipForward,
        skipBackward: audioStore.skipBackward,

        // Controles de volume
        setVolume: audioStore.setVolume,
        toggleMute: audioStore.toggleMute,

        // Configurações avançadas
        setAudioQuality: audioStore.setAudioQuality,
        setLooping: audioStore.setLooping,

        // Recording actions
        startRecording: audioStore.startRecording,
        stopRecording: audioStore.stopRecording,
        pauseRecording: audioStore.pauseRecording,
        resumeRecording: audioStore.resumeRecording,

        // Computed values
        formattedPosition: formatTime(audioStore.position),
        formattedDuration: formatTime(audioStore.duration),
        formattedRecordingDuration: formatTime(audioStore.recordingDuration),
        formattedRemainingTime: getRemainingTime(),
        progress: getProgress(),
        progressPercent: getProgressPercent(),

        // Utility aprimoradas
        cleanup: audioStore.cleanup,
        clearError: audioStore.clearError,
        resetPlayer: audioStore.resetPlayer,

        // Função de toggle play/pause
        togglePlayPause: () => {
            if (audioStore.isPlaying) {
                audioStore.pause();
            } else {
                audioStore.play();
            }
        },

        // Verificações de estado
        canPlay: () => audioStore.currentEpisode !== undefined && !audioStore.isLoading,
        hasError: () => audioStore.errorMessage !== null,
        isActive: () => audioStore.currentEpisode !== undefined,
    };
};

// Hook especializado para player com funcionalidades extras
export const usePlayer = () => {
    const audio = useAudio();

    const playEpisode = async (episode: Episode) => {
        try {
            console.log('🎵 Carregando episódio para reprodução...', episode.title);

            // Validar URL do áudio
            if (!episode.audioUrl) {
                throw new Error('Este episódio não possui áudio disponível');
            }

            // Carregar episódio no player
            await audio.loadEpisode(episode);

            // Iniciar reprodução automaticamente
            await audio.play();

            console.log('✅ Reprodução iniciada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao reproduzir episódio:', error);
            throw error;
        }
    };

    const playNext = async () => {
        // TODO: Implementar lógica de próximo episódio
        console.log('⏭️ Próximo episódio (não implementado)');
    };

    const playPrevious = async () => {
        // TODO: Implementar lógica de episódio anterior
        console.log('⏮️ Episódio anterior (não implementado)');
    };

    const addToQueue = (episode: Episode) => {
        // TODO: Implementar fila de reprodução
        console.log('➕ Adicionado à fila:', episode.title);
    };

    const removeFromQueue = (episodeId: string) => {
        // TODO: Implementar remoção da fila
        console.log('➖ Removido da fila:', episodeId);
    };

    const shuffle = () => {
        // TODO: Implementar shuffle
        console.log('🔀 Shuffle (não implementado)');
    };

    const repeat = () => {
        audio.setLooping(!audio.shouldLoop);
        console.log(`🔁 Repeat ${audio.shouldLoop ? 'desativado' : 'ativado'}`);
    };

    // Controles de velocidade predefinidos
    const increaseSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(audio.playbackSpeed);
        const nextIndex = currentIndex < speeds.length - 1 ? currentIndex + 1 : 0;
        audio.setPlaybackSpeed(speeds[nextIndex]);
    };

    const decreaseSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(audio.playbackSpeed);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : speeds.length - 1;
        audio.setPlaybackSpeed(speeds[prevIndex]);
    };

    const resetSpeed = () => {
        audio.setPlaybackSpeed(1.0);
    };

    // Controles de volume predefinidos
    const increaseVolume = () => {
        const newVolume = Math.min(audio.volume + 0.1, 1.0);
        audio.setVolume(newVolume);
    };

    const decreaseVolume = () => {
        const newVolume = Math.max(audio.volume - 0.1, 0);
        audio.setVolume(newVolume);
    };

    const setVolumePercent = (percent: number) => {
        const volume = Math.max(0, Math.min(percent / 100, 1));
        audio.setVolume(volume);
    };

    // Marcadores e bookmarks
    const createBookmark = () => {
        const currentTime = audio.position;
        console.log(`📖 Bookmark criado em: ${audio.formattedPosition}`);
        // TODO: Salvar bookmark no storage
        return {
            position: currentTime,
            timestamp: new Date(),
            episodeId: audio.currentEpisode?.id
        };
    };

    const jumpToBookmark = (position: number) => {
        audio.seekTo(position);
        console.log(`📖 Pulando para bookmark: ${formatTime(position)}`);
    };

    return {
        ...audio,

        // Funções estendidas
        playEpisode,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        shuffle,
        repeat,

        // Controles de velocidade
        increaseSpeed,
        decreaseSpeed,
        resetSpeed,

        // Controles de volume
        increaseVolume,
        decreaseVolume,
        setVolumePercent,

        // Bookmarks
        createBookmark,
        jumpToBookmark,

        // Verificações úteis
        isFirstEpisode: () => {
            // TODO: Implementar lógica de primeiro episódio
            return false;
        },

        isLastEpisode: () => {
            // TODO: Implementar lógica de último episódio
            return false;
        },

        hasNext: () => {
            // TODO: Implementar verificação de próximo
            return false;
        },

        hasPrevious: () => {
            // TODO: Implementar verificação de anterior
            return false;
        },

        // Informações de progresso
        getProgressInfo: () => ({
            current: audio.formattedPosition,
            total: audio.formattedDuration,
            remaining: audio.formattedRemainingTime,
            percent: audio.progressPercent,
            progress: audio.progress
        }),

        // Informações de estado
        getPlayerStatus: () => ({
            isPlaying: audio.isPlaying,
            isLoading: audio.isLoading,
            isBuffering: audio.isBuffering,
            hasError: audio.hasError(),
            canPlay: audio.canPlay(),
            isActive: audio.isActive(),
            currentEpisode: audio.currentEpisode
        }),

        // Configurações
        getPlayerSettings: () => ({
            volume: audio.volume,
            playbackSpeed: audio.playbackSpeed,
            audioQuality: audio.audioQuality,
            shouldLoop: audio.shouldLoop,
            isMuted: audio.isMuted
        })
    };
};

// Hook especializado para gravação
export const useRecorder = () => {
    const audio = useAudio();

    const getRecordingStatus = () => {
        if (!audio.isRecording) return 'Pronto para gravar';
        return 'Gravando...';
    };

    const getRecordingInfo = () => ({
        isRecording: audio.isRecording,
        duration: audio.recordingDuration,
        formattedDuration: audio.formattedRecordingDuration,
        status: getRecordingStatus()
    });

    return {
        isRecording: audio.isRecording,
        recordingDuration: audio.recordingDuration,
        formattedRecordingDuration: audio.formattedRecordingDuration,

        startRecording: audio.startRecording,
        stopRecording: audio.stopRecording,
        pauseRecording: audio.pauseRecording,
        resumeRecording: audio.resumeRecording,

        getRecordingStatus,
        getRecordingInfo,

        canRecord: () => !audio.isRecording && !audio.isPlaying,
        isRecordingReady: () => audio.recordingDuration > 0,
    };
};