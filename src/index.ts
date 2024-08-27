import { CBackendGenerator } from "./backend/c/generator";
import { Lexer } from "./lexer";
import { TypeChecker } from "./parser/ast/processors/typechecker";
import { Parser } from "./parser/parser";
import * as fs from "fs";
import { Validator } from "./parser/ast/processors/validator";
import { Ast } from "./parser/ast/ast";
const { exec } = require("child_process");
declare global {
    var inputFile: string;
    var inputCode: string;
}

class Compiler {
    input: string = "";
    compile(file: string) {
        this.readFromFile(file);
        const ast = this.getAst();
        this._compile(ast);
    }
    getAst(): Ast {
        const lexer = new Lexer(this.input);
        lexer.lex();
        const tokens = lexer.tokens;
        const parser = new Parser(tokens);
        const ast = parser.parse();
        ast.setupProcessor([new Validator(), new TypeChecker(ast)]);
        ast.processAst();
        //ast.printAst();
        return ast;
    }
    readFromFile(file: string) {
        const data = fs.readFileSync(file, "utf8");
        globalThis.inputCode = data;
        this.input = data;
        globalThis.inputFile = file;
    }
    _compile(ast: Ast) {
        const cGenerator: CBackendGenerator = new CBackendGenerator(ast);
        cGenerator.generate();
        //console.log(cGenerator.output);

        fs.writeFileSync("output.c", cGenerator.output);
        exec(".\\tcc\\tcc output.c", (error: any, stdout: any, stderr: any) => {
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
} catch (err) {
    console.error(err);
}
