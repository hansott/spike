import { Token, TokenType } from './Token';

function javaScriptFunctionName(name: string) {
    return '__' + name;
}

export interface Statement {
    toJavaScript(): string[];
}

export interface Expression {
    toJavaScript(): string;
}

export class Program implements Statement {
    statements: Statement[];
    constructor(statements: Statement[]) {
        this.statements = statements;
    }
    toJavaScript(): string[] {
        let lines: string[] = [];
        this.statements.forEach(statement => {
            lines = lines.concat(statement.toJavaScript());
        });
        return lines;
    }
}

export class IfStatement implements Statement {
    condition: Expression;
    ifStatements: Statement[];
    constructor(condition: Expression, ifStatements: Statement[]) {
        this.condition = condition;
        this.ifStatements = ifStatements;
    }
    toJavaScript(): string[] {
        let lines = [`if (${this.condition.toJavaScript()}) {`];
        this.ifStatements.forEach(statement => {
            lines = lines.concat(statement.toJavaScript().map(statement => '    ' + statement));
        });
        lines.push('}');
        return lines;
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
    toJavaScript(): string[] {
        let lines = [`if (${this.condition.toJavaScript()}) {`];
        this.ifStatements.forEach(statement => {
            lines = lines.concat(statement.toJavaScript().map(statement => '    ' + statement));
        });
        lines.push('} else {');
        this.elseStatements.forEach(statement => {
            lines = lines.concat(statement.toJavaScript().map(statement => '    ' + statement));
        });
        lines.push('}');
        return lines;
    }
}

export class ReturnStatement implements Statement {
    expression: Expression;
    constructor(expression: Expression) {
        this.expression = expression;
    }
    toJavaScript(): string[] {
        return [
            `return ${this.expression.toJavaScript()}`,
        ];
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
    toJavaScript(): string[] {
        const params = this.params.join(', ');
        let lines = [`function ${javaScriptFunctionName(this.name)}(${params}) {`];
        this.statements.forEach(statement => {
            lines = lines.concat(statement.toJavaScript().map(statement => '    ' + statement));
        });
        lines.push('}');
        return lines;
    }
}

export class VariableDeclaration implements Statement {
    private name: string;
    private init: Expression;
    constructor(name: string, init: Expression) {
        this.name = name;
        this.init = init;
    }
    toJavaScript(): string[] {
        return [
            `let ${this.name} = ${this.init.toJavaScript()}`,
        ];
    }
}

export class ExpressionStatement implements Statement {
    expression: Expression;
    constructor(expression: Expression) {
        this.expression = expression;
    }
    toJavaScript(): string[] {
        return [
            `${this.expression.toJavaScript()}`,
        ];
    }
}

export class Variable implements Expression {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    toJavaScript(): string {
        return this.name;
    }
}

export class FunctionCall implements Expression {
    name: string;
    params: Expression[];
    constructor(name: string, params: Expression[]) {
        this.name = name;
        this.params = params;
    }
    toJavaScript(): string {
        const params = this.params.map(param => param.toJavaScript()).join(', ');
        let name = this.name;
        if (name === 'print') {
            name = 'console.log';
        } else {
            name = javaScriptFunctionName(name);
        }
        return `${name}(${params})`;
    }
}

export class NumberLiteral implements Expression {
    value: string;
    constructor(value: string) {
        this.value = value;
    }
    toJavaScript(): string {
        return this.value.toString();
    }
}

export class StringLiteral implements Expression {
    value: string;
    constructor(value: string) {
        this.value = value;
    }
    toJavaScript(): string {
        return `"${this.value}"`;
    }
}

abstract class Binary implements Expression {
    left: Expression;
    right: Expression;
    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }
    toJavaScript(): string {
        throw new Error;
    }
}

export class Addition extends Binary {
    toJavaScript(): string {
        return `${this.left.toJavaScript()} + ${this.right.toJavaScript()}`;
    }
}

export class Subtraction extends Binary {
    toJavaScript(): string {
        return `${this.left.toJavaScript()} - ${this.right.toJavaScript()}`;
    }
}

export class Multiplication extends Binary {
    toJavaScript(): string {
        return `${this.left.toJavaScript()} * ${this.right.toJavaScript()}`;
    }
}

export class Division extends Binary {
    toJavaScript(): string {
        return `${this.left.toJavaScript()} / ${this.right.toJavaScript()}`;
    }
}

export class Assignment extends Binary {
    toJavaScript(): string {
        return `${this.left.toJavaScript()} = ${this.right.toJavaScript()}`;
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
