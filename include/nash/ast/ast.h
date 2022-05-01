#pragma once
#include <nash/token.h>
#include <string>
#include <vector>
#include <llvm/IR/Value.h>

class Visitor;
class CodeGenVisitor;

enum class default_types{
	INT,
};

struct param{
	default_types type;
	std::string name;
};


enum class ExpreType{
	Expression = 1,
	BinaryExpr,
	UnaryExpr,
	GroupingExpr,
	BoolLiteralExpr,
	NumberLiteralExpr,
	StringLiteralExpr,
	LogicalExpr,
	AssignExpr,
	VariableExpr,
	CallExpr,
};

enum class StmtType{
	Statement = 1,
	Expression,
	Variable,
	If,
	BlockStmt,
};

class Expression{
public:
	virtual void accept(Visitor *) = 0;
	virtual llvm::Value* accept(CodeGenVisitor *) = 0;
	virtual std::string asString() = 0;
	virtual ExpreType type() { return ExpreType::Expression; }
};

class BinaryExpr: public Expression {
public:
	BinaryExpr(Expression *_left, Token *__operator, Expression *_right): left(_left), right(_right), _operator(__operator) {}

	void accept(Visitor* visitor) override;
	llvm::Value* accept(CodeGenVisitor*) override;


	std::string asString() override;

	ExpreType type() override{ return ExpreType::BinaryExpr; }

	Expression *left;
	Expression *right;
	Token * _operator;
	
};

class BoolLiteralExpr: public Expression{
public:
	BoolLiteralExpr(bool v): value(v) {}
	ExpreType type() override{ return ExpreType::BoolLiteralExpr; }
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	std::string asString() override;
	bool value;
};

class NumberLiteralExpr: public Expression{
public:
	NumberLiteralExpr(int n): value(n) {}
	ExpreType type() override { return ExpreType::NumberLiteralExpr; }
	std::string asString() override;

	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	int value;
};

class StringLiteralExpr: public Expression{
public:
	StringLiteralExpr(std::string n): value(n) {}
	ExpreType type() override { return ExpreType::StringLiteralExpr; }
	std::string asString() override;

	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;

	std::string value;
};


class UnaryExpr: public Expression{
public:
	UnaryExpr(Token *__operator, Expression * _right): _operator(__operator), right(_right) {}
	ExpreType type() override { return ExpreType::UnaryExpr; }
	std::string asString() override;

	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	
	Token *_operator;
	Expression *right;
};

class VariableExpr: public Expression{
public:
	VariableExpr(Token* n): name(n) {}
	Token* name;
	
	std::string asString() override;
	ExpreType type() override { return ExpreType::VariableExpr; }

	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;

};




class GroupingExpr: public Expression{
public:
	GroupingExpr(Expression *_expr): expr(_expr) {}
	std::string asString() override;
	ExpreType type() override { return  ExpreType::GroupingExpr; }

	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	Expression *expr;
};

class LogicalExpr: public Expression{
public:
	Expression* right;
	Expression* left;
	Token* _operator;
	LogicalExpr(Expression * _right, Token* __operator, Expression * _left): right(_right), left(_left), _operator(__operator) {}
	std::string asString() override;
	ExpreType type() override { return ExpreType::LogicalExpr; }

	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
};


class AssignExpr: public Expression{
public:
	Token* name; 
	Expression * value;
	AssignExpr(Token* _name, Expression* _value): name(_name), value(_value) {}
	std::string asString() override;
	ExpreType type() override { return ExpreType::AssignExpr; }
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
};

class CallExpr: public Expression{
public:
	Expression* callee;
	Token* paren;
	std::vector<Expression*> arguments;
	CallExpr(Expression * _callee, Token* _paren, std::vector<Expression*> _arguments): callee(_callee), paren(_paren), arguments(_arguments) {}
	ExpreType type() override { return ExpreType::CallExpr; }
	std::string asString() override;

	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
};

class Statement{
public:
	virtual void accept(Visitor*) = 0;
	virtual llvm::Value* accept(CodeGenVisitor*) = 0;
	StmtType type = StmtType::Statement;
};


class ExpressionStmt: public Statement{
public:
	ExpressionStmt(Expression* expr): value(expr) {}
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	StmtType type = StmtType::Expression;

	Expression* value;
};

class VariableStmt: public Statement{
public:
	VariableStmt(std::string _name, default_types _type, Expression* expr): value(expr), vtype(_type), name(_name)  {}
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;

	StmtType type = StmtType::Variable;

	Expression* value;
	default_types vtype;
	std::string name;

};


class IfStmt: public Statement{
public:
	Expression* condition;
	Statement* body;
	Statement * elseBranch;
	IfStmt(Expression *_condition, Statement* _body, Statement* _elseBranch): condition(_condition), body(_body), elseBranch(_elseBranch) {}
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	StmtType type = StmtType::If;
};


class BlockStmt : public Statement{
public:
	std::vector<Statement*> statements;
	BlockStmt(std::vector<Statement*> _statements): statements(_statements) {}
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	StmtType type = StmtType::BlockStmt;
};

class FunctionStmt: public Statement{
public:
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
	Token * name;
	std::vector<struct param*> params;
	Statement* body;
	default_types type;
	FunctionStmt(Token *_n, std::vector<struct param*> p, Statement* b, default_types t): name(_n), params(p), body(b), type(t) {}
};

class ReturnStmt : public Statement{
public:
	ReturnStmt(Expression* _value): value(_value){}
	Expression* value;
	void accept(Visitor*) override;
	llvm::Value* accept(CodeGenVisitor*) override;
};