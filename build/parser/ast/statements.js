"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructStatement = exports.DataDefinitionBlock = exports.DeferStatement = exports.ReturnStatement = exports.ImportModuleStatement = exports.ExternalFunctionDefinitionStatement = exports.ClassStatement = exports.WhileStatement = exports.IfStatement = exports.BlockStatement = exports.VariableStatement = exports.ExpressionStatement = exports.Statement = void 0;
class Statement {
    constructor() {
        this.expectSemiColon = true;
    }
    accept(visitor) { }
}
exports.Statement = Statement;
class ExpressionStatement extends Statement {
    constructor(expr) {
        super();
        this.expr = expr;
    }
    accept(visitor) {
        return visitor.expressionStatement(this);
    }
}
exports.ExpressionStatement = ExpressionStatement;
class VariableStatement extends Statement {
    constructor(name, type, value, isConstant) {
        super();
        this.name = name;
        this.type = type;
        this.value = value;
        this.isConstant = isConstant;
    }
    accept(visitor) {
        return visitor.variableStatement(this);
    }
}
exports.VariableStatement = VariableStatement;
class BlockStatement extends Statement {
    constructor(block) {
        super();
        this.block = block;
    }
    accept(visitor) {
        return visitor.blockStatement(this);
    }
}
exports.BlockStatement = BlockStatement;
class IfStatement extends Statement {
    constructor(condition, block, elseBlock) {
        super();
        this.condition = condition;
        this.block = block;
        this.elseBlock = elseBlock;
    }
    accept(visitor) {
        return visitor.ifStatement(this);
    }
}
exports.IfStatement = IfStatement;
class WhileStatement extends Statement {
    constructor(condition, block) {
        super();
        this.condition = condition;
        this.block = block;
    }
    accept(visitor) {
        return visitor.whileStatement(this);
    }
}
exports.WhileStatement = WhileStatement;
class ClassStatement extends Statement {
    constructor(name, block) {
        super();
        this.name = name;
        this.block = block;
    }
    accept(visitor) {
        return visitor.classStatement(this);
    }
}
exports.ClassStatement = ClassStatement;
class ExternalFunctionDefinitionStatement extends Statement {
    constructor(name, type, argTypes) {
        super();
        this.name = name;
        this.type = type;
        this.argTypes = argTypes;
    }
    accept(visitor) {
        return visitor.externalFunctionDefinitionStatement(this);
    }
}
exports.ExternalFunctionDefinitionStatement = ExternalFunctionDefinitionStatement;
class ImportModuleStatement extends Statement {
    constructor(startToken, path) {
        super();
        this.startToken = startToken;
        this.path = path;
    }
    accept(visitor) {
        return visitor.importModuleStatement(this);
    }
}
exports.ImportModuleStatement = ImportModuleStatement;
class ReturnStatement extends Statement {
    constructor(value) {
        super();
        this.value = value;
    }
    accept(visitor) {
        return visitor.returnStatement(this);
    }
}
exports.ReturnStatement = ReturnStatement;
class DeferStatement extends Statement {
    constructor(startingToken, block) {
        super();
        this.dontMoveMe = false;
        this.startingToken = startingToken;
        this.block = block;
    }
    accept(visitor) {
        return visitor.deferStatement(this);
    }
}
exports.DeferStatement = DeferStatement;
class DataDefinitionBlock extends Statement {
    constructor(startingToken, block) {
        super();
        this.expectSemiColon = false;
        this.startingToken = startingToken;
        this.block = block;
    }
    accept(visitor) {
        return visitor.dataDefinitionBlock(this);
    }
}
exports.DataDefinitionBlock = DataDefinitionBlock;
class StructStatement extends Statement {
    constructor(startingToken, name, block) {
        super();
        this.startingToken = startingToken;
        this.block = block;
        this.name = name;
    }
    accept(visitor) {
        return visitor.structStatement(this);
    }
}
exports.StructStatement = StructStatement;
