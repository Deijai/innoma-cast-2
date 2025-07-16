import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function AppLayout() {
    const { isAuthenticated, isLoading, isCreator } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    useEffect(() => {
        // If user becomes unauthenticated, redirect to auth
        if (!isLoading && !isAuthenticated) {
            router.replace('/(auth)/profile-choice');
        }
    }, [isAuthenticated, isLoading]);

    // Don't render anything if not authenticated
    if (!isLoading && !isAuthenticated) {
        return null;
    }

    return (
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
            {/* Dashboard - Sempre visível */}
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* Descobrir - Apenas para ouvintes */}
            <Tabs.Screen
                name="discover"
                options={{
                    title: 'Descobrir',
                    href: isCreator ? null : '/(app)/discover',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />

            {/* Biblioteca - Apenas para ouvintes */}
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Biblioteca',
                    href: isCreator ? null : '/(app)/library',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="library" size={size} color={color} />
                    ),
                }}
            />

            {/* Meus Podcasts - Apenas para criadores */}
            <Tabs.Screen
                name="my-podcasts"
                options={{
                    title: 'Meus Podcasts',
                    href: isCreator ? '/(app)/my-podcasts' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mic" size={size} color={color} />
                    ),
                }}
            />

            {/* Analytics - Apenas para criadores */}
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    href: isCreator ? '/(app)/analytics' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />

            {/* Configurações - Sempre visível */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Configurações',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />

            {/* Rotas modais/stack - ocultas das tabs */}
            <Tabs.Screen
                name="podcasts"
                options={{
                    href: null, // Oculta da tab bar
                }}
            />
            <Tabs.Screen
                name="episodes"
                options={{
                    href: null, // Oculta da tab bar
                }}
            />
        </Tabs>
    );
}