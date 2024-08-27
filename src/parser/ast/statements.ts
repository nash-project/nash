import { Token } from "../../lexer";
import { Type } from "../types";
import { Expression } from "./expressions";
import { Visitor } from "./visitor";
export class Statement {
    expectSemiColon: boolean = true;
    accept(visitor: Visitor): any {}
}

export class ExpressionStatement extends Statement {
    expr: Expression;
    constructor(expr: Expression) {
        super();
        this.expr = expr;
    }
    accept(visitor: Visitor): any {
        return visitor.expressionStatement(this);
    }
}
export class VariableStatement extends Statement {
    name: string;
    type: Type | null;
    value: Expression | null;
    isConstant: boolean;
    constructor(
        name: string,
        type: Type | null,
        value: Expression | null,
        isConstant: boolean
    ) {
        super();
        this.name = name;
        this.type = type;
        this.value = value;
        this.isConstant = isConstant;
    }
    accept(visitor: Visitor): any {
        return visitor.variableStatement(this);
    }
}
export class BlockStatement extends Statement {
    block: Array<Statement>;
    constructor(block: Array<Statement>) {
        super();
        this.block = block;
    }
    accept(visitor: Visitor): any {
        return visitor.blockStatement(this);
    }
}
export class IfStatement extends Statement {
    condition: Expression;
    block: Statement;
    elseBlock: Statement | null;
    constructor(
        condition: Expression,
        block: Statement,
        elseBlock: Statement | null
    ) {
        super();
        this.condition = condition;
        this.block = block;
        this.elseBlock = elseBlock;
    }
    accept(visitor: Visitor): any {
        return visitor.ifStatement(this);
    }
}
export class WhileStatement extends Statement {
    condition: Expression;
    block: Statement;
    constructor(condition: Expression, block: Statement) {
        super();
        this.condition = condition;
        this.block = block;
    }
    accept(visitor: Visitor): any {
        return visitor.whileStatement(this);
    }
}
export class ClassStatement extends Statement {
    name: string;
    block: Statement;
    constructor(name: string, block: Statement) {
        super();
        this.name = name;
        this.block = block;
    }
    accept(visitor: Visitor): any {
        return visitor.classStatement(this);
    }
}

export class ExternalFunctionDefinitionStatement extends Statement {
    name: string;
    type: Type;
    argTypes: Array<Type>;
    constructor(name: string, type: Type, argTypes: Array<Type>) {
        super();
        this.name = name;
        this.type = type;
        this.argTypes = argTypes;
    }
    accept(visitor: Visitor): any {
        return visitor.externalFunctionDefinitionStatement(this);
    }
}
export class ImportModuleStatement extends Statement {
    path: string;
    startToken: Token;
    constructor(startToken: Token, path: string) {
        super();
        this.startToken = startToken;
        this.path = path;
    }
    accept(visitor: Visitor): any {
        return visitor.importModuleStatement(this);
    }
}
export class ReturnStatement extends Statement {
    value: Expression;
    constructor(value: Expression) {
        super();
        this.value = value;
    }
    accept(visitor: Visitor): any {
        return visitor.returnStatement(this);
    }
}
export class DeferStatement extends Statement {
    block: Statement;
    startingToken: Token;
    dontMoveMe: boolean = false;
    constructor(startingToken: Token, block: Statement) {
        super();
        this.startingToken = startingToken;
        this.block = block;
    }
    accept(visitor: Visitor): any {
        return visitor.deferStatement(this);
    }
}

export class DataDefinitionBlock extends Statement {
    block: Array<Statement>;
    startingToken: Token;
    expectSemiColon: boolean = false;
    constructor(startingToken: Token, block: Array<Statement>) {
        super();
        this.startingToken = startingToken;
        this.block = block;
    }
    accept(visitor: Visitor): any {
        return visitor.dataDefinitionBlock(this);
    }
}

export class StructStatement extends Statement {
    block: DataDefinitionBlock;
    startingToken: Token;
    name: Token;
    constructor(startingToken: Token, name: Token, block: DataDefinitionBlock) {
        super();
        this.startingToken = startingToken;
        this.block = block;
        this.name = name;
    }
    accept(visitor: Visitor): any {
        return visitor.structStatement(this);
    }
}
