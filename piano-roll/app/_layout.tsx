import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initAssets } from '@/lib/init';

import { setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { createAudioPlayer } from 'expo-audio';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {

      /// Configure audio mode on non-web platforms
      try {
        if (Platform.OS !== 'web') {
          await setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: false,
          });
          console.log('Audio mode configured (expo-audio)');
        }
      } catch (error) {
        console.error('Failed to configure audio mode:', error);
      }

      /// Load assets
      try {
        console.log('Initializing assets...');
        await initAssets();
        console.log('Assets initialized.');
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Auth screen - standalone */}
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* Main app with tabs */}
        <Stack.Screen name="(main)" options={{ headerShown: false }} />

        {/* Overlay menu - shown as modal over everything */}
        <Stack.Screen
          name="menu"
          options={{
            presentation: 'modal',
            headerShown: false,
            // Make it transparent so underlying content shows
            animation: 'fade',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}


