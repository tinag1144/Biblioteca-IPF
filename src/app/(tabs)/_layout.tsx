import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { color, encabezado, medida } from '@/constants/tema';

export const unstable_settings = { anchor: '(catalogo)' };

export default function LayoutTabs() {
  return (
    <Tabs backBehavior="initialRoute" screenOptions={{
      ...encabezado,
      tabBarActiveTintColor: color.rosaFuerte,
      tabBarInactiveTintColor: color.tenue,
      tabBarStyle: { backgroundColor: color.papel, borderTopColor: color.borde },
    }}>
      <Tabs.Screen name="(catalogo)" options={{
        title: 'Catálogo',
        headerShown: false,
        tabBarIcon: ({ focused }) => <Ionicons name="book-outline" color={focused ? color.rosaFuerte : color.tenue} size={medida.icono} />,
      }} />
      <Tabs.Screen name="reservas" options={{
        title: 'Mis reservas',
        tabBarIcon: ({ focused }) => <Ionicons name="bookmark-outline" color={focused ? color.rosaFuerte : color.tenue} size={medida.icono} />,
      }} />
    </Tabs>
  );
}
