import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user becomes authenticated, redirect to main app
        if (!isLoading && isAuthenticated) {
            router.replace('/(app)/(tabs)');
        }
    }, [isAuthenticated, isLoading, router]);

    // Don't render anything while loading or if authenticated
    if (isLoading || isAuthenticated) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="profile-choice" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}