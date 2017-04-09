import { Token, TokenType } from './Lexer';

export interface Statement {}
export interface Expression {}

export class Program implements Statement {
    statements: Statement[];
    constructor(statements: Statement[]) {
        this.statements = statements;
    }
}

export class IfStatement implements Statement {
    condition: Expression;
    ifBlock: BlockStatement;
    constructor(condition: Expression, ifBlock: BlockStatement) {
        this.condition = condition;
        this.ifBlock = ifBlock;
    }
}

export class IfElseStatement implements Statement {
    condition: Expression;
    ifBlock: BlockStatement;
    elseBlock: BlockStatement;
    constructor(condition: Expression, ifBlock: BlockStatement, elseBlock: BlockStatement) {
        this.condition = condition;
        this.ifBlock = ifBlock;
        this.elseBlock = elseBlock;
    }
}

export class ReturnStatement implements Statement {
    expression: Expression;
    constructor(expression: Expression) {
        this.expression = expression;
    }
}

export class BlockStatement implements Statement {
    statements: Statement[];
    constructor(statements: Statement[]) {
        this.statements = statements;
    }
}

export class FunctionDeclaration implements Statement {
    name: string;
    block: BlockStatement;
    params: string[];
    constructor(name: string, params: string[], block: BlockStatement) {
        this.name = name;
        this.params = params;
        this.block = block;
    }
}

export class VariableDeclaration implements Statement {
    private name: string;
    private init: Expression;
    constructor(name: string, init: Expression) {
        this.name = name;
        this.init = init;
    }
}

export class ExpressionStatement implements Statement {
    expression: Expression;
    constructor(expression: Expression) {
        this.expression = expression;
    }
}

export class Variable implements Expression {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

export class FunctionCall implements Expression {
    name: string;
    params: Expression[];
    constructor(name: string, params: Expression[]) {
        this.name = name;
        this.params = params;
    }
}

export class NumberLiteral implements Expression {
    value: string;
    constructor(value: string) {
        this.value = value;
    }
}

export class StringLiteral implements Expression {
    value: string;
    constructor(value: string) {
        this.value = value;
    }
}

export function createBinary(left: Expression, operator: Token, right: Expression) {
    if (operator.is(TokenType.Plus)) {
        return new Addition(left, right);
    }
    if (operator.is(TokenType.Divide)) {
        return new Division(left, right);
    }
    if (operator.is(TokenType.Equal)) {
        return new Assignment(left, right);
    }
    throw new Error;
}

export class Assignment implements Expression {
    left: Expression;
    right: Expression;
    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }
}

export class Addition implements Expression {
    left: Expression;
    right: Expression;
    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }
}

export class Division implements Expression {
    left: Expression;
    right: Expression;
    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }
}
