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
    DeferStatement,
} from "../statements";
import { Visitor } from "../visitor";
const fs = require("node:fs");
export class Validator extends Visitor {
    currentFunction: FunctionDeclarationExpression | null = null;
    blockStatementIndex: number = 0;
    // Expressions
    binaryExpression(expr: BinaryExpression) {}
    groupingExpression(expr: GroupingExpression) {}
    literalExpression(expr: LiteralExpression) {}
    unaryExpression(expr: UnaryExpression) {}
    variableExpression(expr: VariableExpression) {}
    assignmentExpression(expr: AssignmentExpression) {}
    logicalExpression(expr: LogicalExpression) {}
    callExpression(expr: CallExpression) {}
    functionDeclarationExpression(expr: FunctionDeclarationExpression) {
        this.currentFunction = expr;
        expr.block.accept(this);
        this.currentFunction = null;
    }
    //Statements
    deferStatement(statement: DeferStatement): void {
        if (statement.dontMoveMe) {
            return;
        }
        if (this.currentFunction) {
            if (this.currentFunction?.block instanceof BlockStatement) {
                let block = this.currentFunction.block as BlockStatement;
                // Current Element
                block.block.splice(this.blockStatementIndex, 1);

                block.block.push(statement);
                statement.dontMoveMe = true;
            } else {
                ThrowFatalError(
                    "You should not use defer outside of a block",
                    statement.startingToken.line,
                    statement.startingToken.column
                );
            }
        } else {
            ThrowFatalError(
                "You cannot use defer outside of function",
                statement.startingToken.line,
                statement.startingToken.column
            );
        }
    }
    expressionStatement(statement: ExpressionStatement) {
        statement.expr.accept(this);
    }
    variableStatement(statement: VariableStatement) {
        statement.value?.accept(this);
    }
    blockStatement(statement: BlockStatement) {
        statement.block.forEach((innerStatement: Statement) => {
            innerStatement.accept(this);
            this.blockStatementIndex += 1;
        });
        this.blockStatementIndex = 0;
    }
    ifStatement(statement: IfStatement) {
        statement.condition.accept(this);
        statement.block.accept(this);
    }
    whileStatement(statement: WhileStatement) {
        statement.condition.accept(this);
        statement.block.accept(this);
    }
    classStatement(statement: ClassStatement) {}
    externalFunctionDefinitionStatement(
        statement: ExternalFunctionDefinitionStatement
    ) {}
    importModuleStatement(statement: ImportModuleStatement) {
        if (!fs.existsSync(statement.path + ".nash")) {
            ThrowFatalError(
                `Could not find module '${statement.path.replace(
                    new RegExp("/", "g"),
                    "::"
                )}'`,
                statement.startToken.line,
                statement.startToken.column
            );
        }
    }
}
