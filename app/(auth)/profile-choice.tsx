import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function ProfileChoice() {
    const router = useRouter();
    const { colors } = useTheme();

    const handleChooseProfile = (role: 'creator' | 'listener') => {
        router.push(`/(auth)/login?role=${role}`);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
            paddingTop: 60,
            justifyContent: 'center',
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
            textAlign: 'center',
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
        profileOptions: {
            gap: 16,
            marginBottom: 20,
        },
        profileCard: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        profileIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        profileTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 6,
        },
        profileDescription: {
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 18,
            marginBottom: 12,
        },
        profileFeatures: {
            alignItems: 'center',
            marginBottom: 16,
        },
        feature: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        featureText: {
            fontSize: 11,
            color: colors.textSecondary,
            marginLeft: 6,
        },
        selectButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 6,
            minWidth: 100,
            alignItems: 'center',
        },
        selectButtonText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Ionicons name="radio" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.title}>PodcastApp</Text>
                <Text style={styles.subtitle}>
                    Escolha como você quer usar o app{'\n'}
                    Você pode alterar depois nas configurações
                </Text>
            </View>

            <View style={styles.profileOptions}>
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => handleChooseProfile('listener')}
                    activeOpacity={0.8}
                >
                    <View style={styles.profileIcon}>
                        <Ionicons name="headset" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.profileTitle}>Ouvinte</Text>
                    <Text style={styles.profileDescription}>
                        Descubra podcasts incríveis, siga criadores e apoie o conteúdo que você ama
                    </Text>

                    <View style={styles.profileFeatures}>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.featureText}>Ouça podcasts ilimitados</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.featureText}>Siga criadores favoritos</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.featureText}>Apoie com doações</Text>
                        </View>
                    </View>

                    <View style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>Começar como Ouvinte</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => handleChooseProfile('creator')}
                    activeOpacity={0.8}
                >
                    <View style={styles.profileIcon}>
                        <Ionicons name="mic" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.profileTitle}>Criador</Text>
                    <Text style={styles.profileDescription}>
                        Crie podcasts, construa uma audiência e monetize seu conteúdo
                    </Text>

                    <View style={styles.profileFeatures}>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.featureText}>Grave e publique episódios</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.featureText}>Analise estatísticas</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.featureText}>Receba doações</Text>
                        </View>
                    </View>

                    <View style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>Começar como Criador</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}