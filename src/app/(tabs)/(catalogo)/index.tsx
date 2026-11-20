import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EncabezadoCatalogo from '@/components/EncabezadoCatalogo';
import EstadoVista from '@/components/EstadoVista';
import FilaLibro from '@/components/FilaLibro';
import { comun, espacio } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { useLibros } from '@/hooks/useLibros';
import { disponibles } from '@/lib/biblioteca';

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { estado } = useBiblioteca();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={comun.pagina}>
      <FlatList
        contentContainerStyle={[comun.contenido, estilos.lista]}
        data={libros}
        keyExtractor={(libro) => libro.isbn}
        ListHeaderComponent={EncabezadoCatalogo}
        ListEmptyComponent={cargando
          ? <EstadoVista titulo="Cargando el catálogo…" cargando />
          : error
            ? <EstadoVista titulo={error} icono="cloud-offline-outline" boton={{ texto: 'Reintentar', accion: reintentar }} />
            : <EstadoVista titulo="Todavía no hay libros en el catálogo." />}
        renderItem={({ item }) => {
          const cantidad = disponibles(estado, item);
          const espera = Boolean(estado.esperas[item.isbn]?.tamanio);
          return <FilaLibro libro={item} nota={cantidad > 0 && !espera ? `Disponibles · ${cantidad}` : 'Lista de espera'} />;
        }}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({ lista: { gap: espacio.s } });
