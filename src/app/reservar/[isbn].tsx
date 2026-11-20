import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import Boton from '@/components/Boton';
import EstadoVista from '@/components/EstadoVista';
import Pagina from '@/components/Pagina';
import { comun } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { disponibles, posicion } from '@/lib/biblioteca';
import { buscarPorIsbn } from '@/lib/catalogo';

export default function ConfirmarReserva() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const libro = buscarPorIsbn(isbn);
  const { estado, reservar } = useBiblioteca();

  if (!libro) {
    return (
      <Pagina><EstadoVista titulo="Este libro no está en el catálogo."
        boton={{ texto: 'Volver al Catálogo', accion: () => router.dismissTo('/') }} /></Pagina>
    );
  }

  const espera = estado.esperas[libro.isbn]?.tamanio ?? 0;
  const prestamo = disponibles(estado, libro) > 0 && espera === 0;
  const duplicada = Boolean(estado.prestamos[libro.isbn]) || posicion(estado, libro.isbn) > 0;

  return (
    <Pagina>
      <Text accessibilityRole="header" style={comun.titulo}>{libro.titulo}</Text>
      <View style={comun.tarjeta}>
        <Text style={comun.subtitulo}>{duplicada ? 'Ya reservaste este libro' : prestamo ? 'Préstamo por 7 días' : 'Lista de espera'}</Text>
        <Text style={comun.cuerpo}>
          {duplicada
            ? 'Podés consultar el estado en Mis reservas.'
            : prestamo
              ? 'La fecha de devolución y el recordatorio estarán en Mis reservas.'
              : `Si confirmás, vas a ocupar la posición ${espera + 1} de la lista.`}
        </Text>
      </View>
      <Boton texto={duplicada ? 'Ver mis reservas' : 'Confirmar'} accion={() => {
        if (!duplicada) reservar(libro);
        router.dismissTo('/reservas');
      }} />
    </Pagina>
  );
}
