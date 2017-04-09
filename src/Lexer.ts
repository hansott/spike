import ScannerString from './ScannerString';

export enum TokenType {
    String,
    Number,
    Identifier,
    Function,
    Return,
    Var,
    If,
    Else,
    Plus,
    Min,
    Multiply,
    Divide,
    Equal,
    Comma,
    SemiColon,
    CurlyBracketOpen,
    CurlyBracketClose,
    ParenOpen,
    ParenClose,
}

export class Token {
    type: TokenType;
    value: string;
    constructor(type: TokenType, value: string) {
        this.type = type;
        this.value = value;
    }
    is(type: TokenType) {
        return this.type === type;
    }
    getPrecedence() {
        if (this.is(TokenType.Multiply) || this.is(TokenType.Divide)) {
            return 3;
        }
        if (this.is(TokenType.Plus) || this.is(TokenType.Min)) {
            return 2;
        }
        if (this.is(TokenType.Equal)) {
            return 1;
        }
        return 0;
    }
    isOperator() {
        return (
            this.is(TokenType.Plus) ||
            this.is(TokenType.Min) ||
            this.is(TokenType.Multiply) ||
            this.is(TokenType.Divide) ||
            this.is(TokenType.Equal)
        );
    }
}

export class Lexer {
    private lexString(scanner: ScannerString) {
        scanner.expect('"');
        const value = scanner.until('"');
        return new Token(TokenType.String, value);
    }
    private lexCurlyBracketOpen(scanner: ScannerString) {
        const curlyBracketOpen = scanner.expect('{');
        return new Token(TokenType.CurlyBracketOpen, curlyBracketOpen);
    }
    private lexCurlyBracketClose(scanner: ScannerString) {
        const curlyBracketClose = scanner.expect('}');
        return new Token(TokenType.CurlyBracketClose, curlyBracketClose);
    }
    private lexParenOpen(scanner: ScannerString) {
        const parenOpen = scanner.expect('(');
        return new Token(TokenType.ParenOpen, parenOpen);
    }
    private lexParenClose(scanner: ScannerString) {
        const parenClose = scanner.expect(')');
        return new Token(TokenType.ParenClose, parenClose);
    }
    private lexComma(scanner: ScannerString) {
        const comma = scanner.expect(',');
        return new Token(TokenType.Comma, comma);
    }
    private lexPlus(scanner: ScannerString) {
        const plus = scanner.expect('+');
        return new Token(TokenType.Plus, plus);
    }
    private lexMin(scanner: ScannerString) {
        const min = scanner.expect('-');
        return new Token(TokenType.Min, min);
    }
    private lexMultiply(scanner: ScannerString) {
        const multiply = scanner.expect('*');
        return new Token(TokenType.Multiply, multiply);
    }
    private lexDivide(scanner: ScannerString) {
        const divide = scanner.expect('/');
        return new Token(TokenType.Divide, divide);
    }
    private lexSemiColon(scanner: ScannerString) {
        const semiColon = scanner.expect(';');
        return new Token(TokenType.SemiColon, semiColon);
    }
    private lexEqual(scanner: ScannerString) {
        const semiColon = scanner.expect('=');
        return new Token(TokenType.Equal, semiColon);
    }
    private checkIfKeyword(identifier: string) {
        let tokenType = TokenType.Identifier;
        if (identifier === 'fn') {
            tokenType = TokenType.Function;
        } else if (identifier === 'return') {
            tokenType = TokenType.Return;
        } else if (identifier === 'var') {
            tokenType = TokenType.Var;
        } else if (identifier === 'if') {
            tokenType = TokenType.If;
        } else if (identifier === 'else') {
            tokenType = TokenType.Else;
        }
        return new Token(tokenType, identifier);
    }
    private isFirstOfIdentifier(first: string) {
        return /[a-zA-Z_]/.test(first);
    }
    private lexIdentifier(scanner: ScannerString) {
        let identifier = '';
        const first = scanner.peek();
        if (!this.isFirstOfIdentifier(first)) {
            throw new Error;
        }
        identifier += scanner.next();
        while (!scanner.eof()) {
            const char = scanner.peek();
            const isAlphaNumeric = /[a-zA-Z0-9_]/.test(char);
            if (!isAlphaNumeric) {
                break;
            }
            identifier += scanner.next();
        }
        return this.checkIfKeyword(identifier);
    }
    private lexNumber(scanner: ScannerString) {
        let number = '';
        while (!scanner.eof()) {
            const char = scanner.peek();
            if (!scanner.isNumeric(char)) {
                break;
            }
            number += scanner.next();
        }
        return new Token(TokenType.Number, number);
    }
    lex(code: string): Array<Token> {
        let tokens: Array<Token> = [];
        const scanner = new ScannerString(code);
        while (!scanner.eof()) {
            const char = scanner.peek();
            if (char === '{') {
                tokens.push(this.lexCurlyBracketOpen(scanner));
                continue;
            }
            if (char === '}') {
                tokens.push(this.lexCurlyBracketClose(scanner));
                continue;
            }
            if (char === '(') {
                tokens.push(this.lexParenOpen(scanner));
                continue;
            }
            if (char === ')') {
                tokens.push(this.lexParenClose(scanner));
                continue;
            }
            if (char === ',') {
                tokens.push(this.lexComma(scanner));
                continue;
            }
            if (char === ';') {
                tokens.push(this.lexSemiColon(scanner));
                continue;
            }
            if (char === '+') {
                tokens.push(this.lexPlus(scanner));
                continue;
            }
            if (char === '-') {
                tokens.push(this.lexMin(scanner));
                continue;
            }
            if (char === '*') {
                tokens.push(this.lexMultiply(scanner));
                continue;
            }
            if (char === '/') {
                tokens.push(this.lexDivide(scanner));
                continue;
            }
            if (char === '=') {
                tokens.push(this.lexEqual(scanner));
                continue;
            }
            if (char === '"') {
                tokens.push(this.lexString(scanner));
                continue;
            }
            if (this.isFirstOfIdentifier(char)) {
                tokens.push(this.lexIdentifier(scanner));
                continue;
            }
            if (scanner.isNumeric(char)) {
                tokens.push(this.lexNumber(scanner));
                continue;
            }
            if (scanner.isWhitespace(char)) {
                scanner.eatWhitespace();
                continue;
            }
            throw new Error(`Unexpected token ${char} at ${scanner.line}:${scanner.column}`);
        }
        return tokens;
    }
}

export default Lexer;
