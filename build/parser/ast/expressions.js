"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionDeclarationExpression = exports.FunctionDeclarationExpressionArgument = exports.CallExpression = exports.LogicalExpression = exports.AssignmentExpression = exports.VariableExpression = exports.UnaryExpression = exports.LiteralExpression = exports.GroupingExpression = exports.BinaryExpression = exports.Expression = void 0;
class Expression {
    accept(visitor) { }
    constructor(startToken) {
        this.expectSemiColon = true;
        this.startToken = startToken;
    }
}
exports.Expression = Expression;
class BinaryExpression extends Expression {
    constructor(startToken, left, operator, right) {
        super(startToken);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.binaryExpression(this);
    }
}
exports.BinaryExpression = BinaryExpression;
class GroupingExpression extends Expression {
    constructor(startToken, expression) {
        super(startToken);
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.groupingExpression(this);
    }
}
exports.GroupingExpression = GroupingExpression;
class LiteralExpression extends Expression {
    constructor(startToken, value, type) {
        super(startToken);
        this.value = value;
        this.type = type;
    }
    accept(visitor) {
        return visitor.literalExpression(this);
    }
}
exports.LiteralExpression = LiteralExpression;
class UnaryExpression extends Expression {
    constructor(startToken, operator, right) {
        super(startToken);
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.unaryExpression(this);
    }
}
exports.UnaryExpression = UnaryExpression;
class VariableExpression extends Expression {
    constructor(startToken, name) {
        super(startToken);
        this.name = name;
    }
    accept(visitor) {
        return visitor.variableExpression(this);
    }
}
exports.VariableExpression = VariableExpression;
class AssignmentExpression extends Expression {
    constructor(startToken, name, value) {
        super(startToken);
        this.name = name;
        this.value = value;
    }
    accept(visitor) {
        return visitor.assignmentExpression(this);
    }
}
exports.AssignmentExpression = AssignmentExpression;
class LogicalExpression extends Expression {
    constructor(startToken, left, operator, right) {
        super(startToken);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.logicalExpression(this);
    }
}
exports.LogicalExpression = LogicalExpression;
class CallExpression extends Expression {
    constructor(startToken, callee, args) {
        super(startToken);
        this.callee = callee;
        this.args = args;
    }
    accept(visitor) {
        return visitor.callExpression(this);
    }
}
exports.CallExpression = CallExpression;
class FunctionDeclarationExpressionArgument {
    constructor(name, initValue, type) {
        this.name = name;
        this.type = type;
        this.initValue = initValue;
    }
}
exports.FunctionDeclarationExpressionArgument = FunctionDeclarationExpressionArgument;
class FunctionDeclarationExpression extends Expression {
    constructor(startToken, name, args, type, block) {
        super(startToken);
        this.anonFunction = "";
        this.expectSemiColon = false;
        this.block = block;
        this.name = name;
        this.args = args;
        this.type = type;
    }
    accept(visitor) {
        return visitor.functionDeclarationExpression(this);
    }
}
exports.FunctionDeclarationExpression = FunctionDeclarationExpression;
