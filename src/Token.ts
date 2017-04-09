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
    private type: TokenType;
    private value: string;
    private line: number;
    private column: number;
    constructor(type: TokenType, value: string, line: number, column: number) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
    getType() {
        return this.type;
    }
    getValue() {
        return this.value;
    }
    getLine() {
        return this.line;
    }
    getColumn() {
        return this.column;
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
