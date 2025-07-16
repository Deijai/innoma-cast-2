import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { PlayerControls } from '../../components/PlayerControls';
import { usePlayer } from '../../hooks/useAudio';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useTheme();
    const { currentEpisode } = usePlayer();
    const router = useRouter();

    useEffect(() => {
        // If user becomes unauthenticated, redirect to auth
        if (!isLoading && !isAuthenticated) {
            router.replace('/(auth)/profile-choice');
        }
    }, [isAuthenticated, isLoading, router]);

    // Don't render anything while loading or if not authenticated
    if (isLoading || !isAuthenticated) {
        return null;
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                {/* Main tabs */}
                <Stack.Screen name="(tabs)" />

                {/* Modal/Stack screens */}
                <Stack.Screen
                    name="podcasts"
                    options={{
                        presentation: 'modal',
                        headerShown: true,
                        headerStyle: { backgroundColor: colors.surface },
                        headerTintColor: colors.text,
                    }}
                />
                <Stack.Screen
                    name="episodes"
                    options={{
                        presentation: 'modal',
                        headerShown: true,
                        headerStyle: { backgroundColor: colors.surface },
                        headerTintColor: colors.text,
                    }}
                />
                <Stack.Screen
                    name="settings"
                    options={{
                        headerShown: true,
                        headerStyle: { backgroundColor: colors.surface },
                        headerTintColor: colors.text,
                        headerTitle: 'Configurações',
                    }}
                />
            </Stack>

            {/* Global Player - appears over all screens when episode is playing */}
            {currentEpisode && (
                <PlayerControls compact />
            )}
        </>
    );
}