export interface Scanner<T> {
    peek(): T;
    current(): T;
    next(): T;
    back(): T;
    eof(): boolean;
}

export abstract class ScannerGeneric<T> implements Scanner<T> {
    private position: number = -1;
    private items: Array<T>;
    constructor(items: Array<T>) {
        this.items = items;
    }
    peek() {
        const item = this.items[this.position + 1];
        if (!item) {
            throw new Error;
        }
        return item;
    }
    current() {
        const item = this.items[this.position];
        if (!item) {
            throw new Error;
        }
        return item;
    }
    next() {
        if (this.eof()) {
            throw new Error;
        }
        this.position++;
        return this.items[this.position];
    }
    back(): T {
        const item = this.items[this.position - 1];
        if (!item) {
            throw new Error;
        }
        this.position--;
        return item;
    }
    eof() {
        return !this.items[this.position + 1];
    }
}
