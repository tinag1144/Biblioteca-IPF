import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { color, espacio, letra, medida, radio } from '@/constants/tema';

type Props = {
  texto: string;
  accion: () => void;
  icono?: keyof typeof Ionicons.glyphMap;
  variante?: 'principal' | 'suave' | 'texto';
  deshabilitado?: boolean;
  expandir?: boolean;
};

export default function Boton({
  texto, accion, icono, variante = 'principal', deshabilitado, expandir,
}: Props) {
  const principal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={accion}
      style={({ pressed }) => [
        estilos.base, estilos[variante], expandir && estilos.expandido,
        (pressed || deshabilitado) && estilos.atenuado,
      ]}
    >
      {icono && <Ionicons name={icono} size={medida.icono} color={principal ? color.blanco : color.rosaFuerte} />}
      <Text style={[estilos.rotulo, principal && estilos.rotuloPrincipal]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: 'row', gap: espacio.s, alignItems: 'center', justifyContent: 'center',
    minHeight: medida.boton, minWidth: medida.tactil, paddingHorizontal: espacio.m, borderRadius: radio.m,
  },
  principal: { backgroundColor: color.rosaFuerte },
  suave: { backgroundColor: color.rosaSuave, borderWidth: StyleSheet.hairlineWidth, borderColor: color.borde },
  texto: { backgroundColor: 'transparent' },
  expandido: { flex: 1 },
  atenuado: { opacity: 0.62 },
  rotulo: { color: color.rosaFuerte, fontSize: letra.etiqueta, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  rotuloPrincipal: { color: color.blanco },
});
