export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 6) {
        return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
    }

    return { isValid: true };
};

export const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
};

export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

export const validatePodcastTitle = (title: string): boolean => {
    return title.trim().length >= 3 && title.trim().length <= 100;
};

export const validateEpisodeTitle = (title: string): boolean => {
    return title.trim().length >= 3 && title.trim().length <= 200;
};

export const validateDescription = (description: string): boolean => {
    return description.trim().length >= 10 && description.trim().length <= 2000;
};