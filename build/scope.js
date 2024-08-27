"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = exports.ScopeFunction = exports.ScopeFunctionArg = exports.ScopeVariable = void 0;
class ScopeVariable {
    constructor(name, type, isConstant = false) {
        this.isConstant = false;
        this.name = name;
        this.isConstant = isConstant;
        this.type = type;
    }
}
exports.ScopeVariable = ScopeVariable;
class ScopeFunctionArg {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}
exports.ScopeFunctionArg = ScopeFunctionArg;
class ScopeFunction {
    constructor(type, name, args) {
        this.isTop = false;
        this.type = type;
        this.name = name;
        this.args = args;
    }
    setIsTop() {
        this.isTop = true;
    }
}
exports.ScopeFunction = ScopeFunction;
class Scope {
    constructor(parent) {
        //childScopes: Array<Scope> = [];
        this.parentScope = null;
        this.parentScope = parent;
        this.variables = new Map();
        this.functions = new Map();
    }
    /*addChildScope(scope: Scope) {
        scope.parentScope = this;
        this.childScopes.push(scope);
    }*/
    findFunction(name) {
        var _a;
        let func = (_a = this.parentScope) === null || _a === void 0 ? void 0 : _a.findFunction(name);
        if (func) {
            return func;
        }
        else {
            func = this.functions.get(name);
            if (func) {
                return func;
            }
            return null;
        }
    }
    findVariable(name) {
        var _a;
        let variable = (_a = this.parentScope) === null || _a === void 0 ? void 0 : _a.findVariable(name);
        if (variable) {
            return variable;
        }
        else {
            variable = this.variables.get(name);
            if (variable) {
                return variable;
            }
            return null;
        }
    }
    addVariable(variable) {
        this.variables.set(variable.name, variable);
    }
    addFunction(func) {
        this.functions.set(func.name, func);
    }
}
exports.Scope = Scope;
