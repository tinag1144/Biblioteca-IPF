import { Stack } from 'expo-router';

import { color, letra } from '@/constants/tema';
import { BibliotecaProvider, useBiblioteca } from '@/context/BibliotecaContext';

export const unstable_settings = { anchor: '(tabs)' };

function NavegacionRaiz() {
  const { estado } = useBiblioteca();
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: color.papel },
      headerTintColor: color.rosaFuerte,
      headerTitleStyle: { fontFamily: letra.serif },
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

export default function LayoutRaiz() {
  return <BibliotecaProvider><NavegacionRaiz /></BibliotecaProvider>;
}
