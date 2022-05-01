#pragma once
#include <nash/ast/ast.h>
#include <llvm/IR/Value.h>


class Visitor{
public:
	virtual void visit(BinaryExpr *) = 0;
	virtual void visit(BoolLiteralExpr*) = 0;
	virtual void visit(StringLiteralExpr*) = 0;
	virtual void visit(NumberLiteralExpr*) = 0;
	virtual void visit(UnaryExpr *expr) = 0;
	virtual void visit(GroupingExpr*) = 0;
	virtual void visit(VariableExpr*) = 0;
	virtual void visit(ExpressionStmt*) = 0;
	virtual void visit(VariableStmt*) = 0;
	virtual void visit(IfStmt*) = 0;
	virtual void visit(BlockStmt*) = 0;
	virtual void visit(LogicalExpr*) = 0;
	virtual void visit(AssignExpr*) = 0;
	virtual void visit(CallExpr*) = 0;
	virtual void visit(FunctionStmt*) = 0;
	virtual void visit(ReturnStmt*) = 0;
};

class CodeGenVisitor{
public:
	virtual llvm::Value* visit(BinaryExpr *) = 0;
	virtual llvm::Value* visit(BoolLiteralExpr*) = 0;
	virtual llvm::Value* visit(StringLiteralExpr*) = 0;
	virtual llvm::Value* visit(NumberLiteralExpr*) = 0;
	virtual llvm::Value* visit(UnaryExpr *expr) = 0;
	virtual llvm::Value* visit(GroupingExpr*) = 0;
	virtual llvm::Value* visit(VariableExpr*) = 0;
	virtual llvm::Value* visit(ExpressionStmt*) = 0;
	virtual llvm::Value* visit(VariableStmt*) = 0;
	virtual llvm::Value* visit(IfStmt*) = 0;
	virtual llvm::Value* visit(BlockStmt*) = 0;
	virtual llvm::Value* visit(LogicalExpr*) = 0;
	virtual llvm::Value* visit(AssignExpr*) = 0;
	virtual llvm::Value* visit(CallExpr*) = 0;
	virtual llvm::Value* visit(FunctionStmt*) = 0;
	virtual llvm::Value* visit(ReturnStmt*) = 0;	
};