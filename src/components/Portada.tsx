import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { color, medida, radio } from '@/constants/tema';

export default function Portada({ isbn }: { isbn: string }) {
  const tonos = [estilos.rosa, estilos.crema, estilos.verde];
  return (
    <View accessible={false} style={[estilos.libro, tonos[Number(isbn.slice(-1)) % tonos.length]]}>
      <Ionicons name="book-outline" color={color.tenue} size={medida.iconoChico} />
    </View>
  );
}

const estilos = StyleSheet.create({
  libro: {
    width: medida.portada, height: medida.alturaPortada, borderRadius: radio.s,
    borderLeftWidth: 3, borderLeftColor: color.borde, alignItems: 'center', justifyContent: 'center',
  },
  rosa: { backgroundColor: color.rosa },
  crema: { backgroundColor: color.fondo },
  verde: { backgroundColor: color.verdeSuave },
});
