import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { color, comun, espacio, letra, medida, radio } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import Boton from './Boton';
import FilaLibro from './FilaLibro';

export default function EncabezadoCatalogo() {
  const { estado } = useBiblioteca();
  const recientes = estado.recientes.aArray().slice(-3).reverse();
  return (
    <View style={estilos.grupo}>
      <View style={[comun.fila, estilos.marcaFila]}>
        <View style={estilos.sello}>
          <Ionicons name="library-outline" size={medida.icono} color={color.rosaFuerte} />
        </View>
        <Text accessibilityRole="header" style={[comun.seccion, comun.flexible]}>Biblioteca IPF</Text>
        <Boton texto="Personal" icono="person-outline" variante="texto"
          accion={() => router.push(estado.sesion ? '/mostrador' : '/login')} />
      </View>
      <View style={estilos.hero}>
        <View style={estilos.editorial}>
          <Text accessibilityRole="header" style={estilos.titulo}>Tu próxima{'\n'}lectura</Text>
          <Text style={comun.cuerpo}>Encontrá y reservá libros del Instituto.</Text>
        </View>
        <View accessible={false} style={estilos.ilustracion}>
          <Ionicons name="sparkles-outline" size={medida.icono} color={color.rosaFuerte} style={estilos.brillo} />
          <View style={[estilos.lomo, estilos.lomoRosa]}><View style={estilos.banda} /></View>
          <View style={[estilos.lomo, estilos.lomoCrema]}><View style={estilos.banda} /></View>
          <View style={[estilos.lomo, estilos.lomoVerde]}><View style={estilos.banda} /></View>
        </View>
      </View>
      <View style={comun.fila}>
        <Boton texto="Buscar" icono="search-outline" accion={() => router.push('/buscar')} expandir />
        <Boton texto="Escanear" icono="scan-outline" variante="suave" accion={() => router.push('/escanear')} expandir />
      </View>
      <View style={estilos.recientes}>
        <Text accessibilityRole="header" style={comun.seccion}>Vistos recientemente</Text>
        <FlatList
          horizontal
          data={recientes}
          keyExtractor={(libro) => libro.isbn}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.carrusel}
          ListEmptyComponent={<Text style={comun.cuerpo}>Los libros que abras van a aparecer acá.</Text>}
          renderItem={({ item }) => <View style={estilos.reciente}><FilaLibro libro={item} /></View>}
        />
      </View>
      <Text accessibilityRole="header" style={comun.seccion}>Catálogo</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: espacio.xl, marginBottom: espacio.m },
  marcaFila: { gap: espacio.s },
  sello: {
    width: medida.marca, height: medida.marca, borderRadius: radio.m,
    alignItems: 'center', justifyContent: 'center', backgroundColor: color.rosaSuave,
  },
  hero: {
    flexDirection: 'row', alignItems: 'center', minHeight: medida.hero,
    padding: espacio.xl, borderRadius: radio.xl, backgroundColor: color.rosa,
    borderWidth: StyleSheet.hairlineWidth, borderColor: color.borde, overflow: 'hidden',
  },
  editorial: { flex: 1, gap: espacio.s },
  titulo: { fontFamily: letra.serif, fontSize: letra.hero, lineHeight: letra.interlineadoHero, color: color.tinta },
  ilustracion: {
    width: medida.dibujo, height: medida.dibujo, flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'center', gap: espacio.xs, paddingBottom: espacio.l, borderRadius: radio.redondo,
    backgroundColor: color.rosaSuave, borderWidth: StyleSheet.hairlineWidth, borderColor: color.borde,
  },
  brillo: { position: 'absolute', top: espacio.s, right: espacio.l },
  lomo: { width: medida.libro, borderRadius: radio.s, borderWidth: StyleSheet.hairlineWidth, borderColor: color.tenue },
  lomoRosa: { height: medida.lomos[0], backgroundColor: color.lomoRosa, transform: [{ rotate: '-9deg' }] },
  lomoCrema: { height: medida.lomos[1], backgroundColor: color.papel },
  lomoVerde: { height: medida.lomos[2], backgroundColor: color.lomoVerde, transform: [{ rotate: '10deg' }] },
  banda: { marginTop: espacio.l, height: espacio.s, borderTopWidth: 1, borderBottomWidth: 1, borderColor: color.tenue },
  recientes: { gap: espacio.s },
  carrusel: { gap: espacio.s },
  reciente: { width: medida.tarjetaReciente },
});
