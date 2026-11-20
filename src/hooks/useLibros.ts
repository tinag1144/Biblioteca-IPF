import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '@/lib/api';
import type { Libro } from '@/types';

type Carga = { libros: Libro[]; cargando: boolean; error: string | null };
const INICIO: Carga = { libros: [], cargando: true, error: null };

export function useLibros() {
  const [carga, setCarga] = useState(INICIO);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    obtenerLibros()
      .then((libros) => {
        if (vigente) setCarga({ libros, cargando: false, error: null });
      })
      .catch(() => {
        if (vigente) setCarga({ libros: [], cargando: false, error: 'No pudimos cargar el catálogo.' });
      });
    return () => { vigente = false; };
  }, [intento]);

  const reintentar = useCallback(() => {
    setCarga(INICIO);
    setIntento((anterior) => anterior + 1);
  }, []);

  return { ...carga, reintentar };
}
