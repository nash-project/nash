import { VariableDeclaration } from "typescript";
import { Ast } from "../../parser/ast/ast";
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
    FunctionDeclarationExpressionArgument,
    Expression,
} from "../../parser/ast/expressions";

import {
    BlockStatement,
    ClassStatement,
    ExpressionStatement,
    IfStatement,
    VariableStatement,
    WhileStatement,
    Statement,
    ExternalFunctionDefinitionStatement,
    ReturnStatement,
    DeferStatement,
    StructStatement,
    DataDefinitionBlock,
} from "../../parser/ast/statements";
import { Visitor } from "../../parser/ast/visitor";
import { isPrimitiveType, primitiveToCType, Type } from "../../parser/types";

function structValueInit(this: any, vName: string, gen: CBackendGenerator) {
    this.statement.block.forEach((statement: Statement) => {
        if (statement instanceof VariableStatement) {
            if ((statement as VariableStatement).value) {
                gen.addOutput(`${vName}.${statement.name} = `);
                statement.value?.accept(gen);
                gen.addOutput(";\n");
            }
        } else {
            gen.addOutput(
                `${vName}.${
                    (
                        (statement as ExpressionStatement)
                            .expr as FunctionDeclarationExpression
                    ).name
                } = ${
                    (
                        (statement as ExpressionStatement)
                            .expr as FunctionDeclarationExpression
                    ).anonFunction
                }`
            );

            gen.addOutput(";\n");
        }
    });
}

class ComplexType {
    name: string;
    isStruct: boolean = false;
    typeInitFunction: Function;
    statement: Statement;
    constructor(
        name: string,
        isStruct = false,
        typeInitFunction = function (
            this: any,
            vName: string,
            gen: CBackendGenerator
        ) {},
        statement: Statement
    ) {
        this.name = name;
        this.isStruct = isStruct;
        this.typeInitFunction = typeInitFunction;
        this.statement = statement;
    }
}

export class CBackendGenerator extends Visitor {
    output: string = "";
    ast: Ast;
    complexTypes: Map<string, ComplexType>;

    constructor(ast: Ast) {
        super();
        this.ast = ast;
        this.complexTypes = new Map<string, ComplexType>();
    }
    generate() {
        this.ast.ast.forEach((statement: Statement) => {
            statement.accept(this);
        });
        console.log(this.complexTypes);
    }
    binaryExpression(expr: BinaryExpression) {
        expr.left.accept(this);
        this.addOutput(expr.operator.value);
        expr.right.accept(this);
    }
    groupingExpression(expr: GroupingExpression) {
        this.addOutput("(");
        expr.expression.accept(this);
        this.addOutput(")");
    }
    literalExpression(expr: LiteralExpression) {
        if (expr.type === "integer") {
            this.addOutput(expr.value);
        } else if (expr.type === "boolean") {
            this.addOutput(expr.value);
        } else if (expr.type === "string") {
            this.addOutput(`"${expr.value}"`);
        }
    }
    unaryExpression(expr: UnaryExpression) {
        this.addOutput(expr.operator.value);
        expr.right.accept(this);
    }
    variableExpression(expr: VariableExpression) {
        this.addOutput(expr.name.value);
    }
    assignmentExpression(expr: AssignmentExpression) {
        this.addOutput(`${expr.name.value}=`);
        expr.value.accept(this);
    }
    logicalExpression(expr: LogicalExpression) {}
    callExpression(expr: CallExpression) {
        expr.callee.accept(this);
        this.addOutput("(");
        expr.args.forEach((args: Expression, index: number) => {
            args.accept(this);
            if (index < expr.args.length - 1) {
                this.addOutput(",");
            }
        });
        this.addOutput(")");
    }
    functionDeclarationExpression(expr: FunctionDeclarationExpression) {
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
    externalFunctionDefinitionStatement(
        statement: ExternalFunctionDefinitionStatement
    ) {
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
    deferStatement(statement: DeferStatement): void {
        statement.block.accept(this);
    }
    returnStatement(statement: ReturnStatement): void {
        this.addOutput("return ");
        statement.value.accept(this);
        this.addOutput(";\n");
    }
    expressionStatement(statement: ExpressionStatement) {
        statement.expr.accept(this);
        this.addOutput(";\n");
    }
    variableStatement(statement: VariableStatement) {
        if (statement.isConstant) {
            this.addOutput("const ");
        }

        if (statement.type?.name === "function") {
            const returnType = this.typeToCType(
                statement.type.typeArguments[0]
            );
            this.addOutput(`${returnType} (*${statement.name})()`);
        } else {
            // @ts-ignore
            const type = this.typeToCType(statement.type);
            this.addOutput(`${type} ${statement.name}`);
        }

        if (statement.value) {
            this.addOutput("=");
            statement.value.accept(this);
        }
        this.addOutput(";\n");
        const complexT = this.typeIsComplex(statement.type as Type);
        if (complexT) {
            complexT.typeInitFunction(statement.name, this);
        }
    }
    blockStatement(statement: BlockStatement) {
        this.addOutput("{\n");
        statement.block.forEach((statement: Statement) => {
            statement.accept(this);
        });
        this.addOutput("}");
    }
    ifStatement(statement: IfStatement) {
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
    dataDefinitionBlock(statement: DataDefinitionBlock): void {
        statement.block.forEach((statement) => {
            if (
                statement instanceof ExpressionStatement &&
                statement.expr instanceof FunctionDeclarationExpression
            ) {
                const returnType = this.typeToCType(
                    statement.expr.type.typeArguments[0]
                );
                this.addOutput(
                    `\t${returnType} (*${statement.expr.name})();\n`
                );
            } else {
                //@ts-ignore
                const type = this.typeToCType(statement.type);
                //@ts-ignore
                this.addOutput(`\t${type} ${statement.name};\n`);
            }
        });
    }

    structStatement(statement: StructStatement): void {
        this.complexTypes.set(
            statement.name.value,
            new ComplexType(
                statement.name.value,
                true,
                structValueInit,
                statement.block
            )
        );
        this.addOutput(`struct ${statement.name.value}{\n`);
        statement.block.accept(this);
        this.addOutput("};\n");
    }
    whileStatement(statement: WhileStatement) {}
    classStatement(statement: ClassStatement) {}
    addOutput(output: string) {
        this.output += output;
    }
    typeIsComplex(type: Type): ComplexType | null {
        const t = this.complexTypes.get(type.name);
        if (t) {
            return t;
        } else {
            return null;
        }
    }
    typeToCType(type: Type): string {
        let complexT = this.typeIsComplex(type);
        if (isPrimitiveType(type)) {
            return primitiveToCType(type);
        } else if (complexT) {
            if (complexT.isStruct) {
                return "struct " + complexT.name;
            } else {
                return complexT.name;
            }
        } else {
            return "void";
        }
    }
}
