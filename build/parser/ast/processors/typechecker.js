"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeChecker = void 0;
const visitor_1 = require("../visitor");
const expressions_1 = require("../expressions");
const errors_1 = require("../../../errors");
const scope_1 = require("../../../scope");
const types_1 = require("../../types");
const types_2 = require("../../types");
// This is the file for type checking and also gets all of our scopes.
class TypeChecker extends visitor_1.Visitor {
    constructor(ast) {
        super();
        this.useMyScope = null;
        this.currentFunction = null;
        this.ast = ast;
        this.currentScope = this.ast.scope;
    }
    // Expressions
    binaryExpression(expr) {
        this.expectType(expr.left, new types_2.Type("integer", true), "Binary expression expects both left and right to be integers");
        this.expectType(expr.right, new types_2.Type("integer", true), "Binary expression expects both left and right to be integers");
        return new types_2.Type("boolean", true);
    }
    groupingExpression(expr) {
        return expr.expression.accept(this);
    }
    literalExpression(expr) {
        return new types_2.Type(expr.type, true);
    }
    unaryExpression(expr) {
        return new types_2.Type("boolean", true);
    }
    variableExpression(expr) {
        let variable = this.currentScope.findVariable(expr.name.value);
        if (variable) {
            return variable.type;
        }
        else {
            let func = this.currentScope.findFunction(expr.name.value);
            if (func) {
                return new types_2.Type(`${func.type.fullname}`);
            }
            else {
                throw new errors_1.TypeCheckerError(`Could not find variable or function with name '${expr.name.value}'`);
            }
        }
    }
    assignmentExpression(expr) {
        let variable = this.currentScope.findVariable(expr.name.value);
        if (variable) {
            if (variable.isConstant) {
                throw new errors_1.TypeCheckerError("You cannot assign a new value to a constant");
            }
            this.expectType(expr.value, variable.type, `You cannot assign a different type value to this variable. Expected '${variable.type}', but got '${expr.value.accept(this)}'`);
            return variable.type;
        }
        else {
            throw new errors_1.TypeCheckerError(`Could not find variable with name '${expr.name.value}'`);
        }
    }
    logicalExpression(expr) {
        this.expectType(expr.left, new types_2.Type("boolean", true), "Expression expected left and right to be boolean values");
        this.expectType(expr.right, new types_2.Type("boolean", true), "Expression expected left and right to be boolean values");
        return new types_2.Type("boolean", true);
    }
    callExpression(expr) {
        if (expr.callee instanceof expressions_1.VariableExpression) {
        }
        else {
            (0, errors_1.ThrowFatalError)("Function name not valid when calling function", expr.callee.startToken.line, expr.callee.startToken.column);
        }
        let func = this.currentScope.findFunction(expr.callee.name.value);
        if (func) {
            if (expr.args.length != func.args.length) {
                (0, errors_1.ThrowFatalError)(`Expected ${func.args.length} arguments but got ${expr.args.length}`, expr.callee.startToken.line, expr.callee.startToken.column);
            }
            expr.args.forEach((arg, index) => {
                this.expectType(arg, func.args[index].type, "Function call used invalid argument type");
            });
        }
        else {
            func = this.currentScope.findVariable(expr.callee.name.value);
            if (func) {
                if (func.type.name !== "function") {
                    (0, errors_1.ThrowFatalError)("You cannot call a variable that is not of type 'function'", expr.callee.startToken.line, expr.callee.startToken.column); // will never get here, but typescript complained
                }
            }
            else {
                (0, errors_1.ThrowFatalError)("Could not find function in scope or parent scopes.", expr.callee.startToken.line, expr.callee.startToken.column); // will never get here, but typescript complained
            }
        }
        if (func.type.name === "function") {
            return func.type.typeArguments[0];
        }
        else {
            return func.type;
        }
    }
    functionDeclarationExpression(expr) {
        let args = [];
        expr.args.forEach((arg) => {
            if (arg.initValue) {
                this.expectType(arg.initValue, arg.type, "Expected function argument init value to be the same type as argument");
            }
            args.push(new scope_1.ScopeFunctionArg(arg.name, arg.type));
            this.currentScope.addVariable(new scope_1.ScopeVariable(arg.name, arg.type));
        });
        let scope = new scope_1.Scope(this.currentScope);
        this.useMyScope = scope;
        expr.args.forEach((arg) => {
            scope.addVariable(new scope_1.ScopeVariable(arg.name, arg.type));
        });
        this.currentFunction = expr;
        expr.block.accept(this);
        this.currentFunction = null;
        this.useMyScope = null;
        this.currentScope.addFunction(new scope_1.ScopeFunction(expr.type, expr.name
            ? expr.name
            : "none" /* It should never get to this, we just do it to shut up the type script compilter. The first validator processor will give it a random name. */, args));
        return new types_2.Type(`function<${expr.type.name}>`);
    }
    //Statements
    returnStatement(statement) {
        if (!this.currentFunction) {
            (0, errors_1.ThrowFatalError)("Return statement cannot be outside of function", statement.value.startToken.line, statement.value.startToken.column);
        }
        else {
            /*console.log(
                this.currentFunction.type.typeArguments[0],
                statement.value.accept(this)
            );*/
            this.expectType(statement.value, this.currentFunction.type.typeArguments[0], "Return value type expected to be " +
                this.currentFunction.type.typeArguments[0].fullname +
                " but got " +
                statement.value.accept(this).fullname);
        }
        return statement.value.accept(this);
    }
    expressionStatement(statement) {
        statement.expr.accept(this); // we don't really care about the type
    }
    variableStatement(statement) {
        let valueType;
        let variableType;
        if (statement.value) {
            valueType = statement.value.accept(this);
        }
        else {
            valueType = new types_2.Type();
        }
        //console.log(statement.type);
        if (statement.value && !statement.type) {
            statement.type = valueType;
            variableType = statement.type;
        }
        else if (!statement.type) {
            statement.type = new types_2.Type("void");
            variableType = statement.type;
        }
        else if (statement.value) {
            //console.log(statement.value.accept(this));
            this.expectType(statement.value, statement.type, `Expected '${statement.type.fullname}' value, but got '${statement.value.accept(this).fullname}' value`);
            variableType = statement.type;
        }
        else {
            variableType = new types_2.Type();
        }
        this.currentScope.addVariable(new scope_1.ScopeVariable(statement.name, variableType, statement.isConstant));
        // the return value doesn't actually matter at the moment
    }
    blockStatement(statement) {
        let newScope = this.useMyScope
            ? this.useMyScope
            : new scope_1.Scope(this.currentScope);
        this.changeScope(newScope);
        statement.block.forEach((innerSatement) => {
            innerSatement.accept(this);
        });
        this.changeScope(newScope.parentScope);
        return newScope;
    }
    ifStatement(statement) {
        var _a;
        this.expectType(statement.condition, new types_2.Type("boolean", true), "If statement requires boolean condition");
        statement.block.accept(this);
        (_a = statement.elseBlock) === null || _a === void 0 ? void 0 : _a.accept(this);
    }
    whileStatement(statement) {
        this.expectType(statement.condition, new types_2.Type("boolean", true), "If statement requires boolean condition");
        statement.block.accept(this);
    }
    classStatement(statement) { }
    externalFunctionDefinitionStatement(statement) {
        let args = [];
        statement.argTypes.forEach((argType) => {
            args.push(new scope_1.ScopeFunctionArg("nothing", argType));
        });
        this.currentScope.addFunction(new scope_1.ScopeFunction(statement.type, statement.name
            ? statement.name
            : "none" /* It should never get to this, we just do it to shut up the type script compilter. The first validator processor will give it a random name. */, args));
        return statement.type;
    }
    expectType(expression, type, message) {
        const expressionType = expression.accept(this);
        if (!(0, types_1.acceptLiteralTypeForType)(expressionType, type)) {
            (0, errors_1.ThrowFatalError)(message, expression.startToken.line, expression.startToken.column);
        }
    }
    changeScope(scope) {
        if (!scope) {
            this.currentScope = this.ast.scope;
            return;
        }
        this.currentScope = scope;
    }
}
exports.TypeChecker = TypeChecker;
