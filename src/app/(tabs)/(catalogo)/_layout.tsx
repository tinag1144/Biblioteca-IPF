import { Stack } from 'expo-router';

import { color, encabezado } from '@/constants/tema';

export const unstable_settings = { anchor: 'index' };

export default function LayoutCatalogo() {
  return (
    <Stack screenOptions={{
      ...encabezado,
      contentStyle: { backgroundColor: color.fondo },
    }}>
      <Stack.Screen name="index" options={{ title: 'Catálogo', headerShown: false }} />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Ficha del libro' }} />
    </Stack>
  );
}
