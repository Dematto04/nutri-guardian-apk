/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#46C5DF';
const tintColorDark = '#46C5DF';

export const Colors = {
  primary: '#46C5DF',
  secondary: '#1D3D47',
  background: {
    light: '#FFFFFF',
    dark: '#000000'
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    light: '#FFFFFF'
  },
  input: {
    background: '#f5f5f5',
    placeholder: '#666666'
  },
  button: {
    primary: '#46C5DF',
    text: '#FFFFFF'
  },
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#46C5DF',
    tabIconDefault: '#46C5DF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Type for the colors
export type ColorScheme = typeof Colors;
