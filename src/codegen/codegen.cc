#include <iostream>
#include <llvm/IR/Function.h>
#include <llvm/Bitcode/BitcodeWriter.h>
#include <llvm/Support/raw_ostream.h>
#include <llvm/IR/BasicBlock.h>
#include <llvm/IR/Constants.h>
#include <llvm/ADT/APInt.h>
#include <fstream>
#include <stdio.h>
#include <nash/token.h>
#include <nash/codegen/codegen.h>

llvm::Value* codegen::visit(VariableStmt* var){

	llvm::Value* value = NULL;

	if (var->value == NULL){

	}else{
		value = var->value->accept(this);
	}

	
	llvm::Type * type = NULL;
	switch(var->vtype){
		case default_types::INT:{
			type = llvm::Type::getInt32Ty(context);
			break;
		}
		default:
			break;
	}

	llvm::AllocaInst *ptr = builder->CreateAlloca(type, 0, var->name);

	if (value != NULL) builder->CreateStore(value,ptr);

	EnviromentNewVariable(var->name, new Variable(type, ptr, value, Variable::AssignType::mutable_));
	return NULL;
}


llvm::Value* codegen::visit(BinaryExpr *expr){
	llvm::Value * l = expr->left->accept(this);
	llvm::Value * r = expr->right->accept(this);

	if (!l || !r){
		error("failed to evaluate expressions");
		return NULL;
	}

	switch(expr->_operator->type){
		case TokenType::MINUS:{
			return builder->CreateSub(l,r);
			break;
		}
		case TokenType::STAR:{
			return builder->CreateMul(l,r);
			break;
		}
		case TokenType::PLUS:{
			return builder->CreateAdd(l,r);
			break;
		}
		default:{
			error("Invalid binary operation");
			return NULL;
			break;
		}
	}
}
llvm::Value* codegen::visit(BoolLiteralExpr*expr){
	return NULL;
}
llvm::Value* codegen::visit(StringLiteralExpr*expr){
	return NULL;
}
llvm::Value* codegen::visit(LogicalExpr* expr){
	return NULL;
}
llvm::Value* codegen::visit(NumberLiteralExpr*expr){
	// gives us a 32 bit signed integer
	return llvm::ConstantInt::get(context, llvm::APInt(32, expr->value, true)); 
}
llvm::Value* codegen::visit(UnaryExpr *expr){
	return NULL;
}
llvm::Value* codegen::visit(GroupingExpr*expr){
	return NULL;
}
llvm::Value* codegen::visit(VariableExpr*expr){
	Variable* var = EnviromentGetVariable(expr->name->lexeme);
	if (var->assignType == Variable::AssignType::static_){
		return var->getConstVar();
	}
	return builder->CreateLoad(var->getType(), var->getVar(), expr->name->lexeme);
}

llvm::Value* codegen::visit(ExpressionStmt* expr){
	return expr->value->accept(this);
}
llvm::Value* codegen::visit(IfStmt* stmt){
	return NULL;
}

llvm::Value* codegen::visit(BlockStmt* block){
	for (Statement* _statement: block->statements){
		_statement->accept(this);
	}
	return NULL;
}

llvm::Value* codegen::visit(FunctionStmt* function){
	Enviroment * func_env;
	func_env = NewEnviroment();
	SetEnviroment(func_env);
	llvm::Type* type = NULL;

	switch(function->type){
		case default_types::INT:{
			type = llvm::Type::getInt32Ty(context);
			break;
		}
		default:
		{
			type = llvm::Type::getVoidTy(context);
			break;
		}
	}  	

	llvm::SmallVector<llvm::Type *> ArgTys;

	for (struct param * _param : function->params){
		switch(_param->type){
			case default_types::INT:{
				ArgTys.push_back(llvm::Type::getInt32Ty(context));
				break;
			}
		}
		
	}

  	llvm::FunctionCallee func_c = module->getOrInsertFunction(function->name->lexeme, llvm::FunctionType::get(type, ArgTys, false));
  		
  	llvm::Function * func = (llvm::Function*)func_c.getCallee();

  	llvm::BasicBlock *func_block = llvm::BasicBlock::Create(context, "entry", func);

  	llvm::Function::arg_iterator args = func->arg_begin();

  	int c_arg = 0;
  	while (args != func->arg_end()){
  		llvm::Value* arg = args++;
  		arg->setName(function->params[c_arg]->name);
  		EnviromentNewVariable(function->params[c_arg]->name, new Variable(ArgTys[c_arg], arg, NULL, Variable::AssignType::static_));
  		c_arg++;
  	}

  	
  	

  	builder->SetInsertPoint(func_block);
  	func->setCallingConv(llvm::CallingConv::C);



  	function->body->accept(this);

  	builder->ClearInsertionPoint();

  	PrevEnviroment();


  	return NULL;

}

Enviroment* codegen::NewEnviroment(){
	return new Enviroment();
}
void codegen::SetEnviroment(Enviroment* env){
	p_env = c_env;
	c_env = env;
}

void codegen::PrevEnviroment(){
	c_env = p_env;
	p_env = NULL;
}

Variable* codegen::EnviromentGetVariable(std::string name){
	Variable * variable = c_env->variables[name];
	if (!variable){
		error("cannot reference variable before defining it");
	}
	return variable;
}
void codegen::EnviromentNewVariable(std::string name, Variable* var){
	if (!c_env->variables[name]){
		c_env->variables[name] = var;
	}
	else{
		error("cannot define variables twice");
	}
}

llvm::Value* codegen::visit(CallExpr* call){
	return NULL;
}

llvm::Value* codegen::visit(AssignExpr * a){
	Variable* var = EnviromentGetVariable(a->name->lexeme);
	if (var->assignType == Variable::AssignType::static_){
		error("you cannot change the value of a constant variable");
	}
	llvm::Value* value = a->value->accept(this);
	if (!value){
		error("invalid value");
	}

	builder->CreateStore(value, var->getVar());

	return value;
}

llvm::Value * codegen::visit(ReturnStmt* s){
	llvm::Value * value = s->value->accept(this);
	builder->CreateRet(value); // later when we have void type, we must use CreateRetVoid for void types.
	return NULL;
}

void codegen::write(){
	FILE* file = fopen("output.bc", "w+");
	if (!file){
		error("Failed to open output file");
	}
	else{
		llvm::raw_fd_ostream bitcode_w(fileno(file), true);
		llvm::WriteBitcodeToFile(*module, bitcode_w);
	}
	fclose(file);
}


void codegen::gen(){
	for (Statement* statement: statements){
		statement->accept(this);
	}
	write();
	delete module;
	delete builder;
}



llvm::Module* codegen::makeLLVMModule(llvm::LLVMContext& context){
	llvm::Module * _module = new llvm::Module("module", context);
	return _module;
}


void codegen::error(std::string msg){
	std::cout << "codegen::error: " << msg << "\n";
	std::exit(1);
}