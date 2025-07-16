import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useTheme();

    useEffect(() => {
        // Only redirect when we have a definitive auth state
        if (!isLoading) {
            if (isAuthenticated) {
                // User is authenticated, go to main app
                router.replace('/(app)/(tabs)');
            } else {
                // User is not authenticated, go to auth flow
                router.replace('/(auth)/profile-choice');
            }
        }
    }, [isLoading, isAuthenticated, router]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
        logo: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 16,
        },
        subtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 32,
        },
    });

    // Show loading screen while checking authentication
    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Text style={{ fontSize: 40, color: '#FFFFFF' }}>🎧</Text>
            </View>
            <Text style={styles.title}>PodcastApp</Text>
            <Text style={styles.subtitle}>Carregando...</Text>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}