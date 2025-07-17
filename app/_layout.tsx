// app/(app)/_layout.tsx - LAYOUT ATUALIZADO COM PLAYER FLUTUANTE
import { FloatingAudioPlayer } from '@/components/FloatingAudioPlayer';
import { usePlayer } from '@/hooks/useAudio';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useTheme();
    const { currentEpisode } = usePlayer();
    const router = useRouter();

    useEffect(() => {
        // Se usuário não estiver autenticado, redirecionar
        if (!isLoading && !isAuthenticated) {
            router.replace('/(auth)/profile-choice');
        }
    }, [isAuthenticated, isLoading, router]);

    // Não renderizar se carregando ou não autenticado
    if (isLoading || !isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* STACK PRINCIPAL DAS TELAS */}
            <Stack screenOptions={{ headerShown: false }}>
                {/* Tabs principais */}
                <Stack.Screen name="(tabs)" />

                {/* Telas modais/stack */}
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

            {/* 🎵 PLAYER FLUTUANTE - SEMPRE SOBRE TODAS AS TELAS */}
            {currentEpisode && (
                <FloatingAudioPlayer />
            )}
        </>
    );
}