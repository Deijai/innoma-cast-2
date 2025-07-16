// app/(app)/(tabs)/_layout.tsx - COM LOGS DETALHADOS
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

export default function TabsLayout() {
    const { isAuthenticated, isLoading, isCreator, user } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    // 🐛 DEBUG MÁXIMO
    console.log('=== TABS LAYOUT DEBUG ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isLoading:', isLoading);
    console.log('isCreator:', isCreator);
    console.log('user:', user);
    console.log('user.role:', user?.role);
    console.log('========================');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log('❌ Redirecionando para auth...');
            router.replace('/(auth)/profile-choice');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        console.log('⏳ Loading...');
        return null;
    }

    if (!isAuthenticated) {
        console.log('🚫 Not authenticated');
        return null;
    }

    console.log('✅ Renderizando tabs para:', isCreator ? 'CREATOR' : 'LISTENER');

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
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* TESTE: SEMPRE MOSTRAR DISCOVER */}
            <Tabs.Screen
                name="discover"
                options={{
                    title: 'Descobrir',
                    // href: isCreator ? null : undefined, // COMENTADO PARA TESTE
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />

            {/* TESTE: SEMPRE MOSTRAR LIBRARY */}
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Biblioteca',
                    // href: isCreator ? null : undefined, // COMENTADO PARA TESTE
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="library" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="my-podcasts"
                options={{
                    title: 'Meus Podcasts',
                    href: !isCreator ? null : undefined,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mic" size={size} color={color} />
                    ),
                }}
            />

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
    );
}