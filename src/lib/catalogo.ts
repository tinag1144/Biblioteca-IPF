import { LIBROS } from '../data/libros';

const porIsbn = new Map(LIBROS.map((libro) => [libro.isbn, libro]));

export function buscarPorIsbn(isbn: unknown) {
  if (typeof isbn !== 'string' || !/^\d{13}$/.test(isbn)) return undefined;
  return porIsbn.get(isbn);
}
