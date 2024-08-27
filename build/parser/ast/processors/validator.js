"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const errors_1 = require("../../../errors");
const statements_1 = require("../statements");
const visitor_1 = require("../visitor");
const fs = require("node:fs");
class Validator extends visitor_1.Visitor {
    constructor() {
        super(...arguments);
        this.currentFunction = null;
        this.blockStatementIndex = 0;
    }
    // Expressions
    binaryExpression(expr) { }
    groupingExpression(expr) { }
    literalExpression(expr) { }
    unaryExpression(expr) { }
    variableExpression(expr) { }
    assignmentExpression(expr) { }
    logicalExpression(expr) { }
    callExpression(expr) { }
    functionDeclarationExpression(expr) {
        this.currentFunction = expr;
        expr.block.accept(this);
        this.currentFunction = null;
    }
    //Statements
    deferStatement(statement) {
        var _a;
        if (statement.dontMoveMe) {
            return;
        }
        if (this.currentFunction) {
            if (((_a = this.currentFunction) === null || _a === void 0 ? void 0 : _a.block) instanceof statements_1.BlockStatement) {
                let block = this.currentFunction.block;
                // Current Element
                block.block.splice(this.blockStatementIndex, 1);
                block.block.push(statement);
                statement.dontMoveMe = true;
            }
            else {
                (0, errors_1.ThrowFatalError)("You should not use defer outside of a block", statement.startingToken.line, statement.startingToken.column);
            }
        }
        else {
            (0, errors_1.ThrowFatalError)("You cannot use defer outside of function", statement.startingToken.line, statement.startingToken.column);
        }
    }
    expressionStatement(statement) {
        statement.expr.accept(this);
    }
    variableStatement(statement) {
        var _a;
        (_a = statement.value) === null || _a === void 0 ? void 0 : _a.accept(this);
    }
    blockStatement(statement) {
        statement.block.forEach((innerStatement) => {
            innerStatement.accept(this);
            this.blockStatementIndex += 1;
        });
        this.blockStatementIndex = 0;
    }
    ifStatement(statement) {
        statement.condition.accept(this);
        statement.block.accept(this);
    }
    whileStatement(statement) {
        statement.condition.accept(this);
        statement.block.accept(this);
    }
    classStatement(statement) { }
    externalFunctionDefinitionStatement(statement) { }
    importModuleStatement(statement) {
        if (!fs.existsSync(statement.path + ".nash")) {
            (0, errors_1.ThrowFatalError)(`Could not find module '${statement.path.replace(new RegExp("/", "g"), "::")}'`, statement.startToken.line, statement.startToken.column);
        }
    }
}
exports.Validator = Validator;
