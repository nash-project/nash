import { LexerError, ThrowFatalError } from "./errors";

export enum TokenType {
    LPARAM = 1,
    RPARAM,
    STRING,
    INTEGER,
    FUNCTION,
    VARIABLE,
    CONST,
    IDENTIFIER,
    EQUAL,
    EQUALEQUAL,
    GREATER,
    LESS,
    LESS_OR_EQUAL,
    GREATER_OR_EQUAL,
    SEMICOLON,
    RETURN,
    PLUS,
    MINUS,
    STAR,
    SLASH,
    RSLASH,
    BANG,
    TRUE,
    FALSE,
    NULL,
    IF,
    ELSE,
    WHILE,
    FOR,
    CLASS,
    COLON,
    LCURLYBRACES,
    RCURLYBRACES,
    AND,
    OR,
    COMMA,
    EXTERN,
    IMPORT,
    AT,
    DEFER,
    STRUCT,
}
export interface Token {
    type: TokenType;
    value: any;
    typeName: string;
    line: number;
    column: number;
    isFunctionType: boolean;
    functionReturnType: string;
}

export class Lexer {
    input: string;
    index: number;
    currentCharacter: string = "";
    tokens: Array<Token> = [];
    currentLine: number = 1;
    currentColumn: number = 0;
    constructor(input: string) {
        this.input = input;
        this.index = 0;
    }
    addToken(
        token: TokenType,
        value: any = null,
        isFunctionType = false,
        functionReturnType = ""
    ) {
        this.currentColumn += value.length;
        this.tokens.push({
            type: token,
            value: value,
            typeName: TokenType[token],
            line: this.currentLine,
            column: this.currentColumn,
            isFunctionType: isFunctionType,
            functionReturnType: functionReturnType,
        });
    }
    updateCurrentCharacter() {
        this.currentCharacter = this.input.charAt(this.index);
    }
    getNextCharacter() {
        return this.input.charAt(this.index + 1);
    }
    getLastCharacter() {
        return this.input.charAt(this.index - 1);
    }
    goForward() {
        this.index++;
        this.updateCurrentCharacter();
    }
    atEnd() {
        return this.index === this.input.length - 1;
    }
    lex() {
        for (this.index = 0; this.index < this.input.length; this.index++) {
            this.updateCurrentCharacter();
            if (this.currentCharacter === "(") {
                this.addToken(TokenType.LPARAM, "(");
                continue;
            } else if (this.currentCharacter === ")") {
                this.addToken(TokenType.RPARAM, ")");
                continue;
            } else if (this.currentCharacter === ";") {
                this.addToken(TokenType.SEMICOLON, ";");
                continue;
            } else if (this.currentCharacter === ",") {
                this.addToken(TokenType.COMMA, ",");
                continue;
            } else if (this.currentCharacter === "+") {
                this.addToken(TokenType.PLUS, "+");
                continue;
            } else if (this.currentCharacter === "/") {
                if (this.getNextCharacter() === "/") {
                    this.goForward();
                    this.updateCurrentCharacter();
                    // @ts-ignore
                    while (this.currentCharacter !== "\n" && !this.atEnd()) {
                        this.goForward();
                        this.updateCurrentCharacter();
                    }
                    this.currentLine += 1;
                    this.currentColumn = 1;
                    continue;
                } else if (this.getNextCharacter() === "*") {
                    this.goForward();
                    this.goForward();
                    this.updateCurrentCharacter();
                    // @ts-ignore
                    while (this.currentCharacter !== "*" && !this.atEnd()) {
                        this.goForward();
                        this.updateCurrentCharacter();
                        // @ts-ignore
                        if (this.currentCharacter === "\n") {
                            this.currentLine += 1;
                            this.currentColumn = 1;
                        }
                    }
                    this.goForward();
                    this.updateCurrentCharacter();
                    if (this.currentCharacter === "/") {
                        continue;
                    } else {
                        throw new LexerError(
                            "Expected a '/' to finish the multiline comment"
                        );
                    }
                } else {
                    this.addToken(TokenType.RSLASH, "/");
                    continue;
                }
            } else if (this.currentCharacter === "-") {
                this.addToken(TokenType.MINUS, "-");
                continue;
            } else if (this.currentCharacter === "*") {
                this.addToken(TokenType.STAR, "*");
                continue;
            } else if (this.currentCharacter === "/") {
                this.addToken(TokenType.SLASH, "/");
                continue;
            } else if (this.currentCharacter === "!") {
                this.addToken(TokenType.BANG, "!");
                continue;
            } else if (this.currentCharacter === ":") {
                this.addToken(TokenType.COLON, ":");
                continue;
            } else if (this.currentCharacter === "{") {
                this.addToken(TokenType.LCURLYBRACES, "{");
                continue;
            } else if (this.currentCharacter === "@") {
                if (this.isLetter(this.getNextCharacter())) {
                    let identifier = this.currentCharacter;
                    while (true) {
                        if (
                            this.isLetter(this.getNextCharacter()) ||
                            // @ts-ignore
                            this.currentCharacter == "_" ||
                            this.isInteger(this.getNextCharacter())
                        ) {
                            this.goForward();
                            identifier += this.currentCharacter;
                        } else {
                            break;
                        }
                    }
                    this.addToken(TokenType.IDENTIFIER, identifier);
                } else {
                    this.addToken(TokenType.AT, "@");
                }
            } else if (this.currentCharacter === "}") {
                this.addToken(TokenType.RCURLYBRACES, "}");
                continue;
            } else if (this.currentCharacter === '"') {
                this.goForward();
                let str = "";
                while (true) {
                    if (this.currentCharacter != '"') {
                        str += this.currentCharacter;
                    } else {
                        if (this.getLastCharacter() === "\\") {
                            str = str.slice(0, -1);
                            str += '"';
                            this.goForward();
                            continue;
                        } else {
                            this.addToken(TokenType.STRING, str);
                            break;
                        }
                    }
                    if (this.atEnd()) {
                        throw new LexerError("Expected '\"'");
                    }
                    this.goForward();
                }
            } else if (this.currentCharacter === "=") {
                if (this.getNextCharacter() === "=") {
                    this.goForward();
                    this.addToken(TokenType.EQUALEQUAL, "==");
                } else {
                    this.addToken(TokenType.EQUAL, "=");
                }
                continue;
            } else if (this.currentCharacter === ">") {
                if (this.getNextCharacter() === "=") {
                    this.goForward();
                    this.addToken(TokenType.GREATER_OR_EQUAL, ">=");
                } else {
                    this.addToken(TokenType.GREATER, ">");
                }
                continue;
            } else if (this.currentCharacter === "<") {
                if (this.getNextCharacter() === "=") {
                    this.goForward();
                    this.addToken(TokenType.LESS_OR_EQUAL, "<=");
                } else {
                    this.addToken(TokenType.LESS, "<");
                }
                continue;
            } else if (this.isLetter(this.currentCharacter)) {
                let identifier = this.currentCharacter;
                while (true) {
                    if (
                        this.isLetter(this.getNextCharacter()) ||
                        this.currentCharacter == "_" ||
                        this.isInteger(this.getNextCharacter())
                    ) {
                        this.goForward();
                        identifier += this.currentCharacter;
                    } else {
                        break;
                    }
                }
                if (identifier === "function") {
                    if (this.getNextCharacter() === "<") {
                        this.goForward();
                        identifier += "<";
                        while (true) {
                            if (
                                (this.isLetter(this.getNextCharacter()) ||
                                    // @ts-ignore
                                    this.currentCharacter == "_" ||
                                    // @ts-ignore
                                    this.currentCharacter === "," ||
                                    this.isInteger(this.getNextCharacter())) &&
                                // @ts-ignore
                                this.currentCharacter != ">"
                            ) {
                                this.goForward();
                                identifier += this.currentCharacter;
                            } else {
                                break;
                            }
                        }
                        identifier += ">";
                        this.goForward();
                        this.addToken(TokenType.IDENTIFIER, identifier);
                    } else {
                        this.addToken(TokenType.FUNCTION, "function");
                    }
                } else if (identifier === "let") {
                    this.addToken(TokenType.VARIABLE, "let");
                } else if (identifier === "const") {
                    this.addToken(TokenType.CONST, "const");
                } else if (identifier === "return") {
                    this.addToken(TokenType.RETURN, "return");
                } else if (identifier === "null") {
                    this.addToken(TokenType.NULL, "null");
                } else if (identifier === "false") {
                    this.addToken(TokenType.FALSE, "false");
                } else if (identifier === "true") {
                    this.addToken(TokenType.TRUE, "true");
                } else if (identifier === "class") {
                    this.addToken(TokenType.CLASS, "class");
                } else if (identifier === "if") {
                    this.addToken(TokenType.IF, "if");
                } else if (identifier === "else") {
                    this.addToken(TokenType.ELSE, "else");
                } else if (identifier === "while") {
                    this.addToken(TokenType.WHILE, "while");
                } else if (identifier === "for") {
                    this.addToken(TokenType.FOR, "for");
                } else if (identifier === "and") {
                    this.addToken(TokenType.AND, "and");
                } else if (identifier === "or") {
                    this.addToken(TokenType.OR, "or");
                } else if (identifier === "external") {
                    this.addToken(TokenType.EXTERN, "external");
                } else if (identifier === "import") {
                    this.addToken(TokenType.IMPORT, "import");
                } else if (identifier === "defer") {
                    this.addToken(TokenType.DEFER, "defer");
                } else if (identifier === "struct") {
                    this.addToken(TokenType.STRUCT, "struct");
                } else {
                    this.addToken(TokenType.IDENTIFIER, identifier);
                }
                continue;
            } else if (this.isInteger(this.currentCharacter)) {
                let number = this.currentCharacter;
                while (true) {
                    if (this.isInteger(this.getNextCharacter())) {
                        this.goForward();
                        number += this.currentCharacter;
                    } else {
                        break;
                    }
                }
                this.addToken(TokenType.INTEGER, number);
                continue;
            } else if (this.currentCharacter === "\n") {
                this.currentLine += 1;
                this.currentColumn = 1;
            } else if (
                this.currentCharacter === " " ||
                this.currentCharacter === "\t" ||
                this.currentCharacter === "\r"
            ) {
                this.currentColumn += 1;
                continue;
            } else {
                ThrowFatalError(
                    "Unexpected character found",
                    this.currentLine,
                    this.currentColumn,
                    true
                );
            }
        }
    }
    isInteger(value: any) {
        return (
            !isNaN(value) &&
            (function (x) {
                return (x | 0) === x;
            })(parseFloat(value))
        );
    }
    isLetter(str: string) {
        return str.length === 1 && str.match(/[a-z]/i);
    }
}
