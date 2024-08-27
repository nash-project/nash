import { Type } from "./parser/types";

export class ScopeVariable {
    type: Type;
    name: string;
    isConstant: boolean = false;
    constructor(name: string, type: Type, isConstant: boolean = false) {
        this.name = name;
        this.isConstant = isConstant;
        this.type = type;
    }
}

export class ScopeFunctionArg {
    type: Type;
    name: string;
    constructor(name: string, type: Type) {
        this.name = name;
        this.type = type;
    }
}
export class ScopeFunction {
    type: Type;
    name: string;
    args: Array<ScopeFunctionArg>;
    isTop: boolean = false;
    constructor(type: Type, name: string, args: Array<ScopeFunctionArg>) {
        this.type = type;
        this.name = name;
        this.args = args;
    }
    setIsTop() {
        this.isTop = true;
    }
}

export class Scope {
    variables: Map<string, ScopeVariable>;
    functions: Map<string, ScopeFunction>;
    //childScopes: Array<Scope> = [];
    parentScope: Scope | null = null;
    constructor(parent: Scope | null) {
        this.parentScope = parent;
        this.variables = new Map<string, ScopeVariable>();
        this.functions = new Map<string, ScopeFunction>();
    }
    /*addChildScope(scope: Scope) {
        scope.parentScope = this;
        this.childScopes.push(scope);
    }*/
    findFunction(name: string): ScopeFunction | null {
        let func = this.parentScope?.findFunction(name);
        if (func) {
            return func;
        } else {
            func = this.functions.get(name);
            if (func) {
                return func;
            }
            return null;
        }
    }
    findVariable(name: string): ScopeVariable | null {
        let variable = this.parentScope?.findVariable(name);
        if (variable) {
            return variable;
        } else {
            variable = this.variables.get(name);
            if (variable) {
                return variable;
            }
            return null;
        }
    }
    addVariable(variable: ScopeVariable) {
        this.variables.set(variable.name, variable);
    }
    addFunction(func: ScopeFunction) {
        this.functions.set(func.name, func);
    }
}
