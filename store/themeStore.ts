import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, NativeEventSubscription } from 'react-native';
import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    activeTheme: ActiveTheme;
    subscription: NativeEventSubscription | null;

    // Actions
    setTheme: (theme: Theme) => Promise<void>;
    initializeTheme: () => Promise<void>;
    getActiveTheme: () => ActiveTheme;
    cleanup: () => void;
}

const getSystemTheme = (): ActiveTheme => {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: 'system',
    activeTheme: getSystemTheme(),
    subscription: null,

    setTheme: async (theme: Theme) => {
        try {
            await AsyncStorage.setItem('theme', theme);
            const activeTheme = theme === 'system' ? getSystemTheme() : theme;
            set({ theme, activeTheme });
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    },

    initializeTheme: async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme') as Theme;
            const theme = savedTheme || 'system';
            const activeTheme = theme === 'system' ? getSystemTheme() : theme;

            set({ theme, activeTheme });

            // Clean up previous subscription
            const { subscription: currentSubscription } = get();
            if (currentSubscription) {
                currentSubscription.remove();
            }

            // Listen to system theme changes
            const subscription = Appearance.addChangeListener(({ colorScheme }) => {
                const currentTheme = get().theme;
                if (currentTheme === 'system') {
                    const newActiveTheme = colorScheme === 'dark' ? 'dark' : 'light';
                    set({ activeTheme: newActiveTheme });
                }
            });

            // Store subscription for cleanup
            set({ subscription });
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    },

    getActiveTheme: () => {
        const { theme } = get();
        return theme === 'system' ? getSystemTheme() : theme;
    },

    cleanup: () => {
        const { subscription } = get();
        if (subscription) {
            subscription.remove();
            set({ subscription: null });
        }
    }
}));

// Theme colors
export const colors = {
    light: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        card: '#FFFFFF',
        text: '#000000',
        textSecondary: '#8E8E93',
        border: '#C6C6C8',
        accent: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        shadow: '#000000',
    },
    dark: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        background: '#000000',
        surface: '#1C1C1E',
        card: '#2C2C2E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#38383A',
        accent: '#FF453A',
        success: '#32D74B',
        warning: '#FF9F0A',
        error: '#FF453A',
        shadow: '#000000',
    }
};

export const getColors = (theme: ActiveTheme) => colors[theme];