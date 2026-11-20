export type Libro = {
  isbn: string;        // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number;  // ejemplares en el estante al iniciar la app
};

export type Prestamo = {
  isbn: string;
  vence: string;
  recordatorio: string | null;
};

export type Persona = { id: string; nombre: string };
export type Recurso = 'camara' | 'notificaciones';
export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';
