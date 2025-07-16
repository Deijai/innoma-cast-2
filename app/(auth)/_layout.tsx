import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user becomes authenticated, redirect to app
        if (!isLoading && isAuthenticated) {
            router.replace('/(app)/dashboard');
        }
    }, [isAuthenticated, isLoading]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="profile-choice" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}