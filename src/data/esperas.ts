import type { Persona } from '../types';

export const LECTOR: Persona = { id: 'lector', nombre: 'Vos' };

export const ESPERAS_INICIALES: Record<string, readonly Persona[]> = {
  '9780802130303': [{ id: 'julieta', nombre: 'Julieta Núñez' }, { id: 'mateo', nombre: 'Mateo Ríos' }],
  '9780141439556': [{ id: 'alma', nombre: 'Alma Vera' }],
};
