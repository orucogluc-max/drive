import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabNavigator } from './src/navigation/TabNavigator';
import { colors } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.brand,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.foreground,
    border: colors.border,
    notification: colors.brand,
  },
  fonts: {
    regular: { fontFamily: 'Inter', fontWeight: '400' as const },
    medium: { fontFamily: 'Inter', fontWeight: '500' as const },
    bold: { fontFamily: 'Inter', fontWeight: '700' as const },
    heavy: { fontFamily: 'Inter', fontWeight: '800' as const },
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <TabNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
