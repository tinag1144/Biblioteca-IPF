export class Cola<T> {
  #items: T[];
  #frente = 0;

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
  }

  get tamanio() {
    return this.#items.length - this.#frente;
  }

  frente() {
    return this.#items[this.#frente];
  }

  encolar(item: T) {
    this.#items.push(item);
  }

  desencolar() {
    if (this.tamanio === 0) return undefined;
    const item = this.#items[this.#frente];
    this.#frente++;
    if (this.#frente * 2 >= this.#items.length) {
      this.#items = this.aArray();
      this.#frente = 0;
    }
    return item;
  }

  aArray() {
    return this.#items.slice(this.#frente);
  }
}
