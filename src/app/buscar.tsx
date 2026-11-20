import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, TextInput } from 'react-native';

import EstadoVista from '@/components/EstadoVista';
import FilaLibro from '@/components/FilaLibro';
import { color, comun } from '@/constants/tema';
import { useBusqueda } from '@/hooks/useBusqueda';

export default function Buscar() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const consulta = typeof q === 'string' ? q : '';
  const { libros, cargando, error, reintentar } = useBusqueda(consulta);
  return (
    <FlatList
      style={comun.pagina}
      contentContainerStyle={comun.contenido}
      keyboardShouldPersistTaps="handled"
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      ListHeaderComponent={
        <TextInput
          accessibilityLabel="Buscar por título o autor"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Título o autor"
          placeholderTextColor={color.tenue}
          returnKeyType="search"
          value={consulta}
          onChangeText={(texto) => router.setParams({ q: texto })}
          style={comun.input}
        />
      }
      ListEmptyComponent={cargando
        ? <EstadoVista titulo="Buscando libros…" cargando />
        : error
          ? <EstadoVista titulo="No pudimos buscar." boton={{ texto: 'Reintentar', accion: reintentar }} />
          : consulta.trim()
            ? <EstadoVista titulo="No encontramos coincidencias." detalle="Probá con otro título o autor." icono="search-outline" />
            : <EstadoVista titulo="Buscá un libro" detalle="Escribí un título o el nombre de su autor." icono="search-outline" />}
      renderItem={({ item }) => <FilaLibro libro={item} />}
    />
  );
}
