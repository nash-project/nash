#include <nash/ast/visitor.h>
#include <nash/ast/ast.h>


// normal visitor
void UnaryExpr::accept(Visitor* visitor){ visitor->visit(this); }
void GroupingExpr::accept(Visitor* visitor){ visitor->visit(this); }
void NumberLiteralExpr::accept(Visitor *visitor){ visitor->visit(this); }
void StringLiteralExpr::accept(Visitor *visitor){ visitor->visit(this); }
void BoolLiteralExpr::accept(Visitor *visitor){ visitor->visit(this); }
void BinaryExpr::accept(Visitor*visitor){ visitor->visit(this); }
void VariableExpr::accept(Visitor*visitor){ visitor->visit(this); }
void ExpressionStmt::accept(Visitor * visitor) { visitor->visit(this); }
void VariableStmt::accept(Visitor * visitor) { visitor->visit(this); }
void IfStmt::accept(Visitor * visitor) { visitor->visit(this); }
void BlockStmt::accept(Visitor* visitor){visitor->visit(this);}
void LogicalExpr::accept(Visitor* visitor) {visitor->visit(this);}
void AssignExpr::accept(Visitor*visitor) {visitor->visit(this);}
void CallExpr::accept(Visitor* visitor){visitor->visit(this);}
void FunctionStmt::accept(Visitor*visitor){visitor->visit(this);}
void ReturnStmt::accept(Visitor*visitor){visitor->visit(this);}




//code gen visitor


llvm::Value* UnaryExpr::accept(CodeGenVisitor* visitor){ return visitor->visit(this); }
llvm::Value* GroupingExpr::accept(CodeGenVisitor* visitor){ return visitor->visit(this); }
llvm::Value* NumberLiteralExpr::accept(CodeGenVisitor *visitor){ return visitor->visit(this); }
llvm::Value* StringLiteralExpr::accept(CodeGenVisitor *visitor){ return visitor->visit(this); }
llvm::Value* BoolLiteralExpr::accept(CodeGenVisitor *visitor){ return visitor->visit(this); }
llvm::Value* BinaryExpr::accept(CodeGenVisitor*visitor){ return visitor->visit(this); }
llvm::Value* VariableExpr::accept(CodeGenVisitor*visitor){ return visitor->visit(this); }
llvm::Value* ExpressionStmt::accept(CodeGenVisitor * visitor) { return visitor->visit(this); }
llvm::Value* VariableStmt::accept(CodeGenVisitor * visitor) { return visitor->visit(this); }
llvm::Value* IfStmt::accept(CodeGenVisitor * visitor) { return visitor->visit(this); }
llvm::Value* BlockStmt::accept(CodeGenVisitor* visitor){return visitor->visit(this);}
llvm::Value* LogicalExpr::accept(CodeGenVisitor* visitor) {return visitor->visit(this);}
llvm::Value* AssignExpr::accept(CodeGenVisitor*visitor) {return visitor->visit(this);}
llvm::Value* CallExpr::accept(CodeGenVisitor* visitor){return visitor->visit(this);}
llvm::Value* FunctionStmt::accept(CodeGenVisitor*visitor){return visitor->visit(this);}
llvm::Value* ReturnStmt::accept(CodeGenVisitor*visitor){return visitor->visit(this);}