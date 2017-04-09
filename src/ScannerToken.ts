import { ScannerGeneric } from './Scanner';
import { Token, TokenType } from './Token';

export default class ScannerToken extends ScannerGeneric<Token> {
    expect(type: TokenType) {
        const token = this.peek();
        if (!token.is(type)) {
            const line = token.getLine();
            const column = token.getColumn();
            throw new Error(
                `Expected ${TokenType[type]} but instead found ${TokenType[token.getType()]} with value ${token.getValue()} at ${line}:${column}`
            );
        }
        return this.next();
    }
    expectOneOrMore(type: TokenType) {
        this.expect(type);
        while (!this.eof()) {
            const token = this.peek();
            if (!token.is(type)) {
                break;
            }
            this.next();
        }
    }
}
