import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    const { colors } = useTheme();

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        };

        // Size styles
        switch (size) {
            case 'small':
                baseStyle.paddingHorizontal = 12;
                baseStyle.paddingVertical = 8;
                baseStyle.minHeight = 32;
                break;
            case 'large':
                baseStyle.paddingHorizontal = 24;
                baseStyle.paddingVertical = 16;
                baseStyle.minHeight = 56;
                break;
            default: // medium
                baseStyle.paddingHorizontal = 16;
                baseStyle.paddingVertical = 12;
                baseStyle.minHeight = 44;
                break;
        }

        // Variant styles
        switch (variant) {
            case 'secondary':
                baseStyle.backgroundColor = colors.surface;
                baseStyle.borderWidth = 1;
                baseStyle.borderColor = colors.border;
                break;
            case 'outline':
                baseStyle.backgroundColor = 'transparent';
                baseStyle.borderWidth = 1;
                baseStyle.borderColor = colors.primary;
                break;
            case 'danger':
                baseStyle.backgroundColor = colors.error;
                break;
            default: // primary
                baseStyle.backgroundColor = colors.primary;
                break;
        }

        // Disabled state
        if (disabled || loading) {
            baseStyle.opacity = 0.6;
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            fontWeight: '600',
        };

        // Size styles
        switch (size) {
            case 'small':
                baseStyle.fontSize = 14;
                break;
            case 'large':
                baseStyle.fontSize = 18;
                break;
            default: // medium
                baseStyle.fontSize = 16;
                break;
        }

        // Variant styles
        switch (variant) {
            case 'secondary':
                baseStyle.color = colors.text;
                break;
            case 'outline':
                baseStyle.color = colors.primary;
                break;
            default: // primary, danger
                baseStyle.color = '#FFFFFF';
                break;
        }

        return baseStyle;
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading && (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'secondary' ? colors.primary : '#FFFFFF'}
                    style={{ marginRight: 8 }}
                />
            )}
            <Text style={[getTextStyle(), textStyle]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};