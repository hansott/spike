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
    ifStatements: Statement[];
    constructor(condition: Expression, ifStatements: Statement[]) {
        this.condition = condition;
        this.ifStatements = ifStatements;
    }
}

export class IfElseStatement implements Statement {
    condition: Expression;
    ifStatements: Statement[];
    elseStatements: Statement[];
    constructor(condition: Expression, ifStatements: Statement[], elseStatements: Statement[]) {
        this.condition = condition;
        this.ifStatements = ifStatements;
        this.elseStatements = elseStatements;
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
    statements: Statement[];
    params: string[];
    constructor(name: string, params: string[], statements: Statement[]) {
        this.name = name;
        this.params = params;
        this.statements = statements;
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
    if (operator.is(TokenType.Min)) {
        return new Subtraction(left, right);
    }
    if (operator.is(TokenType.Divide)) {
        return new Division(left, right);
    }
    if (operator.is(TokenType.Multiply)) {
        return new Multiplication(left, right);
    }
    if (operator.is(TokenType.Equal)) {
        return new Assignment(left, right);
    }
    throw new Error;
}

abstract class Binary implements Expression {
    left: Expression;
    right: Expression;
    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }
}

export class Addition extends Binary {}
export class Subtraction extends Binary {}
export class Assignment extends Binary {}
export class Multiplication extends Binary {}
export class Division extends Binary {}
