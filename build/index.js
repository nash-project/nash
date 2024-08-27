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
const generator_1 = require("./backend/c/generator");
const lexer_1 = require("./lexer");
const typechecker_1 = require("./parser/ast/processors/typechecker");
const parser_1 = require("./parser/parser");
const fs = __importStar(require("fs"));
const validator_1 = require("./parser/ast/processors/validator");
const { exec } = require("child_process");
class Compiler {
    constructor() {
        this.input = "";
    }
    compile(file) {
        this.readFromFile(file);
        const ast = this.getAst();
        this._compile(ast);
    }
    getAst() {
        const lexer = new lexer_1.Lexer(this.input);
        lexer.lex();
        const tokens = lexer.tokens;
        const parser = new parser_1.Parser(tokens);
        const ast = parser.parse();
        ast.setupProcessor([new validator_1.Validator(), new typechecker_1.TypeChecker(ast)]);
        ast.processAst();
        //ast.printAst();
        return ast;
    }
    readFromFile(file) {
        const data = fs.readFileSync(file, "utf8");
        globalThis.inputCode = data;
        this.input = data;
        globalThis.inputFile = file;
    }
    _compile(ast) {
        const cGenerator = new generator_1.CBackendGenerator(ast);
        cGenerator.generate();
        //console.log(cGenerator.output);
        fs.writeFileSync("output.c", cGenerator.output);
        exec(".\\tcc\\tcc output.c", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    }
}
const compiler = new Compiler();
try {
    if (process.argv.length === 2) {
        console.error("Expected at least one argument!");
        process.exit(1);
    }
    const output = compiler.compile(process.argv[2]);
}
catch (err) {
    console.error(err);
}
