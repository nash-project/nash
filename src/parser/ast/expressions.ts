import { Token } from "../../lexer";
import { Type } from "../types";
import { BlockStatement, Statement } from "./statements";
import { Visitor } from "./visitor";
export class Expression {
    expectSemiColon: boolean = true;
    startToken: Token;
    accept(visitor: Visitor): any {}
    constructor(startToken: Token) {
        this.startToken = startToken;
    }
}
export class BinaryExpression extends Expression {
    left: Expression;
    right: Expression;
    operator: Token;
    constructor(
        startToken: Token,
        left: Expression,
        operator: Token,
        right: Expression
    ) {
        super(startToken);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor: Visitor): any {
        return visitor.binaryExpression(this);
    }
}
export class GroupingExpression extends Expression {
    expression: Expression;
    constructor(startToken: Token, expression: Expression) {
        super(startToken);
        this.expression = expression;
    }
    accept(visitor: Visitor): any {
        return visitor.groupingExpression(this);
    }
}
export class LiteralExpression extends Expression {
    value: any;
    type: string;
    constructor(startToken: Token, value: any, type: string) {
        super(startToken);
        this.value = value;
        this.type = type;
    }
    accept(visitor: Visitor): any {
        return visitor.literalExpression(this);
    }
}
export class UnaryExpression extends Expression {
    operator: Token;
    right: Expression;
    constructor(startToken: Token, operator: Token, right: Expression) {
        super(startToken);
        this.operator = operator;
        this.right = right;
    }
    accept(visitor: Visitor): any {
        return visitor.unaryExpression(this);
    }
}
export class VariableExpression extends Expression {
    name: Token;
    constructor(startToken: Token, name: Token) {
        super(startToken);
        this.name = name;
    }
    accept(visitor: Visitor): any {
        return visitor.variableExpression(this);
    }
}

export class AssignmentExpression extends Expression {
    name: Token;
    value: Expression;
    constructor(startToken: Token, name: Token, value: Expression) {
        super(startToken);
        this.name = name;
        this.value = value;
    }
    accept(visitor: Visitor): any {
        return visitor.assignmentExpression(this);
    }
}
export class LogicalExpression extends Expression {
    left: Expression;
    right: Expression;
    operator: Token;
    constructor(
        startToken: Token,
        left: Expression,
        operator: Token,
        right: Expression
    ) {
        super(startToken);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor: Visitor): any {
        return visitor.logicalExpression(this);
    }
}
export class CallExpression extends Expression {
    callee: Expression;
    args: Array<Expression>;
    constructor(
        startToken: Token,
        callee: Expression,
        args: Array<Expression>
    ) {
        super(startToken);
        this.callee = callee;
        this.args = args;
    }
    accept(visitor: Visitor): any {
        return visitor.callExpression(this);
    }
}

export class FunctionDeclarationExpressionArgument {
    name: string;
    type: Type;
    initValue: Expression | null;
    constructor(name: string, initValue: Expression | null, type: Type) {
        this.name = name;
        this.type = type;
        this.initValue = initValue;
    }
}

export class FunctionDeclarationExpression extends Expression {
    block: Statement;
    name: string | null;
    args: Array<FunctionDeclarationExpressionArgument>;
    type: Type;
    anonFunction: string = "";
    expectSemiColon: boolean = false;

    constructor(
        startToken: Token,
        name: string | null,
        args: Array<FunctionDeclarationExpressionArgument>,
        type: Type,
        block: Statement
    ) {
        super(startToken);
        this.block = block;
        this.name = name;
        this.args = args;
        this.type = type;
    }
    accept(visitor: Visitor): any {
        return visitor.functionDeclarationExpression(this);
    }
}
