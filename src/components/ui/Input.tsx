import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  hint,
  error,
  prefix,
  suffix,
  containerStyle,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        {prefix && <Text style={styles.affix}>{prefix}</Text>}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="numeric"
          {...props}
        />
        {suffix && <Text style={styles.affix}>{suffix}</Text>}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  inputRowFocused: { borderColor: Colors.borderFocus },
  inputRowError: { borderColor: Colors.error },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    paddingVertical: Spacing.sm,
  },
  affix: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
    fontFamily: Typography.fontFamily,
    marginHorizontal: Spacing.xs,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily,
  },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily,
  },
});
