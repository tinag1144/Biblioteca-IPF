import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';

import Boton from '@/components/Boton';
import EstadoVista from '@/components/EstadoVista';
import Pagina from '@/components/Pagina';
import { comun } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { usePermiso } from '@/hooks/usePermiso';
import { buscarPorIsbn } from '@/lib/catalogo';

export default function Permiso() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();
  const camara = recurso === 'camara';
  const notificaciones = recurso === 'notificaciones';
  const { estado, error, pedir, reintentar } = usePermiso(camara ? 'camara' : 'notificaciones');
  const { solicitud, setSolicitud, activarRecordatorio, avisar } = useBiblioteca();
  const libro = buscarPorIsbn(solicitud);
  const [ocupado, setOcupado] = useState(false);
  const [errorAccion, setErrorAccion] = useState<'solicitud' | 'ajustes' | null>(null);
  const [enAjustes, setEnAjustes] = useState(false);
  const vigente = useRef(false);
  const operando = useRef(false);
  const abrirAjustes = Platform.OS !== 'web' &&
    (estado === 'bloqueado' || (notificaciones && errorAccion !== null && estado !== 'concedido'));

  useEffect(() => {
    vigente.current = true;
    return () => {
      vigente.current = false;
      if (notificaciones) setSolicitud(null);
    };
  }, [notificaciones, setSolicitud]);

  function salir() {
    if (router.canGoBack()) router.back();
    else router.replace(camara ? '/escanear' : '/reservas');
  }

  useEffect(() => {
    if (!enAjustes || estado !== 'concedido') return;
    let activo = true;
    async function terminar() {
      if (notificaciones && libro) await activarRecordatorio(libro);
      if (!activo) return;
      if (router.canGoBack()) router.back();
      else router.replace(camara ? '/escanear' : '/reservas');
    }
    void terminar();
    return () => { activo = false; };
  }, [activarRecordatorio, camara, enAjustes, estado, libro, notificaciones]);

  async function continuar() {
    if (operando.current) return;
    operando.current = true;
    setOcupado(true);
    if (!abrirAjustes) setErrorAccion(null);
    try {
      if (abrirAjustes) {
        setEnAjustes(true);
        await Linking.openSettings();
        return;
      }
      const concedido = estado === 'concedido' || (estado === 'preguntable' && (await pedir()).granted);
      if (!vigente.current) return;
      if (notificaciones && libro) {
        if (concedido) await activarRecordatorio(libro);
        else avisar('Podés consultar las fechas y avisos en Mis reservas.');
      }
      if (vigente.current) salir();
    } catch {
      if (vigente.current) {
        setEnAjustes(false);
        setErrorAccion(abrirAjustes ? 'ajustes' : 'solicitud');
      }
    } finally {
      operando.current = false;
      if (vigente.current) setOcupado(false);
    }
  }

  if ((!camara && !notificaciones) || (notificaciones && !libro)) {
    return (
      <Pagina><EstadoVista titulo="Permiso no disponible"
        detalle="Podés solicitar recordatorios desde un préstamo en Mis reservas."
        boton={{ texto: 'Volver', accion: salir }} /></Pagina>
    );
  }

  if (error || estado === 'cargando') {
    return (
      <Pagina>{error
        ? <EstadoVista titulo="No pudimos consultar el permiso." boton={{ texto: 'Reintentar', accion: reintentar }} />
        : <EstadoVista titulo="Consultando el permiso…" cargando />}</Pagina>
    );
  }

  return (
    <Pagina>
      <View style={comun.tarjeta}>
        <Text accessibilityRole="header" style={comun.titulo}>{camara ? 'Cámara' : 'Notificaciones'}</Text>
        <Text style={comun.cuerpo}>{camara
          ? 'Usamos tu cámara para leer el ISBN de un libro y abrir su ficha.'
          : 'Usamos tus notificaciones para recordarte cuándo devolver un libro.'}</Text>
        {errorAccion && <Text accessibilityRole="alert" style={comun.etiqueta}>
          {errorAccion === 'ajustes' ? 'No pudimos abrir Ajustes. Podés intentarlo de nuevo.'
            : notificaciones ? 'El teléfono no abrió el permiso. Podés habilitar las notificaciones desde Ajustes.'
              : 'No pudimos abrir el permiso de cámara. Intentá de nuevo.'}
        </Text>}
        <Boton texto={abrirAjustes ? 'Abrir Ajustes' : 'Continuar'}
          deshabilitado={ocupado} accion={() => { void continuar(); }} />
      </View>
    </Pagina>
  );
}
