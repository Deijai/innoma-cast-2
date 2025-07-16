import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
    const { activeTheme } = useTheme();
    const initializeAuth = useAuthStore(state => state.initializeAuth);

    useEffect(() => {
        // Initialize authentication state
        const unsubscribe = initializeAuth();

        // Cleanup on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    return (
        <>
            <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
            <Slot />
        </>
    );
}