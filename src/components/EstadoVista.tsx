import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { color, comun, espacio, medida } from '@/constants/tema';
import Boton from './Boton';

type Props = {
  titulo: string;
  detalle?: string;
  cargando?: boolean;
  icono?: keyof typeof Ionicons.glyphMap;
  boton?: { texto: string; accion: () => void };
};

export default function EstadoVista({
  titulo, detalle, cargando, icono = 'book-outline', boton,
}: Props) {
  return (
    <View accessibilityLiveRegion="polite" style={[comun.tarjeta, estilos.centro]}>
      {cargando
        ? <ActivityIndicator color={color.rosaFuerte} />
        : <Ionicons name={icono} size={medida.icono} color={color.rosaFuerte} />}
      <Text style={[comun.subtitulo, estilos.texto]}>{titulo}</Text>
      {detalle && <Text style={[comun.cuerpo, estilos.texto]}>{detalle}</Text>}
      {boton && <Boton {...boton} variante="suave" />}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', paddingVertical: espacio.xxl },
  texto: { textAlign: 'center' },
});
