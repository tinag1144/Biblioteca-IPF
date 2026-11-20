import { Stack } from 'expo-router';

import { color, letra } from '@/constants/tema';

export const unstable_settings = { anchor: 'index' };

export default function LayoutCatalogo() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: color.papel },
      headerTintColor: color.rosaFuerte,
      headerTitleStyle: { fontFamily: letra.serif },
      contentStyle: { backgroundColor: color.fondo },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Ficha del libro' }} />
    </Stack>
  );
}
