import { router, usePathname } from 'expo-router';

import EstadoVista from '@/components/EstadoVista';
import Pagina from '@/components/Pagina';

export default function NoEncontrada() {
  const url = usePathname();
  return (
    <Pagina>
      <EstadoVista
        titulo="404 · Página no encontrada"
        detalle={`La dirección «${url}» no existe en Biblioteca IPF.`}
        icono="compass-outline"
        boton={{ texto: 'Volver al Catálogo', accion: () => router.dismissTo('/') }}
      />
    </Pagina>
  );
}
