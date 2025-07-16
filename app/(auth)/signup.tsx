import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { UserRole } from '../../types';

export default function SignUp() {
    const router = useRouter();
    const { colors } = useTheme();
    const { signUp, isLoading } = useAuth();
    const { role } = useLocalSearchParams<{ role: string }>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    const userRole = role as UserRole || 'listener';
    const isCreator = userRole === 'creator';

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'Por favor, digite seu nome');
            return false;
        }

        if (!email.trim()) {
            Alert.alert('Erro', 'Por favor, digite seu email');
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Erro', 'Por favor, digite um email válido');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return false;
        }

        if (!agreeTerms) {
            Alert.alert('Erro', 'Você deve aceitar os termos de uso');
            return false;
        }

        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        try {
            console.log('Tentando criar conta...');
            await signUp(email.trim(), password, name.trim(), userRole);
            console.log('Conta criada com sucesso, redirecionando...');

            // Força redirecionamento para dashboard
            router.replace('/dashboard');
        } catch (error: any) {
            console.error('Erro no cadastro:', error);
            Alert.alert('Erro no Cadastro', error.message || 'Ocorreu um erro ao criar a conta');
        }
    };

    const handleLogin = () => {
        router.push(`/login?role=${userRole}`);
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
            marginBottom: 32,
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
        termsContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 24,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            marginTop: 2,
        },
        checkboxChecked: {
            borderColor: colors.primary,
            backgroundColor: colors.primary,
        },
        termsText: {
            flex: 1,
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        termsLink: {
            color: colors.primary,
            fontWeight: '500',
        },
        signupButton: {
            marginBottom: 16,
        },
        loginContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 16,
        },
        loginText: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        loginLink: {
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
            <Button
                title="Voltar"
                onPress={() => router.back()}
                variant="outline"
                size="small"
                style={styles.backButton}
            />

            <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Ionicons name={isCreator ? "mic" : "headset"} size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.title}>Criar conta</Text>
                    <Text style={styles.subtitle}>
                        {isCreator
                            ? "Comece a criar seus podcasts hoje"
                            : "Descubra podcasts incríveis"
                        }
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
                        label="Nome completo"
                        placeholder="Seu nome"
                        value={name}
                        onChangeText={setName}
                        leftIcon="person"
                    />

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
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        leftIcon="lock-closed"
                    />

                    <Input
                        label="Confirmar senha"
                        placeholder="Digite a senha novamente"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        leftIcon="lock-closed"
                    />
                </View>

                <View style={styles.termsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.checkbox,
                            agreeTerms && styles.checkboxChecked
                        ]}
                        onPress={() => setAgreeTerms(!agreeTerms)}
                    >
                        {agreeTerms && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.termsText}>
                        Eu aceito os{' '}
                        <Text style={styles.termsLink}>Termos de Uso</Text>
                        {' '}e a{' '}
                        <Text style={styles.termsLink}>Política de Privacidade</Text>
                    </Text>
                </View>

                <Button
                    title="Criar conta"
                    onPress={handleSignUp}
                    loading={isLoading}
                    style={styles.signupButton}
                />

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Já tem uma conta?</Text>
                    <Button
                        title="Fazer login"
                        onPress={handleLogin}
                        variant="outline"
                        size="small"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}