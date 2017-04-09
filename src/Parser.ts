import {
    Program, Statement, ExpressionStatement, FunctionDeclaration, ReturnStatement, Expression,
    Variable, FunctionCall, StringLiteral, NumberLiteral, createBinary, VariableDeclaration, IfStatement,
    IfElseStatement
} from './Ast';
import ScannerToken from './ScannerToken';
import Lexer, { TokenType } from './Lexer';

class Parser {
    lexer: Lexer;
    constructor(lexer: Lexer) {
        this.lexer = lexer;
    }
    parseFunctionCall(scanner: ScannerToken) {
        const identifier = scanner.expect(TokenType.Identifier);
        scanner.expect(TokenType.ParenOpen);
        const token = scanner.peek();
        if (token.is(TokenType.ParenClose)) {
            scanner.next();
            return new FunctionCall(identifier.getValue(), []);
        }
        const params = [];
        do {
            params.push(this.parseExpression(scanner));
            const token = scanner.peek();
            if (token.is(TokenType.ParenClose)) {
                scanner.next();
                return new FunctionCall(identifier.getValue(), params);
            }
            scanner.expect(TokenType.Comma);
        } while (!scanner.eof());
        throw new Error;
    }
    parseIdentifier(scanner: ScannerToken) {
        const identifier = scanner.expect(TokenType.Identifier);
        const token = scanner.peek();
        if (token.is(TokenType.ParenOpen)) {
            scanner.back();
            return this.parseFunctionCall(scanner);
        }
        return new Variable(identifier.getValue());
    }
    maybeBinary(scanner: ScannerToken, left: Expression, precedence: number = 0): Expression {
        const token = scanner.peek();
        if (token.isOperator()) {
            const nextPrecedence = token.getPrecedence();
            if (nextPrecedence > precedence) {
                scanner.next();
                const right = this.maybeBinary(scanner, this.parseAtom(scanner), nextPrecedence);
                const binary = createBinary(left, token, right);
                return this.maybeBinary(scanner, binary, precedence);
            }
        }
        return left;
    }
    parseNumber(scanner: ScannerToken) {
        const number = scanner.expect(TokenType.Number);
        return new NumberLiteral(number.getValue());
    }
    parseString(scanner: ScannerToken) {
        const string = scanner.expect(TokenType.String);
        return new StringLiteral(string.getValue());
    }
    parseParen(scanner: ScannerToken) {
        scanner.expect(TokenType.ParenOpen);
        const expression = this.parseExpression(scanner);
        scanner.expect(TokenType.ParenClose);
        return expression;
    }
    parseAtom(scanner: ScannerToken) {
        const token = scanner.peek();
        switch (token.getType()) {
            case TokenType.Identifier:
                return this.parseIdentifier(scanner);
            case TokenType.String:
                return this.parseString(scanner);
            case TokenType.Number:
                return this.parseNumber(scanner);
            case TokenType.ParenOpen:
                return this.parseParen(scanner);
        }
        throw new Error(`Unexpected token ${TokenType[token.getType()]} with value "${token.getValue()}" at ${token.getLine()}:${token.getColumn()}`);
    }
    parseExpression(scanner: ScannerToken): Expression {
        return this.maybeBinary(scanner, this.parseAtom(scanner));
    }
    parseReturnStatement(scanner: ScannerToken) {
        scanner.expect(TokenType.Return);
        const expression = this.parseExpression(scanner);
        scanner.expectOneOrMore(TokenType.SemiColon);
        return new ReturnStatement(expression);
    }
    parseBlockStatement(scanner: ScannerToken) {
        scanner.expect(TokenType.CurlyBracketOpen);
        const token = scanner.peek();
        if (token.is(TokenType.CurlyBracketClose)) {
            return [];
        }
        const statements = [];
        do {
            statements.push(this.parseStatement(scanner));
            const token = scanner.peek();
            if (token.is(TokenType.CurlyBracketClose)) {
                scanner.next();
                return statements;
            }
        } while (!scanner.eof());
        throw new Error;
    }
    parseFunctionDeclarationParams(scanner: ScannerToken) {
        scanner.expect(TokenType.ParenOpen);
        const token = scanner.peek();
        if (token.is(TokenType.ParenClose)) {
            scanner.next();
            return [];
        }
        const params = [];
        do {
            let token = scanner.peek();
            const identifier = scanner.expect(TokenType.Identifier);
            params.push(identifier.getValue());
            token = scanner.peek();
            if (token.is(TokenType.ParenClose)) {
                scanner.next();
                return params;
            }
            scanner.next();
        } while (!scanner.eof());
        throw new Error;
    }
    parseFunctionDeclaration(scanner: ScannerToken) {
        scanner.expect(TokenType.Function);
        const identifier = scanner.expect(TokenType.Identifier);
        const params = this.parseFunctionDeclarationParams(scanner);
        const statements = this.parseBlockStatement(scanner);
        return new FunctionDeclaration(identifier.getValue(), params, statements);
    }
    parseExpressionStatement(scanner: ScannerToken) {
        const expression = this.parseExpression(scanner);
        scanner.expectOneOrMore(TokenType.SemiColon);
        return new ExpressionStatement(expression);
    }
    parseVariableDeclaration(scanner: ScannerToken) {
        scanner.expect(TokenType.Var);
        const identifier = scanner.expect(TokenType.Identifier);
        scanner.expect(TokenType.Equal);
        const expression = this.parseExpression(scanner);
        scanner.expectOneOrMore(TokenType.SemiColon);
        return new VariableDeclaration(identifier.getValue(), expression);
    }
    parseIfStatement(scanner: ScannerToken) {
        scanner.expect(TokenType.If);
        scanner.expect(TokenType.ParenOpen);
        const condition = this.parseExpression(scanner);
        scanner.expect(TokenType.ParenClose);
        const ifStatements = this.parseBlockStatement(scanner);
        const token = scanner.peek();
        if (!token.is(TokenType.Else)) {
            return new IfStatement(condition, ifStatements);
        }
        scanner.next();
        const elseStatements = this.parseBlockStatement(scanner);
        return new IfElseStatement(condition, ifStatements, elseStatements);
    }
    parseStatement(scanner: ScannerToken): Statement {
        const token = scanner.peek();
        switch (token.getType()) {
            case TokenType.Function:
                return this.parseFunctionDeclaration(scanner);
            case TokenType.Return:
                return this.parseReturnStatement(scanner);
            case TokenType.Var:
                return this.parseVariableDeclaration(scanner);
            case TokenType.If:
                return this.parseIfStatement(scanner);
        }
        return this.parseExpressionStatement(scanner);
    }
    parse(code: string): Program {
        const tokens = this.lexer.lex(code);
        const scanner = new ScannerToken(tokens);
        const statements = [];
        while (!scanner.eof()) {
            statements.push(this.parseStatement(scanner));
        }
        return new Program(statements);
    }
}

export default Parser;
