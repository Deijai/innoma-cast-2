// types/index.ts - TIPOS ATUALIZADOS E CORRIGIDOS
export type UserRole = 'creator' | 'listener';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    preferences?: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPreferences {
    categories?: string[];
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    autoPlay: boolean;
    playbackSpeed: number;
}

export interface Podcast {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    category: string;
    creatorId: string;
    creator: User;
    episodes: Episode[];
    followers: number;
    isSubscribed?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Episode {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    duration: number;
    podcastId: string; // ✅ MANTIDO - referência ao podcast
    season?: number;
    episodeNumber: number;
    publishedAt: Date;
    isPublished: boolean;
    scheduledFor?: Date;
    likes: number;
    comments: Comment[];
    isLiked?: boolean;
    isSaved?: boolean;
    createdAt: Date;
}

// ✅ NOVO: Interface para episódio com dados do podcast carregados
export interface EpisodeWithPodcast extends Episode {
    podcast: Podcast;
}

export interface Comment {
    id: string;
    content: string;
    userId: string;
    user: User;
    episodeId: string;
    createdAt: Date;
}

export interface AudioRecording {
    uri: string;
    duration: number;
    quality?: string;
}

// ✅ ATUALIZADO: Interface de estado de reprodução aprimorada
export interface PlaybackState {
    isPlaying: boolean;
    position: number;
    duration: number;
    currentEpisode?: Episode;
    playbackSpeed: number;
    isLoading: boolean;

    // ✅ NOVOS CAMPOS PARA PLAYER PROFISSIONAL
    isBuffering?: boolean;
    volume?: number;
    isMuted?: boolean;
    shouldLoop?: boolean;
    audioQuality?: 'low' | 'medium' | 'high';
    errorMessage?: string | null;
}

export interface CreatorStats {
    totalPlays: number;
    totalLikes: number;
    totalFollowers: number;
    totalEpisodes: number;
    monthlyStats: {
        plays: number;
        newFollowers: number;
        engagement: number;
    };
}

export interface Donation {
    id: string;
    amount: number;
    currency: string;
    fromUserId: string;
    toCreatorId: string;
    episodeId?: string;
    message?: string;
    paymentMethod: 'pix' | 'card';
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
}

// ✅ NOVO: Interface para controles do player
export interface PlayerControls {
    play: () => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    skipForward: (seconds?: number) => Promise<void>;
    skipBackward: (seconds?: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    setPlaybackSpeed: (speed: number) => Promise<void>;
    toggleMute: () => Promise<void>;
}

// ✅ NOVO: Interface para informações de progresso
export interface ProgressInfo {
    current: string; // tempo formatado atual
    total: string; // duração total formatada
    remaining: string; // tempo restante formatado
    percent: string; // porcentagem como string
    progress: number; // valor de 0 a 1
}

// ✅ NOVO: Interface para configurações do player
export interface PlayerSettings {
    volume: number;
    playbackSpeed: number;
    audioQuality: 'low' | 'medium' | 'high';
    shouldLoop: boolean;
    isMuted: boolean;
}

// ✅ NOVO: Interface para status do player
export interface PlayerStatus {
    isPlaying: boolean;
    isLoading: boolean;
    isBuffering: boolean;
    hasError: boolean;
    canPlay: boolean;
    isActive: boolean;
    currentEpisode?: Episode;
}

// ✅ NOVO: Interface para queue/fila de reprodução
export interface PlayQueue {
    episodes: Episode[];
    currentIndex: number;
    isShuffled: boolean;
    repeatMode: 'none' | 'one' | 'all';
}

// ✅ NOVO: Interface para bookmark/marcador
export interface Bookmark {
    id: string;
    episodeId: string;
    position: number; // posição em ms
    title?: string;
    note?: string;
    createdAt: Date;
}

export const CATEGORIES = [
    'Tecnologia',
    'Educação',
    'Negócios',
    'Saúde',
    'Entretenimento',
    'Esportes',
    'Música',
    'História',
    'Ciência',
    'Arte',
    'Comédia',
    'Notícias'
] as const;

export type Category = typeof CATEGORIES[number];

// ✅ NOVO: Tipos para qualidade de áudio
export type AudioQuality = 'low' | 'medium' | 'high';

// ✅ NOVO: Tipos para modo de repetição
export type RepeatMode = 'none' | 'one' | 'all';

// ✅ NOVO: Tipos para velocidades de reprodução
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

// ✅ NOVO: Tipos para eventos do player
export type PlayerEvent =
    | 'play'
    | 'pause'
    | 'stop'
    | 'ended'
    | 'error'
    | 'loading'
    | 'loaded'
    | 'buffering'
    | 'seek';

// ✅ NOVO: Interface para eventos do player
export interface PlayerEventData {
    type: PlayerEvent;
    episode?: Episode;
    position?: number;
    error?: string;
    timestamp: Date;
}

// ✅ NOVO: Interface para preferências de player
export interface PlayerPreferences {
    autoPlay: boolean;
    continueWhereStopped: boolean;
    skipSilence: boolean;
    enhanceBass: boolean;
    showLyrics: boolean;
    downloadOnWifi: boolean;
    backgroundPlayback: boolean;
}