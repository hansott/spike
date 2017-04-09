import { ScannerGeneric } from './Scanner';
import { Token, TokenType } from './Lexer';

export default class ScannerToken extends ScannerGeneric<Token> {
    expect(type: TokenType) {
        const token = this.peek();
        if (type !== token.type) {
            throw new Error(`Expected ${TokenType[type]} but instead found ${TokenType[token.type]} with value ${token.value}`);
        }
        return this.next();
    }
}
