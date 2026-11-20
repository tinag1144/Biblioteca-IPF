export class Pila<T> {
  #items: T[];

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
  }

  get tamanio() {
    return this.#items.length;
  }

  push(item: T) {
    this.#items.push(item);
  }

  pop() {
    return this.#items.pop();
  }

  tope() {
    return this.#items.at(-1);
  }

  aArray() {
    return [...this.#items];
  }
}
