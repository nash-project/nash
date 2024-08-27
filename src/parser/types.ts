const primitiveTypes = ["i32", "i64", "i16", "i8", "pointer"];

export function isPrimitiveType(type: Type) {
    return primitiveTypes.indexOf(type.name) > -1;
}
// yes we built this in for now
export function primitiveToCType(type: Type) {
    let cType: string = "";

    switch (type.name) {
        case "i32": {
            cType = "int";
            break;
        }
        case "i64": {
            cType = "long long int";
            break;
        }
        case "i16": {
            cType = "short int";
            break;
        }
        case "i8": {
            cType = "char";
            break;
        }
    }
    if (cType === "") {
        if (type.name === "pointer" && type.isPointer) {
            cType = "void *";
        } else {
            cType = "void";
        }
    } else {
        if (type.isPointer) {
            cType += "*";
        }
    }
    return cType;
}
export function acceptLiteralTypeForType(
    literalType: Type,
    expectedType: Type
): boolean {
    if (
        literalType.isLiteral &&
        literalType.name === "integer" &&
        (expectedType.name === "i32" ||
            expectedType.name === "i64" ||
            expectedType.name === "i16" ||
            expectedType.name === "i8")
    ) {
        return true;
    } else if (
        expectedType.isLiteral &&
        expectedType.name === "integer" &&
        (literalType.name === "i32" ||
            literalType.name === "i64" ||
            literalType.name === "i16" ||
            literalType.name === "i8")
    ) {
        return true;
    } else if (
        expectedType.isPointer &&
        expectedType.name === "pointer" &&
        literalType.isPointer
    ) {
        return true;
    } else if (
        expectedType.isPointer &&
        literalType.name === "pointer" &&
        literalType.isPointer
    ) {
        return true;
    } else if (
        expectedType.name === "i8" &&
        expectedType.isPointer &&
        literalType.name === "string" &&
        literalType.isLiteral
    ) {
        return true;
    } else if (literalType.name === expectedType.name) {
        return true;
    } else {
        return false;
    }
}

export class Type {
    name: string = "void";
    fullname: string = "void";
    module: string = "main";
    isPointer: boolean = false;
    isPrimitive: boolean = false;
    isLiteral: boolean = false;
    typeArguments: Array<Type> = [];
    hasArguments: boolean = false;
    notDefined: boolean = false;
    constructor(
        name: string = "void",
        isLiteral = false,
        module: string = "main"
    ) {
        this.setType(name);
        this.isLiteral = isLiteral;
        this.module = module;
    }
    setType(name: string) {
        this.hasArguments = false;
        this.typeArguments = [];
        this.name = name;
        this.fullname = name; // we need to keep the @ for errors
        if (this.name[0] === "@") {
            this.isPointer = true;
            this.name = this.name.substring(1);
        }
        if (isPrimitiveType(this)) {
            this.isPrimitive = true;
        }
        const oldName = this.name;
        let currentIndex = 0;
        let arg: string = "";
        // function<i32>
        if (oldName.includes("<")) {
            this.hasArguments = true;
            this.name = "";
            while (true) {
                if (oldName[currentIndex] === "<") {
                    currentIndex++;
                    break;
                }
                this.name += oldName[currentIndex];
                currentIndex++;
            }
            arg = oldName[currentIndex];
            currentIndex++;
            while (true) {
                if (currentIndex >= oldName.length) {
                    this.typeArguments.push(new Type(arg));
                    arg = "";
                    break;
                }
                if (oldName[currentIndex] === ">") {
                    this.typeArguments.push(new Type(arg));
                    arg = "";
                    break;
                }
                if (oldName[currentIndex] === ",") {
                    this.typeArguments.push(new Type(arg));
                    arg = "";
                }
                arg += oldName[currentIndex];
                currentIndex++;
            }
        }
        if (this.name == "function" && !this.hasArguments) {
            this.typeArguments.push(new Type("void"));
        }
    }
}

class FunctionType extends Type {
    constructor(argTypes: Array<Type>) {
        super("function");
        this.hasArguments = true;
        this.typeArguments = [...argTypes];
    }
}
