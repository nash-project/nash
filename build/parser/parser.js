"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const errors_1 = require("../errors");
const lexer_1 = require("../lexer");
const expressions_1 = require("./ast/expressions");
const statements_1 = require("./ast/statements");
const types_1 = require("./types");
const ast_1 = require("./ast/ast");
const crypto = __importStar(require("node:crypto"));
class Parser {
    constructor(tokens) {
        this.currentTokenIndex = 0;
        this.statements = [];
        this.tokens = tokens;
    }
    parse() {
        while (!this.isAtEnd()) {
            this.statements.push(this.declaration());
        }
        return new ast_1.Ast(this.statements);
    }
    declaration() {
        if (this.matchTokens([lexer_1.TokenType.VARIABLE, lexer_1.TokenType.CONST])) {
            return this.variableDeclaration();
        }
        else if (this.matchTokens([lexer_1.TokenType.EXTERN])) {
            return this.externDeclaration();
        }
        else if (this.matchTokens([lexer_1.TokenType.IMPORT])) {
            return this.importModule();
        }
        else if (this.matchTokens([lexer_1.TokenType.RETURN])) {
            return this.returnStatement();
        } /*else if (this.matchTokens([TokenType.CLASS])) {
            return this.classDecleration();
        }*/
        else {
            return this.statement();
        }
    }
    returnStatement() {
        let returnValue = this.expression();
        this.consume(lexer_1.TokenType.SEMICOLON, "Expected ';' after return statement");
        return new statements_1.ReturnStatement(returnValue);
    }
    importModule() {
        let startToken = this.previousToken();
        let modulePath = "";
        do {
            let modulePathPart = this.consume(lexer_1.TokenType.IDENTIFIER).value;
            modulePath += modulePathPart;
            if (this.matchTokens([lexer_1.TokenType.COLON])) {
                this.consume(lexer_1.TokenType.COLON, "Expected '::' after module part");
            }
            else {
                break;
            }
            modulePath += "/";
        } while (true);
        this.consume(lexer_1.TokenType.SEMICOLON, "Expected ';' at the end of import");
        return new statements_1.ImportModuleStatement(startToken, modulePath);
    }
    // @ts-ignore
    externDeclaration() {
        if (this.matchTokens([lexer_1.TokenType.FUNCTION])) {
            return this.externalFunctionDeclaration();
        }
        else {
            (0, errors_1.ThrowFatalError)("Uknown external declaration type", this.currentToken().line, this.currentToken().column);
        }
    }
    externalFunctionDeclaration() {
        let type = new types_1.Type("void");
        let functionName = this.consume(lexer_1.TokenType.IDENTIFIER, "Expected function name for external function definition").value;
        this.consume(lexer_1.TokenType.LPARAM, "Expected '(' after function name");
        let argsTypes = [];
        while (!this.checkToken(lexer_1.TokenType.RPARAM)) {
            do {
                let argType;
                argType = new types_1.Type(this.consume(lexer_1.TokenType.IDENTIFIER, "Expected argument type").value);
                argsTypes.push(argType);
            } while (this.matchTokens([lexer_1.TokenType.COMMA]));
        }
        this.consume(lexer_1.TokenType.RPARAM);
        if (this.matchTokens([lexer_1.TokenType.COLON])) {
            type.setType(this.consume(lexer_1.TokenType.IDENTIFIER, "Expected function return type").value);
        }
        this.consume(lexer_1.TokenType.SEMICOLON, "Expected ';' after external function definition");
        return new statements_1.ExternalFunctionDefinitionStatement(functionName, type, argsTypes);
    }
    classDecleration() {
        let name = this.consume(lexer_1.TokenType.IDENTIFIER).value;
        this.consume(lexer_1.TokenType.LCURLYBRACES);
        let block = this.blockStatement();
        return new statements_1.ClassStatement(name, block);
    }
    variableDeclaration() {
        const isConstant = this.previousToken().type === lexer_1.TokenType.CONST;
        const name = this.consume(lexer_1.TokenType.IDENTIFIER, "Expected variable name");
        let variableType = null;
        if (this.matchTokens([lexer_1.TokenType.COLON])) {
            variableType = new types_1.Type(this.consume(lexer_1.TokenType.IDENTIFIER, "Expected variable type").value);
        }
        let initValue = null;
        if (this.matchTokens([lexer_1.TokenType.EQUAL])) {
            initValue = this.expression();
        }
        if (!initValue) {
            this.consume(lexer_1.TokenType.SEMICOLON, "Expected ';' at end of variable declaration");
        }
        else if (initValue === null || initValue === void 0 ? void 0 : initValue.expectSemiColon) {
            this.consume(lexer_1.TokenType.SEMICOLON, "Expected ';' at end of variable declaration");
        }
        return new statements_1.VariableStatement(name.value, variableType, initValue, isConstant);
    }
    statement() {
        if (this.matchTokens([lexer_1.TokenType.LCURLYBRACES])) {
            return this.blockStatement();
        }
        else if (this.matchTokens([lexer_1.TokenType.IF])) {
            return this.ifStatement();
        }
        else if (this.matchTokens([lexer_1.TokenType.WHILE])) {
            return this.whileStatement();
        }
        else if (this.matchTokens([lexer_1.TokenType.DEFER])) {
            return this.deferStatement();
        }
        else if (this.matchTokens([lexer_1.TokenType.STRUCT])) {
            return this.structStatement();
        }
        return this.expressionStatement();
    }
    structStatement() {
        const startingToken = this.previousToken();
        const name = this.consume(lexer_1.TokenType.IDENTIFIER, "Expected struct name");
        this.consume(lexer_1.TokenType.LCURLYBRACES, "Expected '{' after name");
        const block = this.dataDefinitionBlock();
        return new statements_1.StructStatement(startingToken, name, block);
    }
    dataDefinitionBlock() {
        //this.consume(TokenType.LCURLYBRACES, "Expect '{'");
        const startingToken = this.previousToken();
        let statements = [];
        while (!this.checkToken(lexer_1.TokenType.RCURLYBRACES) && !this.isAtEnd()) {
            let statement = this.declaration();
            if (statement instanceof statements_1.VariableStatement) {
            }
            else if (statement instanceof statements_1.ExpressionStatement &&
                statement.expr instanceof expressions_1.FunctionDeclarationExpression) {
                const anonFunction = this.generateAnonymousFunction(statement.expr.startToken, statement.expr.type, statement.expr.args, statement.expr.block);
                // @ts-ignore
                statement.expr.anonFunction = anonFunction;
            }
            else {
                (0, errors_1.ThrowFatalError)("Must be variable declaration or function declaration", startingToken.line, startingToken.column);
            }
            statements.push(statement);
        }
        this.consume(lexer_1.TokenType.RCURLYBRACES, `Expected '}' but got '${JSON.stringify(this.currentToken())}' instead.`);
        return new statements_1.DataDefinitionBlock(startingToken, statements);
    }
    deferStatement() {
        const startingToken = this.previousToken();
        const block = this.statement();
        return new statements_1.DeferStatement(startingToken, block);
    }
    whileStatement() {
        this.consume(lexer_1.TokenType.LPARAM);
        const expr = this.expression();
        this.consume(lexer_1.TokenType.RPARAM);
        const thenBlock = this.statement();
        return new statements_1.WhileStatement(expr, thenBlock);
    }
    ifStatement() {
        this.consume(lexer_1.TokenType.LPARAM);
        const expr = this.expression();
        this.consume(lexer_1.TokenType.RPARAM);
        const thenBlock = this.statement();
        let elseBlock = null;
        if (this.matchTokens([lexer_1.TokenType.ELSE])) {
            elseBlock = this.statement();
        }
        return new statements_1.IfStatement(expr, thenBlock, elseBlock);
    }
    expressionStatement() {
        const expr = this.expression();
        if (expr.expectSemiColon) {
            this.consume(lexer_1.TokenType.SEMICOLON, "Expected ';' after expression");
        }
        return new statements_1.ExpressionStatement(expr);
    }
    blockStatement() {
        let statements = [];
        while (!this.checkToken(lexer_1.TokenType.RCURLYBRACES) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        this.consume(lexer_1.TokenType.RCURLYBRACES, `Expected '}' but got '${JSON.stringify(this.currentToken())}' instead.`);
        return new statements_1.BlockStatement(statements);
    }
    expression() {
        return this.assignment();
    }
    assignment() {
        let startToken = this.currentToken();
        const expr = this.or();
        if (this.matchTokens([lexer_1.TokenType.EQUAL])) {
            const value = this.equality();
            if (expr instanceof expressions_1.VariableExpression) {
                const name = expr.name;
                return new expressions_1.AssignmentExpression(startToken, name, value);
            }
            else {
                throw new errors_1.ParserError("Invalid assignment target");
            }
        }
        return expr;
    }
    or() {
        let startToken = this.currentToken();
        let expr = this.and();
        if (this.matchTokens([lexer_1.TokenType.OR])) {
            const operator = this.previousToken();
            const right = this.and();
            expr = new expressions_1.LogicalExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    and() {
        let startToken = this.currentToken();
        let expr = this.equality();
        if (this.matchTokens([lexer_1.TokenType.AND])) {
            const operator = this.previousToken();
            const right = this.equality();
            expr = new expressions_1.LogicalExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    equality() {
        let startToken = this.currentToken();
        let expr = this.comparison();
        while (this.matchTokens([lexer_1.TokenType.EQUALEQUAL])) {
            const token = this.previousToken();
            const right = this.comparison();
            expr = new expressions_1.BinaryExpression(startToken, expr, token, right);
        }
        return expr;
    }
    comparison() {
        let startToken = this.currentToken();
        let expr = this.term();
        while (this.matchTokens([
            lexer_1.TokenType.GREATER_OR_EQUAL,
            lexer_1.TokenType.LESS_OR_EQUAL,
            lexer_1.TokenType.GREATER,
            lexer_1.TokenType.LESS,
        ])) {
            const operator = this.previousToken();
            const right = this.term();
            expr = new expressions_1.BinaryExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    term() {
        let startToken = this.currentToken();
        let expr = this.factor();
        while (this.matchTokens([lexer_1.TokenType.PLUS, lexer_1.TokenType.MINUS])) {
            const operator = this.previousToken();
            const right = this.factor();
            expr = new expressions_1.BinaryExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    factor() {
        let startToken = this.currentToken();
        let expr = this.unary();
        while (this.matchTokens([lexer_1.TokenType.SLASH, lexer_1.TokenType.STAR])) {
            const operator = this.previousToken();
            const right = this.unary();
            expr = new expressions_1.BinaryExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    unary() {
        let startToken = this.currentToken();
        if (this.matchTokens([lexer_1.TokenType.BANG, lexer_1.TokenType.MINUS])) {
            const operator = this.previousToken();
            const right = this.unary();
            return new expressions_1.UnaryExpression(startToken, operator, right);
        }
        return this.call();
    }
    call() {
        let startToken = this.currentToken();
        let expr = this.primary();
        while (true) {
            if (this.matchTokens([lexer_1.TokenType.LPARAM])) {
                let args = [];
                if (!this.checkToken(lexer_1.TokenType.RPARAM)) {
                    let argument;
                    do {
                        if (args.length >= 255) {
                            throw new errors_1.ParserError("You cannot pass more than 255 arguments to a function");
                        }
                        argument = this.expression();
                        args.push(argument);
                    } while (this.matchTokens([lexer_1.TokenType.COMMA]));
                }
                this.consume(lexer_1.TokenType.RPARAM);
                expr = new expressions_1.CallExpression(startToken, expr, args);
            }
            else {
                break;
            }
        }
        return expr;
    }
    // @ts-ignore
    primary() {
        let startToken = this.currentToken();
        if (this.matchTokens([lexer_1.TokenType.FALSE])) {
            return new expressions_1.LiteralExpression(startToken, false, "boolean");
        }
        else if (this.matchTokens([lexer_1.TokenType.TRUE])) {
            return new expressions_1.LiteralExpression(startToken, true, "boolean");
        }
        else if (this.matchTokens([lexer_1.TokenType.NULL])) {
            return new expressions_1.LiteralExpression(startToken, 0, "integer");
        }
        else if (this.matchTokens([lexer_1.TokenType.INTEGER])) {
            return new expressions_1.LiteralExpression(startToken, this.previousToken().value, "integer");
        }
        else if (this.matchTokens([lexer_1.TokenType.STRING])) {
            return new expressions_1.LiteralExpression(startToken, this.previousToken().value, "string");
        }
        else if (this.matchTokens([lexer_1.TokenType.LPARAM])) {
            const expr = this.expression();
            this.consume(lexer_1.TokenType.RPARAM);
            return new expressions_1.GroupingExpression(startToken, expr);
        }
        else if (this.matchTokens([lexer_1.TokenType.IDENTIFIER])) {
            return new expressions_1.VariableExpression(startToken, this.previousToken());
        }
        else if (this.matchTokens([lexer_1.TokenType.FUNCTION])) {
            return this.functionDeclaration();
        }
        (0, errors_1.ThrowFatalError)(`Could not parse expression`, this.currentToken().line, this.currentToken().column);
    }
    generateAnonymousFunction(startToken, type, args, block) {
        let name = "anonymousFunction" + crypto.randomBytes(20).toString("hex");
        this.statements.push(new statements_1.ExpressionStatement(new expressions_1.FunctionDeclarationExpression(startToken, name, args, type, block)));
        return name;
    }
    functionDeclaration() {
        let startToken = this.previousToken();
        let type = new types_1.Type("function<void>");
        let name = null;
        let block;
        if (this.matchTokens([lexer_1.TokenType.LPARAM])) {
        }
        else if (this.matchTokens([lexer_1.TokenType.IDENTIFIER])) {
            name = this.previousToken().value;
            this.consume(lexer_1.TokenType.LPARAM);
        }
        else {
            throw new errors_1.ParserError("Expected '(' or function name");
        }
        let args = [];
        while (!this.checkToken(lexer_1.TokenType.RPARAM)) {
            do {
                let argName = "";
                let argType;
                let initValue = null;
                argName = this.consume(lexer_1.TokenType.IDENTIFIER, "Expected argument name").value;
                this.consume(lexer_1.TokenType.COLON);
                argType = new types_1.Type(this.consume(lexer_1.TokenType.IDENTIFIER, "Expected argument type").value);
                if (this.matchTokens([lexer_1.TokenType.EQUAL])) {
                    initValue = this.primary();
                }
                args.push(new expressions_1.FunctionDeclarationExpressionArgument(argName, initValue, argType));
            } while (this.matchTokens([lexer_1.TokenType.COMMA]));
        }
        this.consume(lexer_1.TokenType.RPARAM);
        if (this.matchTokens([lexer_1.TokenType.COLON])) {
            let returnType = this.consume(lexer_1.TokenType.IDENTIFIER, "Expected function return type").value;
            //console.log(returnType);
            type = new types_1.Type(`function<${returnType}>`);
        }
        block = this.statement();
        if (name === null) {
            let anonFunctionName = this.generateAnonymousFunction(startToken, type, args, block);
            let variableExpression = new expressions_1.VariableExpression(startToken, {
                value: anonFunctionName,
                type: lexer_1.TokenType.IDENTIFIER,
            });
            variableExpression.expectSemiColon = false;
            return variableExpression;
        }
        else {
            return new expressions_1.FunctionDeclarationExpression(startToken, name, args, type, block);
        }
    }
    synchronize() {
        this.advanceTokenIndex();
        while (!this.isAtEnd()) {
            if (this.previousToken().type === lexer_1.TokenType.SEMICOLON) {
                return;
            }
            switch (this.currentToken().type) {
                case lexer_1.TokenType.FUNCTION:
                case lexer_1.TokenType.VARIABLE:
                case lexer_1.TokenType.CONST:
                case lexer_1.TokenType.RETURN:
                case lexer_1.TokenType.CLASS:
                case lexer_1.TokenType.FOR:
                case lexer_1.TokenType.WHILE:
                case lexer_1.TokenType.IF:
                case lexer_1.TokenType.ELSE:
                    return;
            }
            this.advanceTokenIndex();
        }
    }
    // All helpful functions
    consume(expected, message = "") {
        let nmessage = "";
        if (!message) {
            nmessage = `Expected '${lexer_1.TokenType[expected]}' but got '${lexer_1.TokenType[this.currentToken().type]}'`;
        }
        if (this.isAtEnd()) {
            (0, errors_1.ThrowFatalError)(message, this.previousToken().line, this.previousToken().column);
        }
        if (this.currentToken().type == expected) {
            this.advanceTokenIndex();
            return this.previousToken();
        }
        else {
            (0, errors_1.ThrowFatalError)(message, this.previousToken().line, this.previousToken().column);
            return this.previousToken(); // will never get here, but typescript won't shut up
        }
    }
    matchTokens(TokenTypes) {
        for (let i = 0; i < TokenTypes.length; i++) {
            if (this.checkToken(TokenTypes[i])) {
                this.advanceTokenIndex();
                return true;
            }
        }
        return false;
    }
    checkToken(expected) {
        if (this.isAtEnd()) {
            return false;
        }
        return this.currentToken().type === expected;
    }
    advanceTokenIndex() {
        if (!this.isAtEnd())
            this.currentTokenIndex++;
        return this.previousToken();
    }
    currentToken() {
        return this.tokens[this.currentTokenIndex];
    }
    previousToken() {
        return this.tokens[this.currentTokenIndex - 1];
    }
    nextToken() {
        return this.tokens[this.currentTokenIndex + 1];
    }
    isAtEnd() {
        return this.currentTokenIndex >= this.tokens.length;
    }
}
exports.Parser = Parser;
