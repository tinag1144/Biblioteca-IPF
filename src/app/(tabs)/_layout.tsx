import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

import { color, letra, medida } from '@/constants/tema';

export const unstable_settings = { anchor: '(catalogo)' };

export default function LayoutTabs() {
  return (
    <Tabs backBehavior="initialRoute" screenOptions={{
      headerStyle: { backgroundColor: color.papel },
      headerTintColor: color.rosaFuerte,
      headerTitleStyle: { fontFamily: letra.serif },
      tabBarActiveTintColor: color.rosaFuerte,
      tabBarInactiveTintColor: color.tenue,
      tabBarStyle: { backgroundColor: color.papel, borderTopColor: color.borde },
    }}>
      <Tabs.Screen name="(catalogo)" options={{
        title: 'Catálogo',
        headerShown: false,
        tabBarIcon: ({ color }) => <Ionicons name="book-outline" color={color} size={medida.icono} />,
      }} />
      <Tabs.Screen name="reservas" options={{
        title: 'Mis reservas',
        tabBarIcon: ({ color }) => <Ionicons name="bookmark-outline" color={color} size={medida.icono} />,
      }} />
    </Tabs>
  );
}
