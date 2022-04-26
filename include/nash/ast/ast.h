#pragma once
#include <nash/token.h>
#include <string>

class Visitor;
class StmtVisitor;

enum class ExpreType{
	Expression = 1,
	Binary,
	Unary,
	Grouping,
	BoolLiteral,
	NumberLiteral,
	StringLiteral
};

enum class StmtType{
	Statement = 1,
	Expression,
	Variable,
};

class Expression{
public:
	ExpreType type = ExpreType::Expression;
	virtual void accept(Visitor *) = 0;
	virtual std::string asString() = 0;
};

class Binary: public Expression {
public:
	Binary(Expression *_left, Token *__operator, Expression *_right): left(_left), right(_right), _operator(__operator) {}

	void accept(Visitor* visitor);

	std::string asString();

	ExpreType type = ExpreType::Binary;
private:
	Expression *left;
	Expression *right;
	Token * _operator;
	
};

class BoolLiteral: public Expression{
public:
	BoolLiteral(bool v): value(v) {}
	ExpreType type = ExpreType::BoolLiteral;
	void accept(Visitor*);
	std::string asString();
private:
	bool value;
};

class NumberLiteral: public Expression{
public:
	NumberLiteral(int n): value(n) {}
	ExpreType type = ExpreType::NumberLiteral;
	void accept(Visitor*);
	std::string asString();
private:
	int value;
};

class StringLiteral: public Expression{
public:
	StringLiteral(std::string n): value(n) {}
	ExpreType type = ExpreType::StringLiteral;
	void accept(Visitor*);
	std::string asString();
private:
	std::string value;
};


class Unary: public Expression{
public:
	Unary(Token *__operator, Expression * _right): _operator(__operator), right(_right) {}
	ExpreType type = ExpreType::Unary;
	void accept(Visitor*);
	std::string asString();
private:
	Token *_operator;
	Expression *right;
};

class Variable: public Expression{
public:
	Variable(Token* n): name(n) {}
	Token* name;
	void accept(Visitor*);
	std::string asString();
};


class Grouping: public Expression{
public:
	Grouping(Expression *_expr): expr(_expr) {}
	std::string asString();
	void accept(Visitor*);
	ExpreType type = ExpreType::Grouping;
private:
	Expression *expr;
};

class Statement{
public:
	virtual void accept(StmtVisitor*) = 0;
	StmtType type = StmtType::Statement;
};


class ExpressionStmt: public Statement{
public:
	ExpressionStmt(Expression* expr): value(expr) {}
	void accept(StmtVisitor*);
	StmtType type = StmtType::Expression;

	Expression* value;
};

class VariableStmt: public Statement{
public:
	VariableStmt(std::string _name, std::string _type, Expression* expr): value(expr), vtype(_type), name(_name)  {}
	void accept(StmtVisitor*);

	StmtType type = StmtType::Variable;

	Expression* value;
	std::string vtype;
	std::string name;

};