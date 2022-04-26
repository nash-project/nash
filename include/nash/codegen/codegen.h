#pragma once
#include <nash/ast/visitor.h>
#include <nash/ast/ast.h>
#include <vector>
#include <map>
class codegen: public StmtVisitor{
public:
	codegen(std::vector<Statement*> _statements): statements(_statements) {}
	void gen();
	void visit(VariableStmt*);
	void visit(ExpressionStmt*);
private:
	std::vector<Statement*> statements;
};