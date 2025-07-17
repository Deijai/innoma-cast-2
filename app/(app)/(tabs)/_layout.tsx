// app/(app)/(tabs)/_layout.tsx - LAYOUT DAS TABS COM PLAYER
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { usePlayer } from '../../../hooks/useAudio';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

export default function TabsLayout() {
    const { isAuthenticated, isLoading, isCreator, user } = useAuth();
    const { colors } = useTheme();
    const { currentEpisode } = usePlayer();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/(auth)/profile-choice');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* TABS NAVIGATION */}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarStyle: {
                        backgroundColor: colors.card,
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                        paddingBottom: 8,
                        paddingTop: 8,
                        height: 80,
                        // ✅ IMPORTANTE: Adicionar margem se player estiver ativo
                        marginBottom: currentEpisode ? 80 : 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                        marginTop: 4,
                    },
                    tabBarIconStyle: {
                        marginTop: 4,
                    },
                }}
            >
                {/* INÍCIO - TODOS USUÁRIOS */}
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Início',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home" size={size} color={color} />
                        ),
                    }}
                />

                {/* DESCOBRIR - TODOS USUÁRIOS */}
                <Tabs.Screen
                    name="discover"
                    options={{
                        title: 'Descobrir',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="search" size={size} color={color} />
                        ),
                    }}
                />

                {/* BIBLIOTECA - APENAS OUVINTES */}
                <Tabs.Screen
                    name="library"
                    options={{
                        title: 'Biblioteca',
                        href: isCreator ? null : undefined,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="library" size={size} color={color} />
                        ),
                    }}
                />

                {/* MEUS EPISÓDIOS - APENAS CRIADORES */}
                <Tabs.Screen
                    name="my-episodes"
                    options={{
                        title: 'Episódios',
                        href: !isCreator ? null : undefined,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="musical-notes" size={size} color={color} />
                        ),
                    }}
                />

                {/* MEUS PODCASTS - APENAS CRIADORES */}
                <Tabs.Screen
                    name="my-podcasts"
                    options={{
                        title: 'Podcasts',
                        href: !isCreator ? null : undefined,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="mic" size={size} color={color} />
                        ),
                    }}
                />

                {/* ANALYTICS - APENAS CRIADORES */}
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        href: !isCreator ? null : undefined,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="stats-chart" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}