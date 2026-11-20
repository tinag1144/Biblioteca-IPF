import { router } from 'expo-router';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';

import Boton from '@/components/Boton';
import EstadoVista from '@/components/EstadoVista';
import TarjetaPrestamo from '@/components/TarjetaPrestamo';
import { comun, espacio } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { LIBROS } from '@/data/libros';
import { usePermiso } from '@/hooks/usePermiso';
import { posicion } from '@/lib/biblioteca';
import type { Libro } from '@/types';

export default function MisReservas() {
  const {
    estado, setSolicitud, procesando, activarRecordatorio, desactivarRecordatorio, devolver, avisar,
  } = useBiblioteca();
  const permiso = usePermiso('notificaciones');
  const prestamos = LIBROS.filter(({ isbn }) => estado.prestamos[isbn]);
  const esperas = LIBROS.filter(({ isbn }) => posicion(estado, isbn) > 0);

  function recordar(libro: Libro, activo: boolean) {
    if (!activo) {
      void desactivarRecordatorio(libro.isbn);
      return;
    }
    if (permiso.estado === 'concedido') {
      void activarRecordatorio(libro);
      return;
    }
    if (Platform.OS === 'web') {
      avisar('Consultá los vencimientos en Mis reservas. Los recordatorios están disponibles en el teléfono.');
      return;
    }
    setSolicitud(libro.isbn);
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones' } });
  }

  return (
    <FlatList
      style={comun.pagina}
      contentContainerStyle={comun.contenido}
      data={prestamos}
      keyExtractor={(libro) => libro.isbn}
      ListHeaderComponent={
        <View style={estilos.seccion}>
          <Text accessibilityRole="header" style={comun.titulo}>Mis reservas</Text>
          <View style={comun.tarjeta}>
            <Text style={comun.etiqueta}>Recordatorios</Text>
            {permiso.error
              ? <Boton texto="Volver a consultar el permiso" variante="suave" accion={permiso.reintentar} />
              : <Text style={comun.cuerpo}>
                  {permiso.estado === 'concedido' ? 'Notificaciones habilitadas.'
                    : permiso.estado === 'cargando' ? 'Consultando notificaciones…'
                      : 'Notificaciones desactivadas. Podés consultar los avisos acá.'}
                </Text>}
          </View>
          {estado.aviso && <View style={comun.tarjeta}><Text accessibilityRole="alert" style={comun.cuerpo}>{estado.aviso}</Text></View>}
          {estado.avisosEntrega.length > 0 && <View style={comun.tarjeta}>
            <Text style={comun.etiqueta}>Avisos de entrega</Text>
            <Text accessibilityLiveRegion="polite" style={comun.cuerpo}>{estado.avisosEntrega.join('\n')}</Text>
          </View>}
          <Text accessibilityRole="header" style={comun.seccion}>Préstamos</Text>
        </View>
      }
      ListEmptyComponent={<EstadoVista titulo="No tenés préstamos activos." />}
      ListFooterComponent={
        <View style={estilos.seccion}>
          <Text accessibilityRole="header" style={comun.seccion}>En lista de espera</Text>
          <FlatList
            horizontal
            data={esperas}
            keyExtractor={(libro) => libro.isbn}
            contentContainerStyle={estilos.esperas}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={<EstadoVista titulo="No estás en ninguna lista." />}
            renderItem={({ item }) => (
              <View style={comun.tarjeta}>
                <Text style={comun.subtitulo}>{item.titulo}</Text>
                <Text style={comun.etiqueta}>Posición {posicion(estado, item.isbn)}</Text>
              </View>
            )}
          />
        </View>
      }
      renderItem={({ item }) => <TarjetaPrestamo libro={item} prestamo={estado.prestamos[item.isbn]} procesando={procesando.has(item.isbn)}
        cambiarRecordatorio={(activo) => recordar(item, activo)} devolver={() => { void devolver(item.isbn); }} />}
    />
  );
}

const estilos = StyleSheet.create({ seccion: { gap: espacio.l }, esperas: { gap: espacio.m, flexGrow: 1 } });
