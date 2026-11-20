import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import Boton from '@/components/Boton';
import EstadoVista from '@/components/EstadoVista';
import { comun, espacio } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { LIBROS } from '@/data/libros';

export default function Mostrador() {
  const { estado, entregar, cerrarSesion } = useBiblioteca();
  const [aviso, setAviso] = useState('');
  const libros = LIBROS.filter(({ isbn }) => estado.esperas[isbn]?.tamanio);

  return (
    <FlatList
      style={comun.pagina}
      contentContainerStyle={comun.contenido}
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      ListHeaderComponent={
        <View style={estilos.cabecera}>
          <Text accessibilityRole="header" style={comun.titulo}>Listas de espera</Text>
          <Boton texto="Cerrar sesión" variante="suave" icono="log-out-outline" accion={cerrarSesion} />
          {!!aviso && <Text accessibilityRole="alert" style={comun.etiqueta}>{aviso}</Text>}
        </View>
      }
      ListEmptyComponent={<EstadoVista titulo="No hay listas pendientes." detalle="Las próximas reservas en espera van a aparecer acá." />}
      renderItem={({ item }) => {
        const cola = estado.esperas[item.isbn];
        return (
          <View style={comun.tarjeta}>
            <Text style={comun.subtitulo}>{item.titulo}</Text>
            <Text style={comun.cuerpo}>Al frente: {cola.frente()?.nombre ?? 'Nadie'}</Text>
            <Text style={comun.cuerpo}>Personas en espera: {cola.tamanio}</Text>
            <Boton texto="Entregar al siguiente" icono="checkmark-outline"
              deshabilitado={!cola.tamanio} accion={() => setAviso(entregar(item))} />
          </View>
        );
      }}
    />
  );
}

const estilos = StyleSheet.create({ cabecera: { gap: espacio.m } });
