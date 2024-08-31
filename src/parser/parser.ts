import { ParserError, ThrowFatalError } from "../errors";
import { Token, TokenType } from "../lexer";
import {
    BinaryExpression,
    GroupingExpression,
    LiteralExpression,
    UnaryExpression,
    Expression,
    VariableExpression,
    AssignmentExpression,
    LogicalExpression,
    CallExpression,
    FunctionDeclarationExpression,
    FunctionDeclarationExpressionArgument,
} from "./ast/expressions";
import {
    Statement,
    ExpressionStatement,
    VariableStatement,
    BlockStatement,
    IfStatement,
    WhileStatement,
    ClassStatement,
    ExternalFunctionDefinitionStatement,
    ImportModuleStatement,
    ReturnStatement,
    DeferStatement,
    DataDefinitionBlock,
    StructStatement,
} from "./ast/statements";
import { Type } from "./types";
import { Ast } from "./ast/ast";
import * as crypto from "node:crypto";
import { Scope } from "../scope";
export class Parser {
    tokens: Array<Token>;
    currentTokenIndex: number = 0;
    statements: Array<Statement> = [];
    currentScope: Scope;
    topScope: Scope;
    constructor(tokens: Array<Token>) {
        this.tokens = tokens;
        this.currentScope = new Scope(null);
        this.topScope = this.currentScope;
    }
    parse(): Ast {
        while (!this.isAtEnd()) {
            this.statements.push(this.declaration());
        }
        return new Ast(this.statements, null, this.topScope);
    }

