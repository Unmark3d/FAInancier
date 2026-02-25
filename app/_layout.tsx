import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontWeight: '600', fontFamily: 'System' },
          contentStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="scenario/a"
          options={{ title: 'Știu cât vreau să împrumut', headerBackTitle: 'Înapoi' }}
        />
        <Stack.Screen
          name="scenario/b"
          options={{ title: 'Știu cât pot plăti lunar', headerBackTitle: 'Înapoi' }}
        />
        <Stack.Screen
          name="scenario/c"
          options={{ title: 'Vreau să refinanțez', headerBackTitle: 'Înapoi' }}
        />
        <Stack.Screen
          name="results"
          options={{ title: 'Comparație oferte', headerBackTitle: 'Înapoi' }}
        />
        <Stack.Screen
          name="amortization"
          options={{ title: 'Grafic amortizare', headerBackTitle: 'Înapoi' }}
        />
        <Stack.Screen
          name="simulator"
          options={{ title: 'Simulator scenarii', headerBackTitle: 'Înapoi' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
