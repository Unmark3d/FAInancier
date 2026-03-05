import React, { useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 60, bounciness: 2 }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  };

  const containerStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`${variant}Label` as keyof typeof styles],
    styles[`${size}Label` as keyof typeof styles],
    textStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale }], alignSelf: fullWidth ? 'stretch' : 'auto' }}>
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? Colors.textInverse : Colors.primary}
            size="small"
          />
        ) : (
          <Text style={labelStyle}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.accentLight },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },

  // Sizes
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, minHeight: 36 },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, minHeight: 44 },
  lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minHeight: 52 },

  // Labels
  label: {
    fontWeight: Typography.semibold,
    fontFamily: Typography.fontFamily,
  },
  primaryLabel: { color: Colors.textInverse },
  secondaryLabel: { color: Colors.accent },
  outlineLabel: { color: Colors.primary },
  ghostLabel: { color: Colors.primary },

  smLabel: { fontSize: Typography.sm },
  mdLabel: { fontSize: Typography.base },
  lgLabel: { fontSize: Typography.md },
});
