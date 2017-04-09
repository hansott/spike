import { ScannerGeneric } from './Scanner';

export default class ScannerString extends ScannerGeneric<string> {
    line: number = 1;
    column: number = 1;
    constructor(str: string) {
        super(str.split(''));
    }
    next() {
        const char = super.next();
        if (char === "\n") {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }
    back() {
        const char = super.back();
        if (char === "\n") {
            this.line--;
            this.column = 1;
        } else {
            this.column--;
        }
        return char;
    }
    expect(expectedChar: string) {
        const char = this.peek();
        if (expectedChar !== char) {
            throw new Error;
        }
        return this.next();
    }
    until(needle: string) {
        let str = '';
        while (!this.eof()) {
            const char = this.peek();
            if (char === needle) {
                this.next();
                return str;
            }
            str += this.next();
        }
        throw new Error;
    }
    isNumeric(char: string) {
        return /[0-9]/.test(char);
    }
    isWhitespace(char: string) {
        return char === "\n" || char === ' ' || char === "\r";
    }
    eatWhitespace() {
        while (!this.eof()) {
            const char = this.peek();
            if (!this.isWhitespace(char)) {
                break;
            }
            this.next();
        }
    }
}
