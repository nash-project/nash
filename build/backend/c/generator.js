"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CBackendGenerator = void 0;
const expressions_1 = require("../../parser/ast/expressions");
const statements_1 = require("../../parser/ast/statements");
const visitor_1 = require("../../parser/ast/visitor");
const types_1 = require("../../parser/types");
function structValueInit(vName, gen) {
    this.statement.block.forEach((statement) => {
        var _a;
        if (statement instanceof statements_1.VariableStatement) {
            if (statement.value) {
                gen.addOutput(`${vName}.${statement.name} = `);
                (_a = statement.value) === null || _a === void 0 ? void 0 : _a.accept(gen);
                gen.addOutput(";\n");
            }
        }
        else {
            gen.addOutput(`${vName}.${statement
                .expr.name} = ${statement
                .expr.anonFunction}`);
            gen.addOutput(";\n");
        }
    });
}
class ComplexType {
    constructor(name, isStruct = false, typeInitFunction = function (vName, gen) { }, statement) {
        this.isStruct = false;
        this.name = name;
        this.isStruct = isStruct;
        this.typeInitFunction = typeInitFunction;
        this.statement = statement;
    }
}
class CBackendGenerator extends visitor_1.Visitor {
    constructor(ast) {
        super();
        this.output = "";
        this.ast = ast;
        this.complexTypes = new Map();
    }
    generate() {
        this.ast.ast.forEach((statement) => {
            statement.accept(this);
        });
        console.log(this.complexTypes);
    }
    binaryExpression(expr) {
        expr.left.accept(this);
        this.addOutput(expr.operator.value);
        expr.right.accept(this);
    }
    groupingExpression(expr) {
        this.addOutput("(");
        expr.expression.accept(this);
        this.addOutput(")");
    }
    literalExpression(expr) {
        if (expr.type === "integer") {
            this.addOutput(expr.value);
        }
        else if (expr.type === "boolean") {
            this.addOutput(expr.value);
        }
        else if (expr.type === "string") {
            this.addOutput(`"${expr.value}"`);
        }
    }
    unaryExpression(expr) {
        this.addOutput(expr.operator.value);
        expr.right.accept(this);
    }
    variableExpression(expr) {
        this.addOutput(expr.name.value);
    }
    assignmentExpression(expr) {
        this.addOutput(`${expr.name.value}=`);
        expr.value.accept(this);
    }
    logicalExpression(expr) { }
    callExpression(expr) {
        expr.callee.accept(this);
        this.addOutput("(");
        expr.args.forEach((args, index) => {
            args.accept(this);
            if (index < expr.args.length - 1) {
                this.addOutput(",");
            }
        });
        this.addOutput(")");
    }
    functionDeclarationExpression(expr) {
        const type = this.typeToCType(expr.type.typeArguments[0]);
        this.addOutput(`${type} ${expr.name}(`);
        expr.args.forEach((arg, index) => {
            let argType = this.typeToCType(arg.type);
            this.addOutput(`${argType} ${arg.name}`);
            if (index < expr.args.length - 1) {
                this.addOutput(",");
            }
        });
        this.addOutput(")");
        expr.block.accept(this);
    }
    externalFunctionDefinitionStatement(statement) {
        const type = this.typeToCType(statement.type);
        this.addOutput(`extern ${type} ${statement.name}(`);
        statement.argTypes.forEach((arg, index) => {
            let argType = this.typeToCType(arg);
            this.addOutput(`${argType}`);
            if (index < statement.argTypes.length - 1) {
                this.addOutput(",");
            }
        });
        this.addOutput(");\n");
    }
    //Statements
    deferStatement(statement) {
        statement.block.accept(this);
    }
    returnStatement(statement) {
        this.addOutput("return ");
        statement.value.accept(this);
        this.addOutput(";\n");
    }
    expressionStatement(statement) {
        statement.expr.accept(this);
        this.addOutput(";\n");
    }
    variableStatement(statement) {
        var _a;
        if (statement.isConstant) {
            this.addOutput("const ");
        }
        if (((_a = statement.type) === null || _a === void 0 ? void 0 : _a.name) === "function") {
            const returnType = this.typeToCType(statement.type.typeArguments[0]);
            this.addOutput(`${returnType} (*${statement.name})()`);
        }
        else {
            // @ts-ignore
            const type = this.typeToCType(statement.type);
            this.addOutput(`${type} ${statement.name}`);
        }
        if (statement.value) {
            this.addOutput("=");
            statement.value.accept(this);
        }
        this.addOutput(";\n");
        const complexT = this.typeIsComplex(statement.type);
        if (complexT) {
            complexT.typeInitFunction(statement.name, this);
        }
    }
    blockStatement(statement) {
        this.addOutput("{\n");
        statement.block.forEach((statement) => {
            statement.accept(this);
        });
        this.addOutput("}");
    }
    ifStatement(statement) {
        this.addOutput("if (");
        statement.condition.accept(this);
        this.addOutput("){\n");
        statement.block.accept(this);
        this.addOutput("}\n");
        if (statement.elseBlock) {
            this.addOutput("else{\n");
            statement.elseBlock.accept(this);
            this.addOutput("}\n");
        }
    }
    dataDefinitionBlock(statement) {
        statement.block.forEach((statement) => {
            if (statement instanceof statements_1.ExpressionStatement &&
                statement.expr instanceof expressions_1.FunctionDeclarationExpression) {
                const returnType = this.typeToCType(statement.expr.type.typeArguments[0]);
                this.addOutput(`\t${returnType} (*${statement.expr.name})();\n`);
            }
            else {
                //@ts-ignore
                const type = this.typeToCType(statement.type);
                //@ts-ignore
                this.addOutput(`\t${type} ${statement.name};\n`);
            }
        });
    }
    structStatement(statement) {
        this.complexTypes.set(statement.name.value, new ComplexType(statement.name.value, true, structValueInit, statement.block));
        this.addOutput(`struct ${statement.name.value}{\n`);
        statement.block.accept(this);
        this.addOutput("};\n");
    }
    whileStatement(statement) { }
    classStatement(statement) { }
    addOutput(output) {
        this.output += output;
    }
    typeIsComplex(type) {
        const t = this.complexTypes.get(type.name);
        if (t) {
            return t;
        }
        else {
            return null;
        }
    }
    typeToCType(type) {
        let complexT = this.typeIsComplex(type);
        if ((0, types_1.isPrimitiveType)(type)) {
            return (0, types_1.primitiveToCType)(type);
        }
        else if (complexT) {
            if (complexT.isStruct) {
                return "struct " + complexT.name;
            }
            else {
                return complexT.name;
            }
        }
        else {
            return "void";
        }
    }
}
exports.CBackendGenerator = CBackendGenerator;
