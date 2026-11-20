import { Stack } from 'expo-router';

import { color, encabezado } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

export default function NavegacionRaiz() {
  const { estado } = useBiblioteca();
  return (
    <Stack screenOptions={{
      ...encabezado,
      contentStyle: { backgroundColor: color.fondo },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
      <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
      <Stack.Screen name="reservar/[isbn]" options={{ title: 'Reservar', presentation: 'modal' }} />
      <Stack.Screen name="permisos/[recurso]" options={{ title: 'Permisos', presentation: 'modal' }} />
      <Stack.Protected guard={!estado.sesion}>
        <Stack.Screen name="login" options={{ title: 'Personal', presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={estado.sesion}>
        <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
      </Stack.Protected>
      <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
    </Stack>
  );
}
