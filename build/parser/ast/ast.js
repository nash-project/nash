"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ast = void 0;
const processors_1 = require("./processors");
const scope_1 = require("../../scope");
const util = require("util");
class Ast {
    constructor(ast, processor = null) {
        this.processor = null;
        this.ast = ast;
        this.processor = processor;
        this.scope = new scope_1.Scope(null); // top level
    }
    setupProcessor(processors) {
        this.processor = new processors_1.AstProcessor(processors);
    }
    printAst() {
        console.log(util.inspect(this.ast, false, null, true /* enable colors */));
    }
    processAst() {
        var _a;
        (_a = this.processor) === null || _a === void 0 ? void 0 : _a.processAst(this.ast);
    }
    setScope(scope) {
        this.scope = scope;
    }
}
exports.Ast = Ast;
