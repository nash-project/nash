import { AstProcessor } from "./processors";
import { Statement } from "./statements";
import { Visitor } from "./visitor";
import { Scope } from "../../scope";
const util = require("util");
export class Ast {
    ast: Array<Statement>;
    scope: Scope;
    processor: AstProcessor | null = null;
    constructor(ast: Array<Statement>, processor: AstProcessor | null = null) {
        this.ast = ast;
        this.processor = processor;
        this.scope = new Scope(null); // top level
    }
    setupProcessor(processors: Array<Visitor>) {
        this.processor = new AstProcessor(processors);
    }
    printAst() {
        console.log(
            util.inspect(this.ast, false, null, true /* enable colors */)
        );
    }
    processAst() {
        this.processor?.processAst(this.ast);
    }
    setScope(scope: Scope) {
        this.scope = scope;
    }
}