    declaration(): Statement {
        if (this.matchTokens([TokenType.VARIABLE, TokenType.CONST])) {
            return this.variableDeclaration();
        } else if (this.matchTokens([TokenType.EXTERN])) {
            return this.externDeclaration();
        } else if (this.matchTokens([TokenType.IMPORT])) {
            return this.importModule();
        } else if (this.matchTokens([TokenType.RETURN])) {
            return this.returnStatement();
        } /*else if (this.matchTokens([TokenType.CLASS])) {
            return this.classDecleration();
        }*/ else {
            return this.statement();
        }
    }
    returnStatement(): Statement {
        let returnValue: Expression = this.expression();
        this.consume(
            TokenType.SEMICOLON,
            "Expected ';' after return statement"
        );
        return new ReturnStatement(returnValue);
    }
    importModule(): Statement {
        let startToken: Token = this.previousToken();
        let modulePath: string = "";
        do {
            let modulePathPart = this.consume(TokenType.IDENTIFIER).value;
            modulePath += modulePathPart;
            if (this.matchTokens([TokenType.COLON])) {
                this.consume(
                    TokenType.COLON,
                    "Expected '::' after module part"
                );
            } else {
                break;
            }

            modulePath += "/";
        } while (true);
        this.consume(TokenType.SEMICOLON, "Expected ';' at the end of import");
        return new ImportModuleStatement(startToken, modulePath);
    }
    // @ts-ignore
    externDeclaration(): Statement {
        if (this.matchTokens([TokenType.FUNCTION])) {
            return this.externalFunctionDeclaration();
        } else {
            ThrowFatalError(
                "Uknown external declaration type",
                this.currentToken().line,
                this.currentToken().column
            );
        }
    }
    externalFunctionDeclaration(): Statement {
        let type: Type = new Type("void");
        let functionName: string = this.consume(
            TokenType.IDENTIFIER,
            "Expected function name for external function definition"
        ).value;

        this.consume(TokenType.LPARAM, "Expected '(' after function name");
        let argsTypes: Array<Type> = [];

        while (!this.checkToken(TokenType.RPARAM)) {
            do {
                let argType: Type;
                argType = new Type(
                    this.consume(
                        TokenType.IDENTIFIER,
                        "Expected argument type"
                    ).value
                );

                argsTypes.push(argType);
            } while (this.matchTokens([TokenType.COMMA]));
        }

        this.consume(TokenType.RPARAM);
        if (this.matchTokens([TokenType.COLON])) {
            type.setType(
                this.consume(
                    TokenType.IDENTIFIER,
                    "Expected function return type"
                ).value
            );
        }
        this.consume(
            TokenType.SEMICOLON,
            "Expected ';' after external function definition"
        );
        return new ExternalFunctionDefinitionStatement(
            functionName,
            type,
            argsTypes
        );
    }
    classDecleration(): Statement {
        let name = this.consume(TokenType.IDENTIFIER).value;
        this.consume(TokenType.LCURLYBRACES);
        let block = this.blockStatement();

        return new ClassStatement(name, block);
    }
    variableDeclaration(): Statement {
        const isConstant = this.previousToken().type === TokenType.CONST;
        const name: Token = this.consume(
            TokenType.IDENTIFIER,
            "Expected variable name"
        );
        let variableType: Type | null = null;
        if (this.matchTokens([TokenType.COLON])) {
            variableType = new Type(
                this.consume(
                    TokenType.IDENTIFIER,
                    "Expected variable type"
                ).value
            );
        }

        let initValue = null;

        if (this.matchTokens([TokenType.EQUAL])) {
            initValue = this.expression();
        }
        if (!initValue) {
            this.consume(
                TokenType.SEMICOLON,
                "Expected ';' at end of variable declaration"
            );
        } else if (initValue?.expectSemiColon) {
            this.consume(
                TokenType.SEMICOLON,
                "Expected ';' at end of variable declaration"
            );
        }

        return new VariableStatement(
            name.value,
            variableType,
            initValue,
            isConstant
        );
    }
    statement(): Statement {
        if (this.matchTokens([TokenType.LCURLYBRACES])) {
            return this.blockStatement();
        } else if (this.matchTokens([TokenType.IF])) {
            return this.ifStatement();
        } else if (this.matchTokens([TokenType.WHILE])) {
            return this.whileStatement();
        } else if (this.matchTokens([TokenType.DEFER])) {
            return this.deferStatement();
        } else if (this.matchTokens([TokenType.STRUCT])) {
            return this.structStatement();
        }
        return this.expressionStatement();
    }
    structStatement(): Statement {
        const startingToken: Token = this.previousToken();
        const name = this.consume(TokenType.IDENTIFIER, "Expected struct name");
        this.consume(TokenType.LCURLYBRACES, "Expected '{' after name");
        const block = this.dataDefinitionBlock();
        return new StructStatement(startingToken, name, block);
    }
    dataDefinitionBlock(): DataDefinitionBlock {
        //this.consume(TokenType.LCURLYBRACES, "Expect '{'");

        const startingToken: Token = this.previousToken();
        let statements: Array<Statement> = [];
        while (!this.checkToken(TokenType.RCURLYBRACES) && !this.isAtEnd()) {
            let statement = this.declaration();
            if (statement instanceof VariableStatement) {
            } else if (
                statement instanceof ExpressionStatement &&
                statement.expr instanceof FunctionDeclarationExpression
            ) {
                const anonFunction: string = this.generateAnonymousFunction(
                    statement.expr.startToken,
                    statement.expr.type,
                    statement.expr.args,
                    statement.expr.block
                );
                // @ts-ignore
                statement.expr.anonFunction = anonFunction;
            } else {
                ThrowFatalError(
                    "Must be variable declaration or function declaration",
                    startingToken.line,
                    startingToken.column
                );
            }
            statements.push(statement);
        }

        this.consume(
            TokenType.RCURLYBRACES,
            `Expected '}' but got '${JSON.stringify(
                this.currentToken()
            )}' instead.`
        );

        return new DataDefinitionBlock(startingToken, statements);
    }
    deferStatement(): Statement {
        const startingToken: Token = this.previousToken();
        const block: Statement = this.statement();
        return new DeferStatement(startingToken, block);
    }
    whileStatement(): Statement {
        this.consume(TokenType.LPARAM);
        const expr: Expression = this.expression();
        this.consume(TokenType.RPARAM);
        const thenBlock: Statement = this.statement();
        return new WhileStatement(expr, thenBlock);
    }
    ifStatement(): Statement {
        this.consume(TokenType.LPARAM);
        const expr: Expression = this.expression();
        this.consume(TokenType.RPARAM);
        const thenBlock: Statement = this.statement();
        let elseBlock = null;
        if (this.matchTokens([TokenType.ELSE])) {
            elseBlock = this.statement();
        }
        return new IfStatement(expr, thenBlock, elseBlock);
    }
    expressionStatement(): Statement {
        const expr: Expression = this.expression();
        if (expr.expectSemiColon) {
            this.consume(TokenType.SEMICOLON, "Expected ';' after expression");
        }
        return new ExpressionStatement(expr);
    }
    blockStatement(): Statement {
        let statements: Array<Statement> = [];
        while (!this.checkToken(TokenType.RCURLYBRACES) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }

        this.consume(
            TokenType.RCURLYBRACES,
            `Expected '}' but got '${JSON.stringify(
                this.currentToken()
            )}' instead.`
        );

        return new BlockStatement(statements);
    }

