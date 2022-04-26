#pragma once
#include <nash/ast/ast.h>

class Visitor{
public:
	virtual void visit(Binary *) = 0;
	virtual void visit(BoolLiteral*) = 0;
	virtual void visit(StringLiteral*) = 0;
	virtual void visit(NumberLiteral*) = 0;
	virtual void visit(Unary *expr) = 0;
	virtual void visit(Grouping*) = 0;
	virtual void visit(Variable*) = 0;
	virtual void visit(ExpressionStmt*) = 0;
	virtual void visit(VariableStmt*) = 0;
};