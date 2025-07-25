import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="loading"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="ProfileView" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name='Videos' options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name='VideoPlayer' options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="register" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name='AllContacts' options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="introduction" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name='editContact' options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name='Register_Contact' options={{ headerShown: false, gestureEnabled: false }}/>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
