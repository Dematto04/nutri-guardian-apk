import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface ThemedInputProps extends TextInputProps {
  variant?: 'default' | 'outlined';
}

export function ThemedInput({ variant = 'default', style, ...props }: ThemedInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const inputStyles = [
    styles.input,
    variant === 'outlined' && styles.outlinedInput,
    isDark && styles.darkInput,
    style,
  ];

  return (
    <TextInput
      style={inputStyles}
      placeholderTextColor={isDark ? Colors.dark.text : Colors.input.placeholder}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.input.background,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  outlinedInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  darkInput: {
    backgroundColor: Colors.dark.background,
    color: Colors.dark.text,
  },
}); 