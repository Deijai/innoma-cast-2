export const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }

    return `${minutes}min`;
};

export const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (date: Date | any): string => {
    try {
        // Se não é uma data válida, retornar string padrão
        if (!date) return 'Data não disponível';

        // Se já é um objeto Date válido
        if (date instanceof Date && !isNaN(date.getTime())) {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        }

        // Se é um Timestamp do Firestore
        if (date.seconds !== undefined) {
            const firebaseDate = new Date(date.seconds * 1000);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(firebaseDate);
        }

        // Se é uma string, tentar converter
        if (typeof date === 'string') {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                return new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).format(parsedDate);
            }
        }

        // Fallback
        return 'Data inválida';
    } catch (error) {
        console.warn('Erro ao formatar data:', error);
        return 'Data inválida';
    }
};

export const formatDateTime = (date: Date | any): string => {
    try {
        if (!date) return 'Data não disponível';

        if (date instanceof Date && !isNaN(date.getTime())) {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }

        if (date.seconds !== undefined) {
            const firebaseDate = new Date(date.seconds * 1000);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(firebaseDate);
        }

        if (typeof date === 'string') {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                return new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(parsedDate);
            }
        }

        return 'Data inválida';
    } catch (error) {
        console.warn('Erro ao formatar data/hora:', error);
        return 'Data inválida';
    }
};

export const formatRelativeTime = (date: Date | any): string => {
    try {
        if (!date) return 'Data não disponível';

        let validDate: Date;

        if (date instanceof Date && !isNaN(date.getTime())) {
            validDate = date;
        } else if (date.seconds !== undefined) {
            validDate = new Date(date.seconds * 1000);
        } else if (typeof date === 'string') {
            validDate = new Date(date);
            if (isNaN(validDate.getTime())) {
                return 'Data inválida';
            }
        } else {
            return 'Data inválida';
        }

        const now = new Date();
        const diffMs = now.getTime() - validDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;

        return `${Math.floor(diffDays / 365)} anos atrás`;
    } catch (error) {
        console.warn('Erro ao formatar tempo relativo:', error);
        return 'Data inválida';
    }
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

export const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
};