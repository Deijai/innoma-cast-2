import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useTheme();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                // User is authenticated, go to dashboard
                router.replace('/app)');
            } else {
                // User is not authenticated, go to auth flow
                router.replace('/(auth)/profile-choice');
            }
        }
    }, [isLoading, isAuthenticated]);

    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.text, marginTop: 16 }}>Carregando...</Text>
        </View>
    );
}