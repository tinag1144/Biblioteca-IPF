import { useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { consultarNotificaciones, pedirNotificaciones } from '@/lib/notificaciones';
import type { EstadoPermiso, Recurso } from '@/types';

type Respuesta = { granted: boolean; canAskAgain: boolean };

function clasificar(respuesta: Respuesta): EstadoPermiso {
  if (respuesta.granted) return 'concedido';
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}

export function usePermiso(recurso: Recurso) {
  const [, pedirCamara, consultarCamara] = useCameraPermissions({ get: false });
  const [estado, setEstado] = useState<EstadoPermiso>('cargando');
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  const consultar = recurso === 'camara' ? consultarCamara : consultarNotificaciones;
  const pedir = recurso === 'camara' ? pedirCamara : pedirNotificaciones;

  useFocusEffect(useCallback(() => {
    let vigente = true;
    let version = 0;
    async function actualizar() {
      const turno = ++version;
      try {
        const respuesta = recurso === 'camara' && Platform.OS === 'web'
          ? { granted: false, canAskAgain: false }
          : await consultar();
        if (vigente && turno === version) {
          setEstado(clasificar(respuesta));
          setError(false);
        }
      } catch {
        if (vigente && turno === version) setError(true);
      }
    }

    void actualizar();
    const escucha = AppState.addEventListener('change', (siguiente) => {
      if (siguiente === 'active') void actualizar();
    });
    return () => {
      vigente = false;
      escucha.remove();
    };
  }, [consultar, intento, recurso]));

  return { estado, error, pedir, reintentar: () => setIntento((anterior) => anterior + 1) };
}
