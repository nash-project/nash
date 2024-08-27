"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.TokenType = void 0;
const errors_1 = require("./errors");
var TokenType;
(function (TokenType) {
    TokenType[TokenType["LPARAM"] = 1] = "LPARAM";
    TokenType[TokenType["RPARAM"] = 2] = "RPARAM";
    TokenType[TokenType["STRING"] = 3] = "STRING";
    TokenType[TokenType["INTEGER"] = 4] = "INTEGER";
    TokenType[TokenType["FUNCTION"] = 5] = "FUNCTION";
    TokenType[TokenType["VARIABLE"] = 6] = "VARIABLE";
    TokenType[TokenType["CONST"] = 7] = "CONST";
    TokenType[TokenType["IDENTIFIER"] = 8] = "IDENTIFIER";
    TokenType[TokenType["EQUAL"] = 9] = "EQUAL";
    TokenType[TokenType["EQUALEQUAL"] = 10] = "EQUALEQUAL";
    TokenType[TokenType["GREATER"] = 11] = "GREATER";
    TokenType[TokenType["LESS"] = 12] = "LESS";
    TokenType[TokenType["LESS_OR_EQUAL"] = 13] = "LESS_OR_EQUAL";
    TokenType[TokenType["GREATER_OR_EQUAL"] = 14] = "GREATER_OR_EQUAL";
    TokenType[TokenType["SEMICOLON"] = 15] = "SEMICOLON";
    TokenType[TokenType["RETURN"] = 16] = "RETURN";
    TokenType[TokenType["PLUS"] = 17] = "PLUS";
    TokenType[TokenType["MINUS"] = 18] = "MINUS";
    TokenType[TokenType["STAR"] = 19] = "STAR";
    TokenType[TokenType["SLASH"] = 20] = "SLASH";
    TokenType[TokenType["RSLASH"] = 21] = "RSLASH";
    TokenType[TokenType["BANG"] = 22] = "BANG";
    TokenType[TokenType["TRUE"] = 23] = "TRUE";
    TokenType[TokenType["FALSE"] = 24] = "FALSE";
    TokenType[TokenType["NULL"] = 25] = "NULL";
    TokenType[TokenType["IF"] = 26] = "IF";
    TokenType[TokenType["ELSE"] = 27] = "ELSE";
    TokenType[TokenType["WHILE"] = 28] = "WHILE";
    TokenType[TokenType["FOR"] = 29] = "FOR";
    TokenType[TokenType["CLASS"] = 30] = "CLASS";
    TokenType[TokenType["COLON"] = 31] = "COLON";
    TokenType[TokenType["LCURLYBRACES"] = 32] = "LCURLYBRACES";
    TokenType[TokenType["RCURLYBRACES"] = 33] = "RCURLYBRACES";
    TokenType[TokenType["AND"] = 34] = "AND";
    TokenType[TokenType["OR"] = 35] = "OR";
    TokenType[TokenType["COMMA"] = 36] = "COMMA";
    TokenType[TokenType["EXTERN"] = 37] = "EXTERN";
    TokenType[TokenType["IMPORT"] = 38] = "IMPORT";
    TokenType[TokenType["AT"] = 39] = "AT";
    TokenType[TokenType["DEFER"] = 40] = "DEFER";
    TokenType[TokenType["STRUCT"] = 41] = "STRUCT";
})(TokenType || (exports.TokenType = TokenType = {}));
class Lexer {
    constructor(input) {
        this.currentCharacter = "";
        this.tokens = [];
        this.currentLine = 1;
        this.currentColumn = 0;
        this.input = input;
        this.index = 0;
    }
    addToken(token, value = null, isFunctionType = false, functionReturnType = "") {
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
            }
            else if (this.currentCharacter === ")") {
                this.addToken(TokenType.RPARAM, ")");
                continue;
            }
            else if (this.currentCharacter === ";") {
                this.addToken(TokenType.SEMICOLON, ";");
                continue;
            }
            else if (this.currentCharacter === ",") {
                this.addToken(TokenType.COMMA, ",");
                continue;
            }
            else if (this.currentCharacter === "+") {
                this.addToken(TokenType.PLUS, "+");
                continue;
            }
            else if (this.currentCharacter === "/") {
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
                }
                else if (this.getNextCharacter() === "*") {
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
                    }
                    else {
                        throw new errors_1.LexerError("Expected a '/' to finish the multiline comment");
                    }
                }
                else {
                    this.addToken(TokenType.RSLASH, "/");
                    continue;
                }
            }
            else if (this.currentCharacter === "-") {
                this.addToken(TokenType.MINUS, "-");
                continue;
            }
            else if (this.currentCharacter === "*") {
                this.addToken(TokenType.STAR, "*");
                continue;
            }
            else if (this.currentCharacter === "/") {
                this.addToken(TokenType.SLASH, "/");
                continue;
            }
            else if (this.currentCharacter === "!") {
                this.addToken(TokenType.BANG, "!");
                continue;
            }
            else if (this.currentCharacter === ":") {
                this.addToken(TokenType.COLON, ":");
                continue;
            }
            else if (this.currentCharacter === "{") {
                this.addToken(TokenType.LCURLYBRACES, "{");
                continue;
            }
            else if (this.currentCharacter === "@") {
                if (this.isLetter(this.getNextCharacter())) {
                    let identifier = this.currentCharacter;
                    while (true) {
                        if (this.isLetter(this.getNextCharacter()) ||
                            // @ts-ignore
                            this.currentCharacter == "_" ||
                            this.isInteger(this.getNextCharacter())) {
                            this.goForward();
                            identifier += this.currentCharacter;
                        }
                        else {
                            break;
                        }
                    }
                    this.addToken(TokenType.IDENTIFIER, identifier);
                }
                else {
                    this.addToken(TokenType.AT, "@");
                }
            }
            else if (this.currentCharacter === "}") {
                this.addToken(TokenType.RCURLYBRACES, "}");
                continue;
            }
            else if (this.currentCharacter === '"') {
                this.goForward();
                let str = "";
                while (true) {
                    if (this.currentCharacter != '"') {
                        str += this.currentCharacter;
                    }
                    else {
                        if (this.getLastCharacter() === "\\") {
                            str = str.slice(0, -1);
                            str += '"';
                            this.goForward();
                            continue;
                        }
                        else {
                            this.addToken(TokenType.STRING, str);
                            break;
                        }
                    }
                    if (this.atEnd()) {
                        throw new errors_1.LexerError("Expected '\"'");
                    }
                    this.goForward();
                }
            }
            else if (this.currentCharacter === "=") {
                if (this.getNextCharacter() === "=") {
                    this.goForward();
                    this.addToken(TokenType.EQUALEQUAL, "==");
                }
                else {
                    this.addToken(TokenType.EQUAL, "=");
                }
                continue;
            }
            else if (this.currentCharacter === ">") {
                if (this.getNextCharacter() === "=") {
                    this.goForward();
                    this.addToken(TokenType.GREATER_OR_EQUAL, ">=");
                }
                else {
                    this.addToken(TokenType.GREATER, ">");
                }
                continue;
            }
            else if (this.currentCharacter === "<") {
                if (this.getNextCharacter() === "=") {
                    this.goForward();
                    this.addToken(TokenType.LESS_OR_EQUAL, "<=");
                }
                else {
                    this.addToken(TokenType.LESS, "<");
                }
                continue;
            }
            else if (this.isLetter(this.currentCharacter)) {
                let identifier = this.currentCharacter;
                while (true) {
                    if (this.isLetter(this.getNextCharacter()) ||
                        this.currentCharacter == "_" ||
                        this.isInteger(this.getNextCharacter())) {
                        this.goForward();
                        identifier += this.currentCharacter;
                    }
                    else {
                        break;
                    }
                }
                if (identifier === "function") {
                    if (this.getNextCharacter() === "<") {
                        this.goForward();
                        identifier += "<";
                        while (true) {
                            if ((this.isLetter(this.getNextCharacter()) ||
                                // @ts-ignore
                                this.currentCharacter == "_" ||
                                // @ts-ignore
                                this.currentCharacter === "," ||
                                this.isInteger(this.getNextCharacter())) &&
                                // @ts-ignore
                                this.currentCharacter != ">") {
                                this.goForward();
                                identifier += this.currentCharacter;
                            }
                            else {
                                break;
                            }
                        }
                        identifier += ">";
                        this.goForward();
                        this.addToken(TokenType.IDENTIFIER, identifier);
                    }
                    else {
                        this.addToken(TokenType.FUNCTION, "function");
                    }
                }
                else if (identifier === "let") {
                    this.addToken(TokenType.VARIABLE, "let");
                }
                else if (identifier === "const") {
                    this.addToken(TokenType.CONST, "const");
                }
                else if (identifier === "return") {
                    this.addToken(TokenType.RETURN, "return");
                }
                else if (identifier === "null") {
                    this.addToken(TokenType.NULL, "null");
                }
                else if (identifier === "false") {
                    this.addToken(TokenType.FALSE, "false");
                }
                else if (identifier === "true") {
                    this.addToken(TokenType.TRUE, "true");
                }
                else if (identifier === "class") {
                    this.addToken(TokenType.CLASS, "class");
                }
                else if (identifier === "if") {
                    this.addToken(TokenType.IF, "if");
                }
                else if (identifier === "else") {
                    this.addToken(TokenType.ELSE, "else");
                }
                else if (identifier === "while") {
                    this.addToken(TokenType.WHILE, "while");
                }
                else if (identifier === "for") {
                    this.addToken(TokenType.FOR, "for");
                }
                else if (identifier === "and") {
                    this.addToken(TokenType.AND, "and");
                }
                else if (identifier === "or") {
                    this.addToken(TokenType.OR, "or");
                }
                else if (identifier === "external") {
                    this.addToken(TokenType.EXTERN, "external");
                }
                else if (identifier === "import") {
                    this.addToken(TokenType.IMPORT, "import");
                }
                else if (identifier === "defer") {
                    this.addToken(TokenType.DEFER, "defer");
                }
                else if (identifier === "struct") {
                    this.addToken(TokenType.STRUCT, "struct");
                }
                else {
                    this.addToken(TokenType.IDENTIFIER, identifier);
                }
                continue;
            }
            else if (this.isInteger(this.currentCharacter)) {
                let number = this.currentCharacter;
                while (true) {
                    if (this.isInteger(this.getNextCharacter())) {
                        this.goForward();
                        number += this.currentCharacter;
                    }
                    else {
                        break;
                    }
                }
                this.addToken(TokenType.INTEGER, number);
                continue;
            }
            else if (this.currentCharacter === "\n") {
                this.currentLine += 1;
                this.currentColumn = 1;
            }
            else if (this.currentCharacter === " " ||
                this.currentCharacter === "\t" ||
                this.currentCharacter === "\r") {
                this.currentColumn += 1;
                continue;
            }
            else {
                (0, errors_1.ThrowFatalError)("Unexpected character found", this.currentLine, this.currentColumn, true);
            }
        }
    }
    isInteger(value) {
        return (!isNaN(value) &&
            (function (x) {
                return (x | 0) === x;
            })(parseFloat(value)));
    }
    isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }
}
exports.Lexer = Lexer;
