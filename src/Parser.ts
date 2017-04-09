import {
    Program, Statement, ExpressionStatement, FunctionDeclaration, BlockStatement, ReturnStatement, Expression,
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
            return new FunctionCall(identifier.value, []);
        }
        const params = [];
        do {
            params.push(this.parseExpression(scanner));
            const token = scanner.peek();
            if (token.is(TokenType.ParenClose)) {
                scanner.next();
                return new FunctionCall(identifier.value, params);
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
        return new Variable(identifier.value);
    }
    maybeBinary(scanner: ScannerToken, parser: (scanner: ScannerToken) => Expression) {
        const left = parser(scanner);
        const token = scanner.peek();
        if (token.isOperator()) {
            scanner.next();
            const right = this.parseExpression(scanner);
            return createBinary(left, token, right);
        }
        return left;
    }
    parseNumber(scanner: ScannerToken) {
        const number = scanner.expect(TokenType.Number);
        return new NumberLiteral(number.value);
    }
    parseString(scanner: ScannerToken) {
        const string = scanner.expect(TokenType.String);
        return new StringLiteral(string.value);
    }
    parseParen(scanner: ScannerToken) {
        scanner.expect(TokenType.ParenOpen);
        const expression = this.parseExpression(scanner);
        scanner.expect(TokenType.ParenClose);
        return expression;
    }
    parseExpression(scanner: ScannerToken): Expression {
        const token = scanner.peek();
        switch (token.type) {
            case TokenType.Identifier:
                return this.maybeBinary(scanner, this.parseIdentifier.bind(this));
            case TokenType.String:
                return this.maybeBinary(scanner, this.parseString);
            case TokenType.Number:
                return this.maybeBinary(scanner, this.parseNumber);
            case TokenType.ParenOpen:
                return this.maybeBinary(scanner, this.parseParen.bind(this));
        }
        throw new Error(`Unexpected token ${TokenType[token.type]} with value "${token.value}"`);
    }
    parseReturnStatement(scanner: ScannerToken) {
        scanner.expect(TokenType.Return);
        const expression = this.parseExpression(scanner);
        scanner.expect(TokenType.SemiColon);
        return new ReturnStatement(expression);
    }
    parseBlockStatement(scanner: ScannerToken) {
        scanner.expect(TokenType.CurlyBracketOpen);
        const token = scanner.peek();
        if (token.is(TokenType.CurlyBracketClose)) {
            return new BlockStatement([]);
        }
        const statements = [];
        do {
            statements.push(this.parseStatement(scanner));
            const token = scanner.peek();
            if (token.is(TokenType.CurlyBracketClose)) {
                scanner.next();
                return new BlockStatement(statements);
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
            params.push(identifier.value);
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
        const block = this.parseBlockStatement(scanner);
        return new FunctionDeclaration(identifier.value, params, block);
    }
    parseExpressionStatement(scanner: ScannerToken) {
        const expression = this.parseExpression(scanner);
        scanner.expect(TokenType.SemiColon);
        return new ExpressionStatement(expression);
    }
    parseVariableDeclaration(scanner: ScannerToken) {
        scanner.expect(TokenType.Var);
        const identifier = scanner.expect(TokenType.Identifier);
        scanner.expect(TokenType.Equal);
        const expression = this.parseExpression(scanner);
        scanner.expect(TokenType.SemiColon);
        return new VariableDeclaration(identifier.value, expression);
    }
    parseIfStatement(scanner: ScannerToken) {
        scanner.expect(TokenType.If);
        scanner.expect(TokenType.ParenOpen);
        const condition = this.parseExpression(scanner);
        scanner.expect(TokenType.ParenClose);
        const ifBlock = this.parseBlockStatement(scanner);
        const token = scanner.peek();
        if (!token.is(TokenType.Else)) {
            return new IfStatement(condition, ifBlock);
        }
        scanner.next();
        const elseBlock = this.parseBlockStatement(scanner);
        return new IfElseStatement(condition, ifBlock, elseBlock);
    }
    parseStatement(scanner: ScannerToken): Statement {
        const token = scanner.peek();
        switch (token.type) {
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
        /*console.log();
        for (let i = 0; i < tokens.length; i++) {
            console.log(`${TokenType[tokens[i].type]} ${tokens[i].value}`);
        }
        console.log();
        */
        const scanner = new ScannerToken(tokens);
        const statements = [];
        while (!scanner.eof()) {
            statements.push(this.parseStatement(scanner));
        }
        return new Program(statements);
    }
}

export default Parser;
