import { Statement } from "./statements";
import { Visitor } from "./visitor";
export class AstProcessor {
    processors: Array<Visitor>;
    constructor(processors: Array<Visitor>) {
        this.processors = processors;
    }
    processAst(ast: Array<Statement>) {
        this.processors.forEach((processor: Visitor) => {
            ast.forEach((statement: Statement) => {
                statement.accept(processor);
            });
        });
    }
}
