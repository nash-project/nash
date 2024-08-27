"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visitor = void 0;
class Visitor {
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
    blockStatement(statement) { }
    ifStatement(statement) { }
    whileStatement(statement) { }
    classStatement(statement) { }
    externalFunctionDefinitionStatement(statement) { }
    importModuleStatement(statement) { }
    returnStatement(statement) { }
    deferStatement(statement) { }
    dataDefinitionBlock(statement) { }
    structStatement(statement) { }
}
exports.Visitor = Visitor;
