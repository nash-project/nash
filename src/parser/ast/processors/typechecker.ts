import { Visitor } from "../visitor";
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
    Expression,
    FunctionDeclarationExpressionArgument,
} from "../expressions";

import {
    BlockStatement,
    ClassStatement,
    ExpressionStatement,
    IfStatement,
    Statement,
    VariableStatement,
    WhileStatement,
    ExternalFunctionDefinitionStatement,
    ReturnStatement,
    StructStatement,
} from "../statements";
import { ThrowFatalError, TypeCheckerError } from "../../../errors";
import {
    Scope,
    ScopeFunction,
    ScopeFunctionArg,
    ScopeVariable,
} from "../../../scope";
import { acceptLiteralTypeForType } from "../../types";
import { Ast } from "../ast";
import { Type } from "../../types";

// This is the file for type checking and also gets all of our scopes.

export class TypeChecker extends Visitor {
    useMyScope: Scope | null = null;
    currentFunction: FunctionDeclarationExpression | null = null;
    currentScope: Scope;
    ast: Ast;
    constructor(ast: Ast) {
        super();
        this.ast = ast;
        this.currentScope = this.ast.scope;
    }
    // Expressions
    binaryExpression(expr: BinaryExpression): Type {
        this.expectType(
            expr.left,
            new Type("integer", true),
            "Binary expression expects both left and right to be integers"
        );
        this.expectType(
            expr.right,
            new Type("integer", true),
            "Binary expression expects both left and right to be integers"
        );
        return new Type("boolean", true);
    }
    groupingExpression(expr: GroupingExpression): Type {
        return expr.expression.accept(this);
    }
    literalExpression(expr: LiteralExpression): Type {
        return new Type(expr.type, true);
    }
    unaryExpression(expr: UnaryExpression): Type {
        return new Type("boolean", true);
    }
    variableExpression(expr: VariableExpression): Type {
        let variable = this.currentScope.findVariable(expr.name.value);
        if (variable) {
            return variable.type;
        } else {
            let func = this.currentScope.findFunction(expr.name.value);

            if (func) {
                return new Type(`${func.type.fullname}`);
            } else {
                throw new TypeCheckerError(
                    `Could not find variable or function with name '${expr.name.value}'`
                );
            }
        }
    }
    assignmentExpression(expr: AssignmentExpression): Type {
        let variable = this.currentScope.findVariable(expr.name.value);
        if (variable) {
            if (variable.isConstant) {
                throw new TypeCheckerError(
                    "You cannot assign a new value to a constant"
                );
            }

            this.expectType(
                expr.value,
                variable.type,
                `You cannot assign a different type value to this variable. Expected '${
                    variable.type
                }', but got '${expr.value.accept(this)}'`
            );
            return variable.type;
        } else {
            throw new TypeCheckerError(
                `Could not find variable with name '${expr.name.value}'`
            );
        }
    }
    logicalExpression(expr: LogicalExpression): Type {
        this.expectType(
            expr.left,
            new Type("boolean", true),
            "Expression expected left and right to be boolean values"
        );
        this.expectType(
            expr.right,
            new Type("boolean", true),
            "Expression expected left and right to be boolean values"
        );
        return new Type("boolean", true);
    }
    callExpression(expr: CallExpression): Type {
        if (expr.callee instanceof VariableExpression) {
        } else {
            ThrowFatalError(
                "Function name not valid when calling function",
                expr.callee.startToken.line,
                expr.callee.startToken.column
            );
        }
        let func: any = this.currentScope.findFunction(
            (expr.callee as VariableExpression).name.value
        );
        if (func) {
            if (expr.args.length != func.args.length) {
                ThrowFatalError(
                    `Expected ${func.args.length} arguments but got ${expr.args.length}`,
                    expr.callee.startToken.line,
                    expr.callee.startToken.column
                );
            }
            expr.args.forEach((arg: Expression, index) => {
                this.expectType(
                    arg,
                    func.args[index].type,
                    "Function call used invalid argument type"
                );
            });
        } else {
            func = this.currentScope.findVariable(
                (expr.callee as VariableExpression).name.value
            );
            if (func) {
                if (func.type.name !== "function") {
                    ThrowFatalError(
                        "You cannot call a variable that is not of type 'function'",
                        expr.callee.startToken.line,
                        expr.callee.startToken.column
                    ); // will never get here, but typescript complained
                }
            } else {
                ThrowFatalError(
                    "Could not find function in scope or parent scopes.",
                    expr.callee.startToken.line,
                    expr.callee.startToken.column
                ); // will never get here, but typescript complained
            }
        }

        if (func.type.name === "function") {
            return func.type.typeArguments[0];
        } else {
            return func.type;
        }
    }
    functionDeclarationExpression(expr: FunctionDeclarationExpression): Type {
        let args: Array<ScopeFunctionArg> = [];
        expr.args.forEach((arg: FunctionDeclarationExpressionArgument) => {
            if (arg.initValue) {
                this.expectType(
                    arg.initValue,
                    arg.type,
                    "Expected function argument init value to be the same type as argument"
                );
            }
            args.push(new ScopeFunctionArg(arg.name, arg.type));
            this.currentScope.addVariable(
                new ScopeVariable(arg.name, arg.type)
            );
        });
        let scope: Scope = new Scope(this.currentScope);
        this.useMyScope = scope;
        expr.args.forEach((arg: FunctionDeclarationExpressionArgument) => {
            scope.addVariable(new ScopeVariable(arg.name, arg.type));
        });
        this.currentFunction = expr;
        expr.block.accept(this);
        this.currentFunction = null;
        this.useMyScope = null;

        this.currentScope.addFunction(
            new ScopeFunction(
                expr.type,
                expr.name
                    ? expr.name
                    : "none" /* It should never get to this, we just do it to shut up the type script compilter. The first validator processor will give it a random name. */,
                args
            )
        );
        return new Type(`function<${expr.type.name}>`);
    }
    //Statements
    returnStatement(statement: ReturnStatement): Type {
        if (!this.currentFunction) {
            ThrowFatalError(
                "Return statement cannot be outside of function",
                statement.value.startToken.line,
                statement.value.startToken.column
            );
        } else {
            /*console.log(
                this.currentFunction.type.typeArguments[0],
                statement.value.accept(this)
            );*/

            this.expectType(
                statement.value,
                this.currentFunction.type.typeArguments[0],
                "Return value type expected to be " +
                    this.currentFunction.type.typeArguments[0].fullname +
                    " but got " +
                    statement.value.accept(this).fullname
            );
        }

        return statement.value.accept(this);
    }
    expressionStatement(statement: ExpressionStatement): void {
        statement.expr.accept(this); // we don't really care about the type
    }
    variableStatement(statement: VariableStatement): void {
        let valueType: Type;
        let variableType: Type;
        if (statement.value) {
            valueType = statement.value.accept(this);
        } else {
            valueType = new Type();
        }
        //console.log(statement.type);

        if (statement.value && !statement.type) {
            statement.type = valueType;
            variableType = statement.type;
        } else if (!statement.type) {
            statement.type = new Type("void");
            variableType = statement.type;
        } else if (statement.value) {
            //console.log(statement.value.accept(this));
            this.expectType(
                statement.value,
                statement.type,
                `Expected '${statement.type.fullname}' value, but got '${
                    statement.value.accept(this).fullname
                }' value`
            );
            variableType = statement.type;
        } else {
            variableType = new Type();
        }
        this.currentScope.addVariable(
            new ScopeVariable(
                statement.name,
                variableType,
                statement.isConstant
            )
        );

        // the return value doesn't actually matter at the moment
    }
    blockStatement(statement: BlockStatement): Scope {
        let newScope = this.useMyScope
            ? this.useMyScope
            : new Scope(this.currentScope);
        this.changeScope(newScope);
        statement.block.forEach((innerSatement: Statement) => {
            innerSatement.accept(this);
        });

        this.changeScope(newScope.parentScope);
        return newScope;
    }

