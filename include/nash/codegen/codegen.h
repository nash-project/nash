#pragma once
#include <nash/ast/visitor.h>
#include <nash/ast/ast.h>
#include <vector>
#include <map>
#include <llvm/IR/IRBuilder.h>
#include <llvm/IR/Module.h>


class Variable{
public:
	enum class AssignType{
		static_,
		mutable_,
	} assignType;

	Variable(llvm::Type * _type, llvm::AllocaInst* _variable, llvm::Value* _value, AssignType at): 
		type(_type), variable(_variable), value(_value), assignType(at) {}

	Variable(llvm::Type * _type, llvm::Value* _variable, llvm::Value* _value, AssignType at): 
		type(_type), const_variable(_variable), value(_value), assignType(at) {}

	llvm::Type * getType(){
		return type;
	}
	llvm::AllocaInst * getVar(){
		return variable;
	}
	llvm::Value * getConstVar(){
		return const_variable;
	}
	
private:
	llvm::Type *type;
	llvm::AllocaInst* variable;
	llvm::Value * const_variable;
	llvm::Value * value;
};

class Enviroment{
public:
	std::map<std::string, Variable*> variables;
};

class codegen: public CodeGenVisitor{
public:
	codegen(std::vector<Statement*>& _statements): statements(_statements) {
		builder = new llvm::IRBuilder<>(context);
		module = makeLLVMModule(context);
		GlobalEnviroment = new Enviroment();
		c_env = GlobalEnviroment;
	}
	void gen();
	llvm::Value* visit(VariableStmt*) override;
	llvm::Value* visit(ExpressionStmt*) override;
	llvm::Value* visit(BinaryExpr *) override;
	llvm::Value* visit(BoolLiteralExpr*) override;
	llvm::Value* visit(StringLiteralExpr*) override;
	llvm::Value* visit(NumberLiteralExpr*) override;
	llvm::Value* visit(UnaryExpr *expr) override;
	llvm::Value* visit(GroupingExpr*) override;
	llvm::Value* visit(VariableExpr*) override; 
	llvm::Value* visit(IfStmt*) override;
	llvm::Value* visit(BlockStmt*) override;
	llvm::Value* visit(FunctionStmt*) override;
	llvm::Value* visit(LogicalExpr*) override;
	llvm::Value* visit(CallExpr*) override;
	llvm::Value* visit(AssignExpr*) override;
	llvm::Value* visit(ReturnStmt*) override;
private:
	llvm::LLVMContext context;
	llvm::IRBuilder<> * builder = NULL;
	llvm::Module* module = NULL;


	std::vector<Statement*>& statements;

	Enviroment* GlobalEnviroment;
	Enviroment* c_env;
	Enviroment* p_env;

	llvm::Module* makeLLVMModule(llvm::LLVMContext&);
	void error(std::string);
	void write();
	Enviroment* NewEnviroment();
	void SetEnviroment(Enviroment*);
	void PrevEnviroment();
	Variable* EnviromentGetVariable(std::string);
	void EnviromentNewVariable(std::string, Variable*);
};