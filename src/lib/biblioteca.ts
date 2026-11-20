import { ESPERAS_INICIALES, LECTOR } from '@/data/esperas';
import { Cola } from '@/estructuras/Cola';
import { Pila } from '@/estructuras/Pila';
import type { Libro, Persona, Prestamo } from '@/types';

export type EstadoBiblioteca = {
  prestamos: Record<string, Prestamo>;
  esperas: Record<string, Cola<Persona>>;
  recientes: Pila<Libro>;
  ajustesStock: Record<string, number>;
  sesion: boolean;
  aviso: string | null;
  avisosEntrega: string[];
};

export function crearBiblioteca(): EstadoBiblioteca {
  return {
    prestamos: {},
    esperas: Object.fromEntries(
      Object.entries(ESPERAS_INICIALES).map(([isbn, personas]) => [isbn, new Cola(personas)]),
    ),
    recientes: new Pila(),
    ajustesStock: {},
    sesion: false,
    aviso: null,
    avisosEntrega: [],
  };
}

export function disponibles(estado: EstadoBiblioteca, libro: Libro) {
  return libro.ejemplares + (estado.ajustesStock[libro.isbn] ?? 0) - Number(Boolean(estado.prestamos[libro.isbn]));
}

export function posicion(estado: EstadoBiblioteca, isbn: string) {
  return (estado.esperas[isbn]?.aArray().findIndex(({ id }) => id === LECTOR.id) ?? -1) + 1;
}

export function crearPrestamo(isbn: string): Prestamo {
  const vence = new Date();
  vence.setDate(vence.getDate() + 7);
  return { isbn, vence: vence.toISOString(), recordatorio: null };
}

export function registrarVisita(estado: EstadoBiblioteca, libro: Libro): EstadoBiblioteca {
  if (estado.recientes.tope()?.isbn === libro.isbn) return estado;
  const recientes = new Pila(estado.recientes.aArray().filter(({ isbn }) => isbn !== libro.isbn));
  recientes.push(libro);
  return { ...estado, recientes };
}

export function reservarLibro(estado: EstadoBiblioteca, libro: Libro): EstadoBiblioteca {
  const { isbn } = libro;
  if (estado.prestamos[isbn] || posicion(estado, isbn)) return estado;
  if (disponibles(estado, libro) > 0 && !estado.esperas[isbn]?.tamanio) {
    return { ...estado, prestamos: { ...estado.prestamos, [isbn]: crearPrestamo(isbn) } };
  }
  const cola = new Cola(estado.esperas[isbn]?.aArray());
  cola.encolar(LECTOR);
  return { ...estado, esperas: { ...estado.esperas, [isbn]: cola } };
}

export function entregarLibro(estado: EstadoBiblioteca, libro: Libro) {
  const { isbn } = libro;
  const cola = new Cola(estado.esperas[isbn]?.aArray());
  const persona = cola.desencolar();
  if (!estado.sesion || !persona) return { siguiente: estado, persona: undefined };

  const siguiente = { ...estado, esperas: { ...estado.esperas, [isbn]: cola } };
  const hayEjemplar = disponibles(estado, libro) > 0;
  const esLector = persona.id === LECTOR.id;
  if (esLector) siguiente.prestamos = { ...estado.prestamos, [isbn]: crearPrestamo(isbn) };
  const ajuste = Number(esLector && !hayEjemplar) - Number(!esLector && hayEjemplar);
  if (ajuste) {
    siguiente.ajustesStock = {
      ...estado.ajustesStock,
      [isbn]: (estado.ajustesStock[isbn] ?? 0) + ajuste,
    };
  }
  return { siguiente, persona };
}
