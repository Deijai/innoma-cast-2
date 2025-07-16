import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { UserRole } from '../../types';

export default function Login() {
    const router = useRouter();
    const { colors } = useTheme();
    const { signIn } = useAuth();
    const { role } = useLocalSearchParams<{ role: string }>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const userRole = role as UserRole || 'listener';
    const isCreator = userRole === 'creator';

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        try {
            setIsLoading(true);
            await signIn(email.trim(), password);
            // Redirecionamento será feito automaticamente pelo layout
        } catch (error: any) {
            Alert.alert('Erro no Login', error.message || 'Ocorreu um erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = () => {
        router.push(`/(auth)/signup?role=${userRole}`);
    };

    const handleForgotPassword = () => {
        Alert.alert('Recuperar Senha', 'Funcionalidade em desenvolvimento');
    };

    const handleGoogleLogin = () => {
        Alert.alert('Login com Google', 'Funcionalidade em desenvolvimento');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollView: {
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
        },
        header: {
            alignItems: 'center',
            marginBottom: 40,
        },
        logo: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        roleIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginTop: 16,
        },
        roleText: {
            fontSize: 14,
            color: colors.text,
            marginLeft: 8,
            fontWeight: '500',
        },
        form: {
            marginBottom: 24,
        },
        forgotPassword: {
            alignSelf: 'flex-end',
            marginTop: -8,
            marginBottom: 24,
        },
        forgotPasswordText: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
        },
        loginButton: {
            marginBottom: 16,
        },
        divider: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 24,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
        },
        dividerText: {
            marginHorizontal: 16,
            fontSize: 14,
            color: colors.textSecondary,
        },
        googleButton: {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
        },
        signupContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 16,
        },
        signupText: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        signupLink: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
            marginLeft: 4,
        },
        backButton: {
            position: 'absolute',
            top: 60,
            left: 20,
            zIndex: 1,
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Ionicons name={isCreator ? "mic" : "headset"} size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.title}>Bem-vindo de volta!</Text>
                    <Text style={styles.subtitle}>
                        Entre na sua conta para continuar
                    </Text>

                    <View style={styles.roleIndicator}>
                        <Ionicons
                            name={isCreator ? "mic" : "headset"}
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={styles.roleText}>
                            {isCreator ? "Criador de Podcast" : "Ouvinte"}
                        </Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="seu@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail"
                    />

                    <Input
                        label="Senha"
                        placeholder="Sua senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        leftIcon="lock-closed"
                    />

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={handleForgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>
                            Esqueci minha senha
                        </Text>
                    </TouchableOpacity>
                </View>

                <Button
                    title="Entrar"
                    onPress={handleLogin}
                    loading={isLoading}
                    style={styles.loginButton}
                />

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.dividerLine} />
                </View>

                <Button
                    title="Continuar com Google"
                    onPress={handleGoogleLogin}
                    variant="secondary"
                    style={styles.googleButton}
                />

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Não tem uma conta?</Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={styles.signupLink}>Criar conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}