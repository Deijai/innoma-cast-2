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
    podcastId: string;
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

export interface PlaybackState {
    isPlaying: boolean;
    position: number;
    duration: number;
    currentEpisode?: Episode;
    playbackSpeed: number;
    isLoading: boolean;
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