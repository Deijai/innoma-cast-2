import { useEffect } from 'react';
import { getColors, useThemeStore } from '../store/themeStore';

export const useTheme = () => {
    const themeStore = useThemeStore();

    useEffect(() => {
        themeStore.initializeTheme();

        // Cleanup on unmount
        return () => {
            themeStore.cleanup();
        };
    }, []);

    return {
        theme: themeStore.theme,
        activeTheme: themeStore.activeTheme,
        colors: getColors(themeStore.activeTheme),
        setTheme: themeStore.setTheme,
        isDark: themeStore.activeTheme === 'dark',
        isLight: themeStore.activeTheme === 'light',
    };
};