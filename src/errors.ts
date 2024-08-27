import { Token } from "./lexer";
import pc from "picocolors";
const readline = require("readline");
const fs = require("fs");

export class LexerError extends Error {
    constructor(message: string) {
        super(message);
    }
}
export class ParserError extends Error {
    constructor(message: string, token: Token | null = null) {
        let nmessage = `${message}`;
        if (token) {
            nmessage = `${nmessage}. Line: ${token.line} Column: ${token.column}`;
        }
        super(nmessage);
    }
}
export class TypeCheckerError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export function ThrowFatalError(
    message: string,
    row: number,
    column: number,
    single = false
) {
    let codeLine = globalThis.inputCode.split("\n")[row - 1];
    let arrowPosition = 4 + row.toString().length + 2 + column - 1;
    let arrow = "^";
    if (!single) {
        arrow = arrow.repeat(3);
    }
    console.log(
        `${pc.cyan(globalThis.inputFile)}${pc.yellow(
            `${pc.white(":")}${row}${pc.white(":")}${column}`
        )} ${pc.green("-")} ${pc.red("error:")} ${pc.green(message + ".")}

${pc.bgMagenta(pc.white(` ${row} `))}    ${codeLine}
${" ".repeat(arrowPosition)}${pc.red(arrow)}`
    );
    process.exit(1);
}
