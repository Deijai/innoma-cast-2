import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    error?: string;
    disabled?: boolean;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    style?: ViewStyle;
    inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines = 1,
    error,
    disabled = false,
    leftIcon,
    rightIcon,
    onRightIconPress,
    style,
    inputStyle,
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const containerStyle: ViewStyle = {
        marginBottom: 16,
        ...style,
    };

    const labelStyle: TextStyle = {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 8,
    };

    const inputContainerStyle: ViewStyle = {
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: multiline ? 12 : 0,
        minHeight: multiline ? 80 : 44,
    };

    const textInputStyle: TextStyle = {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        paddingVertical: multiline ? 0 : 12,
        textAlignVertical: multiline ? 'top' : 'center',
        ...inputStyle,
    };

    const iconStyle = {
        marginHorizontal: 4,
    };

    const errorStyle: TextStyle = {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    };

    const handleRightIconPress = () => {
        if (secureTextEntry) {
            setShowPassword(!showPassword);
        } else if (onRightIconPress) {
            onRightIconPress();
        }
    };

    const getRightIcon = () => {
        if (secureTextEntry) {
            return showPassword ? 'eye-off' : 'eye';
        }
        return rightIcon;
    };

    return (
        <View style={containerStyle}>
            {label && <Text style={labelStyle}>{label}</Text>}

            <View style={[inputContainerStyle, disabled && { opacity: 0.6 }]}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={colors.textSecondary}
                        style={iconStyle}
                    />
                )}

                <TextInput
                    style={textInputStyle}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={!disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {(rightIcon || secureTextEntry) && (
                    <TouchableOpacity
                        onPress={handleRightIconPress}
                        disabled={!secureTextEntry && !onRightIconPress}
                        style={iconStyle}
                    >
                        <Ionicons
                            name={getRightIcon() as keyof typeof Ionicons.glyphMap}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={errorStyle}>{error}</Text>}
        </View>
    );
};