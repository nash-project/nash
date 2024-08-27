"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstProcessor = void 0;
class AstProcessor {
    constructor(processors) {
        this.processors = processors;
    }
    processAst(ast) {
        this.processors.forEach((processor) => {
            ast.forEach((statement) => {
                statement.accept(processor);
            });
        });
    }
}
exports.AstProcessor = AstProcessor;
