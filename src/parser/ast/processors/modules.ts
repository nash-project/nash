// This file will inject the module into the current ast

import { ThrowFatalError } from "../../../errors";
import {
    BinaryExpression,
    GroupingExpression,
    LiteralExpression,
    UnaryExpression,
    VariableExpression,
    AssignmentExpression,
    LogicalExpression,
    CallExpression,
    FunctionDeclarationExpression,
} from "../expressions";

import {
    BlockStatement,
    ClassStatement,
    ExpressionStatement,
    IfStatement,
    VariableStatement,
    WhileStatement,
    ExternalFunctionDefinitionStatement,
    ImportModuleStatement,
    Statement,
} from "../statements";
import { Visitor } from "../visitor";
const fs = require("node:fs");
export class Modules extends Visitor {
    // Expressions
    binaryExpression(expr: BinaryExpression) {}
    groupingExpression(expr: GroupingExpression) {}
    literalExpression(expr: LiteralExpression) {}
    unaryExpression(expr: UnaryExpression) {}
    variableExpression(expr: VariableExpression) {}
    assignmentExpression(expr: AssignmentExpression) {}
    logicalExpression(expr: LogicalExpression) {}
    callExpression(expr: CallExpression) {}
    functionDeclarationExpression(expr: FunctionDeclarationExpression) {}
    //Statements
    expressionStatement(statement: ExpressionStatement) {}
    variableStatement(statement: VariableStatement) {}
    blockStatement(statement: BlockStatement) {
        statement.block.forEach((innerStatement: Statement) => {
            innerStatement.accept(this);
        });
    }
    ifStatement(statement: IfStatement) {}
    whileStatement(statement: WhileStatement) {}
    classStatement(statement: ClassStatement) {}
    externalFunctionDefinitionStatement(
        statement: ExternalFunctionDefinitionStatement
    ) {}
    importModuleStatement(statement: ImportModuleStatement) {}
}
