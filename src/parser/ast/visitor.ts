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
} from "./expressions";

import {
    BlockStatement,
    ClassStatement,
    ExpressionStatement,
    IfStatement,
    VariableStatement,
    WhileStatement,
    ExternalFunctionDefinitionStatement,
    ImportModuleStatement,
    ReturnStatement,
    DeferStatement,
    DataDefinitionBlock,
    StructStatement,
} from "./statements";

export class Visitor {
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
    blockStatement(statement: BlockStatement) {}
    ifStatement(statement: IfStatement) {}
    whileStatement(statement: WhileStatement) {}
    classStatement(statement: ClassStatement) {}
    externalFunctionDefinitionStatement(
        statement: ExternalFunctionDefinitionStatement
    ) {}
    importModuleStatement(statement: ImportModuleStatement) {}
    returnStatement(statement: ReturnStatement) {}
    deferStatement(statement: DeferStatement) {}
    dataDefinitionBlock(statement: DataDefinitionBlock) {}
    structStatement(statement: StructStatement) {}
}
