#pragma once
#include <nash/ast/visitor.h>
#include <nash/ast/ast.h>
#include <vector>
#include <map>
class codegen: public Visitor{
public:
	codegen(std::vector<Statement*> _statements): statements(_statements) {}
	void gen();
	void visit(VariableStmt*);
	void visit(ExpressionStmt*);
	void visit(Binary *);
	void visit(BoolLiteral*);
	void visit(StringLiteral*);
	void visit(NumberLiteral*);
	void visit(Unary *expr);
	void visit(Grouping*);
	void visit(Variable*);
private:
	std::vector<Statement*> statements;
};