import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { PERSONAL } from '@/constants/personal';
import { LECTOR } from '@/data/esperas';
import {
  crearBiblioteca, entregarLibro, registrarVisita, reservarLibro, type EstadoBiblioteca,
} from '@/lib/biblioteca';
import {
  cancelarRecordatorio, configurarNotificaciones, consultarNotificaciones, notificarEntrega, programarRecordatorio,
} from '@/lib/notificaciones';
import type { Libro } from '@/types';

type Acciones = {
  visitar: (libro: Libro) => void;
  reservar: (libro: Libro) => void;
  entregar: (libro: Libro) => string;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  avisar: (mensaje: string) => void;
  activarRecordatorio: (libro: Libro) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => Promise<void>;
  devolver: (isbn: string) => Promise<void>;
};

const Contexto = createContext<(Acciones & {
  estado: EstadoBiblioteca;
  solicitud: string | null;
  procesando: ReadonlySet<string>;
  setSolicitud: React.Dispatch<React.SetStateAction<string | null>>;
}) | null>(null);

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState(crearBiblioteca);
  const [solicitud, setSolicitud] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<ReadonlySet<string>>(() => new Set());
  const actual = useRef(estado);
  const ocupados = useRef(new Set<string>());

  useEffect(configurarNotificaciones, []);

  const acciones = useMemo<Acciones>(() => {
    function actualizar(siguiente: EstadoBiblioteca) {
      actual.current = siguiente;
      setEstado(siguiente);
    }

    function avisar(mensaje: string) {
      actualizar({ ...actual.current, aviso: mensaje });
    }

    async function cambiarPrestamo(isbn: string, operacion: 'activar' | 'desactivar' | 'devolver', titulo = '') {
      const prestamo = actual.current.prestamos[isbn];
      const enCurso = ocupados.current;
      if (!prestamo || enCurso.has(isbn)) return;
      if (operacion === 'activar' && prestamo.recordatorio) return;
      enCurso.add(isbn);
      setProcesando(new Set(enCurso));

      try {
        let recordatorio = prestamo.recordatorio;
        if (operacion === 'activar') {
          if (!(await consultarNotificaciones()).granted) {
            avisar('Las notificaciones están desactivadas. Consultá el vencimiento en Mis reservas.');
            return;
          }
          recordatorio = await programarRecordatorio(titulo);
        } else if (recordatorio) {
          await cancelarRecordatorio(recordatorio);
          recordatorio = null;
        }

        const prestamos = { ...actual.current.prestamos };
        if (operacion === 'devolver') delete prestamos[isbn];
        else prestamos[isbn] = { ...prestamo, recordatorio };

        actualizar({
          ...actual.current,
          prestamos,
          aviso: operacion === 'devolver' ? 'La devolución quedó registrada.' : actual.current.aviso,
        });
      } catch {
        avisar('No pudimos completar la acción. Volvé a intentarlo.');
      } finally {
        enCurso.delete(isbn);
        setProcesando(new Set(enCurso));
      }
    }

    return {
      avisar,
      visitar: (libro) => actualizar(registrarVisita(actual.current, libro)),
      reservar: (libro) => actualizar(reservarLibro(actual.current, libro)),
      iniciarSesion: (usuario, clave) => {
        if (usuario.trim() !== PERSONAL.usuario || clave !== PERSONAL.clave) return false;
        actualizar({ ...actual.current, sesion: true });
        return true;
      },
      cerrarSesion: () => actualizar({ ...actual.current, sesion: false }),
      entregar: (libro) => {
        const { siguiente, persona } = entregarLibro(actual.current, libro);
        if (!persona) return 'Ya no hay personas esperando este libro.';
        actualizar(siguiente);
        if (persona.id === LECTOR.id) {
          const avisoEntrega = `Ya podés retirar «${libro.titulo}». Tu préstamo quedó registrado.`;
          const mostrarEntrega = () => {
            const vigente = actual.current;
            actualizar({ ...vigente, avisosEntrega: [...vigente.avisosEntrega, avisoEntrega] });
          };
          notificarEntrega(libro.titulo)
            .then((enviada) => { if (!enviada) mostrarEntrega(); })
            .catch(mostrarEntrega);
          return 'Entrega registrada para tu cuenta.';
        }
        return `Entrega registrada para ${persona.nombre}.`;
      },
      activarRecordatorio: (libro) => cambiarPrestamo(libro.isbn, 'activar', libro.titulo),
      desactivarRecordatorio: (isbn) => cambiarPrestamo(isbn, 'desactivar'),
      devolver: (isbn) => cambiarPrestamo(isbn, 'devolver'),
    };
  }, []);

  const value = useMemo(
    () => ({ estado, solicitud, setSolicitud, procesando, ...acciones }),
    [estado, solicitud, procesando, acciones],
  );

  return <Contexto.Provider value={value}>{children}</Contexto.Provider>;
}

export function useBiblioteca() {
  const biblioteca = useContext(Contexto);
  if (!biblioteca) throw new Error('BibliotecaProvider es obligatorio.');
  return biblioteca;
}