    ifStatement(statement: IfStatement): void {
        this.expectType(
            statement.condition,
            new Type("boolean", true),
            "If statement requires boolean condition"
        );
        statement.block.accept(this);
        statement.elseBlock?.accept(this);
    }

    whileStatement(statement: WhileStatement): void {
        this.expectType(
            statement.condition,
            new Type("boolean", true),
            "If statement requires boolean condition"
        );
        statement.block.accept(this);
    }

    classStatement(statement: ClassStatement): void {}
    externalFunctionDefinitionStatement(
        statement: ExternalFunctionDefinitionStatement
    ) {
        let args: Array<ScopeFunctionArg> = [];
        statement.argTypes.forEach((argType: Type) => {
            args.push(new ScopeFunctionArg("nothing", argType));
        });

        this.currentScope.addFunction(
            new ScopeFunction(
                statement.type,
                statement.name
                    ? statement.name
                    : "none" /* It should never get to this, we just do it to shut up the type script compilter. The first validator processor will give it a random name. */,
                args
            )
        );
        return statement.type;
    }

    expectType(expression: Expression, type: Type, message: string) {
        const expressionType: Type = expression.accept(this);

        if (!acceptLiteralTypeForType(expressionType, type)) {
            ThrowFatalError(
                message,
                expression.startToken.line,
                expression.startToken.column
            );
        }
    }
    changeScope(scope: Scope | null) {
        if (!scope) {
            this.currentScope = this.ast.scope;
            return;
        }
        this.currentScope = scope;
    }
}
