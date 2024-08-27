"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeCheckerError = exports.ParserError = exports.LexerError = void 0;
exports.ThrowFatalError = ThrowFatalError;
const picocolors_1 = __importDefault(require("picocolors"));
const readline = require("readline");
const fs = require("fs");
class LexerError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.LexerError = LexerError;
class ParserError extends Error {
    constructor(message, token = null) {
        let nmessage = `${message}`;
        if (token) {
            nmessage = `${nmessage}. Line: ${token.line} Column: ${token.column}`;
        }
        super(nmessage);
    }
}
exports.ParserError = ParserError;
class TypeCheckerError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.TypeCheckerError = TypeCheckerError;
function ThrowFatalError(message, row, column, single = false) {
    let codeLine = globalThis.inputCode.split("\n")[row - 1];
    let arrowPosition = 4 + row.toString().length + 2 + column - 1;
    let arrow = "^";
    if (!single) {
        arrow = arrow.repeat(3);
    }
    console.log(`${picocolors_1.default.cyan(globalThis.inputFile)}${picocolors_1.default.yellow(`${picocolors_1.default.white(":")}${row}${picocolors_1.default.white(":")}${column}`)} ${picocolors_1.default.green("-")} ${picocolors_1.default.red("error:")} ${picocolors_1.default.green(message + ".")}

${picocolors_1.default.bgMagenta(picocolors_1.default.white(` ${row} `))}    ${codeLine}
${" ".repeat(arrowPosition)}${picocolors_1.default.red(arrow)}`);
    process.exit(1);
}
