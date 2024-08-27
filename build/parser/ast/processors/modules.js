"use strict";
// This file will inject the module into the current ast
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modules = void 0;
const visitor_1 = require("../visitor");
const fs = require("node:fs");
class Modules extends visitor_1.Visitor {
    // Expressions
    binaryExpression(expr) { }
    groupingExpression(expr) { }
    literalExpression(expr) { }
    unaryExpression(expr) { }
    variableExpression(expr) { }
    assignmentExpression(expr) { }
    logicalExpression(expr) { }
    callExpression(expr) { }
    functionDeclarationExpression(expr) { }
    //Statements
    expressionStatement(statement) { }
    variableStatement(statement) { }
    blockStatement(statement) {
        statement.block.forEach((innerStatement) => {
            innerStatement.accept(this);
        });
    }
    ifStatement(statement) { }
    whileStatement(statement) { }
    classStatement(statement) { }
    externalFunctionDefinitionStatement(statement) { }
    importModuleStatement(statement) { }
}
exports.Modules = Modules;
