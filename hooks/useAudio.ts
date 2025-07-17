// hooks/useAudio.ts - VERSÃO CORRIGIDA E MELHORADA
import { useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';
import { Episode } from '../types';
import { formatTime } from '../utils/format';

export const useAudio = () => {
    const audioStore = useAudioStore();

    // 🔧 CORREÇÃO: Inicialização mais segura
    useEffect(() => {
        let mounted = true;

        const initializeAudio = async () => {
            try {
                console.log('🎵 Inicializando sistema de áudio...');
                await audioStore.setupAudioSession();

                if (mounted) {
                    console.log('✅ Sistema de áudio inicializado');
                }
            } catch (error) {
                console.error('❌ Erro na inicialização do áudio:', error);
            }
        };

        initializeAudio();

        // Cleanup na desmontagem
        return () => {
            mounted = false;
            console.log('🧹 Limpando hook useAudio...');
            audioStore.cleanup();
        };
    }, []);

    // 🔧 CORREÇÃO: Funções auxiliares melhoradas
    const getProgress = (): number => {
        if (audioStore.duration === 0) return 0;
        const progress = audioStore.position / audioStore.duration;
        return Math.max(0, Math.min(1, progress)); // Garantir entre 0 e 1
    };

    const getProgressPercent = (): string => {
        return `${Math.round(getProgress() * 100)}%`;
    };

    const getRemainingTime = (): string => {
        const remaining = Math.max(0, audioStore.duration - audioStore.position);
        return formatTime(remaining);
    };

    // 🔧 CORREÇÃO: Verificações de estado mais robustas
    const canPlay = (): boolean => {
        return !!(
            audioStore.currentEpisode &&
            audioStore.sound &&
            !audioStore.isLoading &&
            !audioStore.errorMessage
        );
    };

    const hasError = (): boolean => {
        return !!(audioStore.errorMessage || audioStore.lastError);
    };

    const isActive = (): boolean => {
        return !!(audioStore.currentEpisode && audioStore.sound);
    };

    // 🔧 CORREÇÃO: Toggle play/pause mais seguro
    const togglePlayPause = async () => {
        try {
            if (!canPlay()) {
                console.warn('⚠️ Não é possível reproduzir agora');
                return;
            }

            if (audioStore.isPlaying) {
                console.log('⏸️ Pausando via toggle...');
                await audioStore.pause();
            } else {
                console.log('▶️ Reproduzindo via toggle...');
                await audioStore.play();
            }
        } catch (error) {
            console.error('❌ Erro no toggle play/pause:', error);
        }
    };

    return {
        // Estado básico
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
        recordingUri: audioStore.recordingUri,

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

        // Computed values - CORRIGIDOS
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
        togglePlayPause,

        // Verificações de estado - CORRIGIDAS
        canPlay,
        hasError,
        isActive,
    };
};

// 🔧 CORREÇÃO: Hook especializado para player melhorado
export const usePlayer = () => {
    const audio = useAudio();

    // 🔧 CORREÇÃO: Função playEpisode mais robusta
    const playEpisode = async (episode: Episode) => {
        try {
            console.log(`🎵 Iniciando reprodução do episódio: "${episode.title}"`);

            // Validações
            if (!episode) {
                throw new Error('Episódio não fornecido');
            }

            if (!episode.audioUrl) {
                throw new Error('Este episódio não possui áudio disponível');
            }

            if (!episode.audioUrl.trim()) {
                throw new Error('URL do áudio está vazia');
            }

            // Verificar se é o mesmo episódio
            if (audio.currentEpisode?.id === episode.id) {
                console.log('🔄 Mesmo episódio, apenas alternando play/pause...');
                await audio.togglePlayPause();
                return;
            }

            // Carregar novo episódio
            console.log('📥 Carregando novo episódio...');
            await audio.loadEpisode(episode);

            // Aguardar um pouco para o carregamento
            await new Promise(resolve => setTimeout(resolve, 500));

            // Iniciar reprodução se carregou com sucesso
            if (audio.canPlay()) {
                console.log('▶️ Iniciando reprodução automática...');
                await audio.play();
            } else {
                console.warn('⚠️ Episódio carregado mas não pode reproduzir ainda');
            }

            console.log('✅ Reprodução do episódio iniciada com sucesso');

        } catch (error) {
            console.error(`❌ Erro ao reproduzir episódio "${episode.title}":`, error);
            throw error;
        }
    };

    // 🔧 CORREÇÃO: Funções de navegação (placeholder para futuro)
    const playNext = async () => {
        console.log('⏭️ Próximo episódio (não implementado)');
        // TODO: Implementar lógica de próximo episódio
    };

    const playPrevious = async () => {
        console.log('⏮️ Episódio anterior (não implementado)');
        // TODO: Implementar lógica de episódio anterior
    };

    // 🔧 CORREÇÃO: Controles de velocidade predefinidos melhorados
    const increaseSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(audio.playbackSpeed);
        const nextIndex = currentIndex < speeds.length - 1 ? currentIndex + 1 : 0;
        const newSpeed = speeds[nextIndex];

        console.log(`⚡ Aumentando velocidade: ${audio.playbackSpeed}x → ${newSpeed}x`);
        audio.setPlaybackSpeed(newSpeed);
    };

    const decreaseSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(audio.playbackSpeed);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : speeds.length - 1;
        const newSpeed = speeds[prevIndex];

        console.log(`⚡ Diminuindo velocidade: ${audio.playbackSpeed}x → ${newSpeed}x`);
        audio.setPlaybackSpeed(newSpeed);
    };

    const resetSpeed = () => {
        console.log('⚡ Resetando velocidade para 1.0x');
        audio.setPlaybackSpeed(1.0);
    };

    // 🔧 CORREÇÃO: Controles de volume melhorados
    const increaseVolume = () => {
        const newVolume = Math.min(audio.volume + 0.1, 1.0);
        console.log(`🔊 Aumentando volume: ${Math.round(audio.volume * 100)}% → ${Math.round(newVolume * 100)}%`);
        audio.setVolume(newVolume);
    };

    const decreaseVolume = () => {
        const newVolume = Math.max(audio.volume - 0.1, 0);
        console.log(`🔉 Diminuindo volume: ${Math.round(audio.volume * 100)}% → ${Math.round(newVolume * 100)}%`);
        audio.setVolume(newVolume);
    };

    const setVolumePercent = (percent: number) => {
        const volume = Math.max(0, Math.min(percent / 100, 1));
        console.log(`🔊 Definindo volume para: ${percent}%`);
        audio.setVolume(volume);
    };

    // 🔧 CORREÇÃO: Funções de bookmarks (placeholder)
    const createBookmark = () => {
        const currentTime = audio.position;
        console.log(`📖 Bookmark criado em: ${audio.formattedPosition}`);

        // TODO: Implementar salvamento de bookmark
        return {
            position: currentTime,
            timestamp: new Date(),
            episodeId: audio.currentEpisode?.id,
            title: `Bookmark em ${audio.formattedPosition}`
        };
    };

    const jumpToBookmark = (position: number) => {
        console.log(`📖 Pulando para bookmark: ${formatTime(position)}`);
        audio.seekTo(position);
    };

    // 🔧 CORREÇÃO: Informações de progresso melhoradas
    const getProgressInfo = () => ({
        current: audio.formattedPosition,
        total: audio.formattedDuration,
        remaining: audio.formattedRemainingTime,
        percent: audio.progressPercent,
        progress: audio.progress
    });

    // 🔧 CORREÇÃO: Status do player melhorado
    const getPlayerStatus = () => ({
        isPlaying: audio.isPlaying,
        isLoading: audio.isLoading,
        isBuffering: audio.isBuffering,
        hasError: audio.hasError(),
        canPlay: audio.canPlay(),
        isActive: audio.isActive(),
        currentEpisode: audio.currentEpisode
    });

    // 🔧 CORREÇÃO: Configurações do player
    const getPlayerSettings = () => ({
        volume: audio.volume,
        playbackSpeed: audio.playbackSpeed,
        audioQuality: audio.audioQuality,
        shouldLoop: audio.shouldLoop,
        isMuted: audio.isMuted
    });

    return {
        ...audio,

        // Funções estendidas
        playEpisode,
        playNext,
        playPrevious,

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

        // Verificações úteis (placeholder para futuro)
        isFirstEpisode: () => false,
        isLastEpisode: () => false,
        hasNext: () => false,
        hasPrevious: () => false,

        // Informações estruturadas
        getProgressInfo,
        getPlayerStatus,
        getPlayerSettings,
    };
};

// 🔧 CORREÇÃO: Hook especializado para gravação melhorado
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
        status: getRecordingStatus(),
        uri: audio.recordingUri
    });

    const canRecord = () => {
        return !audio.isRecording && !audio.isPlaying && !audio.isLoading;
    };

    const isRecordingReady = () => {
        return !audio.isRecording && audio.recordingDuration > 0 && !!audio.recordingUri;
    };

    return {
        // Estado básico
        isRecording: audio.isRecording,
        recordingDuration: audio.recordingDuration,
        formattedRecordingDuration: audio.formattedRecordingDuration,
        recordingUri: audio.recordingUri,

        // Actions
        startRecording: audio.startRecording,
        stopRecording: audio.stopRecording,
        pauseRecording: audio.pauseRecording,
        resumeRecording: audio.resumeRecording,

        // Informações
        getRecordingStatus,
        getRecordingInfo,

        // Verificações
        canRecord,
        isRecordingReady,
    };
};