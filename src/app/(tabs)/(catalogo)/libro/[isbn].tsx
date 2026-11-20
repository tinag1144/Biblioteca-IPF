import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Boton from '@/components/Boton';
import EstadoVista from '@/components/EstadoVista';
import Pagina from '@/components/Pagina';
import Portada from '@/components/Portada';
import { comun, espacio } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { disponibles, posicion } from '@/lib/biblioteca';
import { buscarPorIsbn } from '@/lib/catalogo';

export default function DetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const libro = buscarPorIsbn(isbn);
  const { estado, visitar } = useBiblioteca();

  useFocusEffect(useCallback(() => {
    if (libro) visitar(libro);
  }, [libro, visitar]));

  if (!libro) {
    return (
      <Pagina>
        <EstadoVista titulo="No encontramos ese libro." detalle="Revisá el ISBN o elegí un libro del catálogo."
          boton={{ texto: 'Volver al Catálogo', accion: () => router.dismissTo('/') }} />
      </Pagina>
    );
  }

  const cantidad = disponibles(estado, libro);
  const esperan = estado.esperas[libro.isbn]?.tamanio ?? 0;
  const prestado = Boolean(estado.prestamos[libro.isbn]);
  const lugar = posicion(estado, libro.isbn);

  return (
    <Pagina>
      <Stack.Screen options={{ title: libro.titulo }} />
      <View style={[comun.tarjeta, estilos.ficha]}>
        <Portada isbn={libro.isbn} />
        <Text accessibilityRole="header" style={comun.titulo}>{libro.titulo}</Text>
        <Text style={comun.cuerpo}>{libro.autor} · {libro.anio}</Text>
        <Text style={comun.etiqueta}>ISBN {libro.isbn}</Text>
      </View>
      <View style={comun.tarjeta}>
        <Text style={comun.subtitulo}>Disponibilidad</Text>
        <Text style={comun.cuerpo}>Ejemplares disponibles: {cantidad}</Text>
        <Text style={comun.cuerpo}>Personas en lista de espera: {esperan}</Text>
        {!!lugar && <Text style={comun.etiqueta}>Tu posición en la fila es {lugar}.</Text>}
        {prestado && <Text style={comun.etiqueta}>Ya tenés este libro en préstamo.</Text>}
      </View>
      <Boton texto="Reservar" icono="bookmark-outline" deshabilitado={prestado || lugar > 0}
        accion={() => router.push({ pathname: '/reservar/[isbn]', params: { isbn: libro.isbn } })} />
    </Pagina>
  );
}

const estilos = StyleSheet.create({ ficha: { padding: espacio.xl, alignItems: 'flex-start' } });
