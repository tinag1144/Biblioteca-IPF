import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, comun, espacio, letra, medida } from '@/constants/tema';
import type { Libro } from '@/types';
import Portada from './Portada';

export default function FilaLibro({ libro, nota }: { libro: Libro; nota?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } })}
      style={({ pressed }) => [comun.tarjeta, comun.fila, estilos.fila, pressed && estilos.pulsado]}
    >
      <Portada isbn={libro.isbn} />
      <View style={estilos.texto}>
        <Text style={comun.subtitulo}>{libro.titulo}</Text>
        <Text style={comun.cuerpo}>{libro.autor}</Text>
        {nota && <Text style={estilos.nota}>{nota}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={medida.iconoChico} color={color.rosaFuerte} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: { padding: espacio.m },
  texto: { flex: 1, gap: espacio.xs },
  nota: { color: color.rosaFuerte, fontSize: letra.chica, fontWeight: '600' },
  pulsado: { backgroundColor: color.rosaSuave },
});