    expression(): Expression {
        return this.assignment();
    }
    assignment(): Expression {
        let startToken = this.currentToken();
        const expr: Expression = this.or();
        if (this.matchTokens([TokenType.EQUAL])) {
            const value: Expression = this.equality();
            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignmentExpression(startToken, name, value);
            } else {
                throw new ParserError("Invalid assignment target");
            }
        }
        return expr;
    }
    or(): Expression {
        let startToken = this.currentToken();

        let expr: Expression = this.and();
        if (this.matchTokens([TokenType.OR])) {
            const operator: Token = this.previousToken();
            const right: Expression = this.and();
            expr = new LogicalExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    and(): Expression {
        let startToken = this.currentToken();

        let expr: Expression = this.equality();
        if (this.matchTokens([TokenType.AND])) {
            const operator: Token = this.previousToken();
            const right: Expression = this.equality();
            expr = new LogicalExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    equality(): Expression {
        let startToken = this.currentToken();

        let expr: Expression = this.comparison();
        while (this.matchTokens([TokenType.EQUALEQUAL])) {
            const token: Token = this.previousToken();
            const right: Expression = this.comparison();
            expr = new BinaryExpression(startToken, expr, token, right);
        }
        return expr;
    }
    comparison(): Expression {
        let startToken = this.currentToken();

        let expr: Expression = this.term();
        while (
            this.matchTokens([
                TokenType.GREATER_OR_EQUAL,
                TokenType.LESS_OR_EQUAL,
                TokenType.GREATER,
                TokenType.LESS,
            ])
        ) {
            const operator: Token = this.previousToken();
            const right: Expression = this.term();
            expr = new BinaryExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    term(): Expression {
        let startToken = this.currentToken();

        let expr: Expression = this.factor();

        while (this.matchTokens([TokenType.PLUS, TokenType.MINUS])) {
            const operator: Token = this.previousToken();
            const right: Expression = this.factor();
            expr = new BinaryExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    factor(): Expression {
        let startToken = this.currentToken();

        let expr: Expression = this.unary();

        while (this.matchTokens([TokenType.SLASH, TokenType.STAR])) {
            const operator: Token = this.previousToken();
            const right: Expression = this.unary();
            expr = new BinaryExpression(startToken, expr, operator, right);
        }
        return expr;
    }
    unary(): Expression {
        let startToken = this.currentToken();

        if (this.matchTokens([TokenType.BANG, TokenType.MINUS])) {
            const operator: Token = this.previousToken();
            const right: Expression = this.unary();
            return new UnaryExpression(startToken, operator, right);
        }
        return this.call();
    }
    call(): Expression {
        let startToken = this.currentToken();

        let expr: Expression = this.primary();
        while (true) {
            if (this.matchTokens([TokenType.LPARAM])) {
                let args: Array<Expression> = [];
                if (!this.checkToken(TokenType.RPARAM)) {
                    let argument: Expression;
                    do {
                        if (args.length >= 255) {
                            throw new ParserError(
                                "You cannot pass more than 255 arguments to a function"
                            );
                        }
                        argument = this.expression();
                        args.push(argument);
                    } while (this.matchTokens([TokenType.COMMA]));
                }
                this.consume(TokenType.RPARAM);
                expr = new CallExpression(startToken, expr, args);
            } else {
                break;
            }
        }

        return expr;
    }
    // @ts-ignore
    primary(): Expression {
        let startToken = this.currentToken();

        if (this.matchTokens([TokenType.FALSE])) {
            return new LiteralExpression(startToken, false, "boolean");
        } else if (this.matchTokens([TokenType.TRUE])) {
            return new LiteralExpression(startToken, true, "boolean");
        } else if (this.matchTokens([TokenType.NULL])) {
            return new LiteralExpression(startToken, 0, "integer");
        } else if (this.matchTokens([TokenType.INTEGER])) {
            return new LiteralExpression(
                startToken,
                this.previousToken().value,
                "integer"
            );
        } else if (this.matchTokens([TokenType.STRING])) {
            return new LiteralExpression(
                startToken,
                this.previousToken().value,
                "string"
            );
        } else if (this.matchTokens([TokenType.LPARAM])) {
            const expr: Expression = this.expression();
            this.consume(TokenType.RPARAM);
            return new GroupingExpression(startToken, expr);
        } else if (this.matchTokens([TokenType.IDENTIFIER])) {
            return new VariableExpression(startToken, this.previousToken());
        } else if (this.matchTokens([TokenType.FUNCTION])) {
            return this.functionDeclaration();
        }

        ThrowFatalError(
            `Could not parse expression`,
            this.currentToken().line,
            this.currentToken().column
        );
    }
    generateAnonymousFunction(
        startToken: Token,
        type: Type,
        args: Array<FunctionDeclarationExpressionArgument>,
        block: Statement
    ): string {
        let name = "anonymousFunction" + crypto.randomBytes(20).toString("hex");
        this.statements.push(
            new ExpressionStatement(
                new FunctionDeclarationExpression(
                    startToken,
                    name,
                    args,
                    type,
                    block
                )
            )
        );
        return name;
    }
    functionDeclaration(): Expression {
        let startToken = this.previousToken();
        let type: Type = new Type("function<void>");
        let name: string | null = null;
        let block: Statement;
        if (this.matchTokens([TokenType.LPARAM])) {
        } else if (this.matchTokens([TokenType.IDENTIFIER])) {
            name = this.previousToken().value;
            this.consume(TokenType.LPARAM);
        } else {
            throw new ParserError("Expected '(' or function name");
        }
        let args: Array<FunctionDeclarationExpressionArgument> = [];

        while (!this.checkToken(TokenType.RPARAM)) {
            do {
                let argName: string = "";
                let argType: Type;
                let initValue: Expression | null = null;
                argName = this.consume(
                    TokenType.IDENTIFIER,
                    "Expected argument name"
                ).value;
                this.consume(TokenType.COLON);
                argType = new Type(
                    this.consume(
                        TokenType.IDENTIFIER,
                        "Expected argument type"
                    ).value
                );
                if (this.matchTokens([TokenType.EQUAL])) {
                    initValue = this.primary();
                }
                args.push(
                    new FunctionDeclarationExpressionArgument(
                        argName,
                        initValue,
                        argType
                    )
                );
            } while (this.matchTokens([TokenType.COMMA]));
        }

        this.consume(TokenType.RPARAM);
        if (this.matchTokens([TokenType.COLON])) {
            let returnType = this.consume(
                TokenType.IDENTIFIER,
                "Expected function return type"
            ).value;
            //console.log(returnType);
            type = new Type(`function<${returnType}>`);
        }
        block = this.statement();
        if (name === null) {
            let anonFunctionName: string = this.generateAnonymousFunction(
                startToken,
                type,
                args,
                block
            );
            let variableExpression = new VariableExpression(startToken, {
                value: anonFunctionName,
                type: TokenType.IDENTIFIER,
            } as Token);
            variableExpression.expectSemiColon = false;
            return variableExpression;
        } else {
            return new FunctionDeclarationExpression(
                startToken,
                name,
                args,
                type,
                block
            );
        }
    }
    synchronize() {
        this.advanceTokenIndex();
        while (!this.isAtEnd()) {
            if (this.previousToken().type === TokenType.SEMICOLON) {
                return;
            }
            switch (this.currentToken().type) {
                case TokenType.FUNCTION:
                case TokenType.VARIABLE:
                case TokenType.CONST:
                case TokenType.RETURN:
                case TokenType.CLASS:
                case TokenType.FOR:
                case TokenType.WHILE:
                case TokenType.IF:
                case TokenType.ELSE:
                    return;
            }
            this.advanceTokenIndex();
        }
    }

    // All helpful functions
    consume(expected: TokenType, message: string = "") {
        let nmessage = "";
        if (!message) {
            nmessage = `Expected '${TokenType[expected]}' but got '${
                TokenType[this.currentToken().type]
            }'`;
        }
        if (this.isAtEnd()) {
            ThrowFatalError(
                message,
                this.previousToken().line,
                this.previousToken().column
            );
        }
        if (this.currentToken().type == expected) {
            this.advanceTokenIndex();

            return this.previousToken();
        } else {
            ThrowFatalError(
                message,
                this.previousToken().line,
                this.previousToken().column
            );
            return this.previousToken(); // will never get here, but typescript won't shut up
        }
    }
    matchTokens(TokenTypes: Array<TokenType>): boolean {
        for (let i = 0; i < TokenTypes.length; i++) {
            if (this.checkToken(TokenTypes[i])) {
                this.advanceTokenIndex();
                return true;
            }
        }
        return false;
    }
    checkToken(expected: TokenType) {
        if (this.isAtEnd()) {
            return false;
        }
        return this.currentToken().type === expected;
    }
    advanceTokenIndex(): Token {
        if (!this.isAtEnd()) this.currentTokenIndex++;
        return this.previousToken();
    }
    currentToken(): Token {
        return this.tokens[this.currentTokenIndex];
    }
    previousToken(): Token {
        return this.tokens[this.currentTokenIndex - 1];
    }
    nextToken(): Token {
        return this.tokens[this.currentTokenIndex + 1];
    }
    isAtEnd(): boolean {
        return this.currentTokenIndex >= this.tokens.length;
    }
}
