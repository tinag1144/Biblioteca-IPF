import { useEffect, useState } from 'react';

import { buscarLibros } from '@/lib/api';
import type { Libro } from '@/types';

type Resultado = { q: string; intento: number; libros: Libro[] | null };

export function useBusqueda(q: string) {
  const [resultado, setResultado] = useState<Resultado>();
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!q.trim()) return;
    let vigente = true;
    buscarLibros(q)
      .then((libros) => {
        if (vigente) setResultado({ q, intento, libros });
      })
      .catch(() => {
        if (vigente) setResultado({ q, intento, libros: null });
      });
    return () => { vigente = false; };
  }, [q, intento]);

  const actual = resultado?.q === q && resultado.intento === intento ? resultado : undefined;
  return {
    libros: q.trim() ? actual?.libros ?? [] : [],
    cargando: Boolean(q.trim()) && !actual,
    error: actual?.libros === null,
    reintentar: () => setIntento((anterior) => anterior + 1),
  };
}
