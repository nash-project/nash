#include <nash/codegen/codegen.h>
#include <iostream>

void codegen::visit(VariableStmt* var){
	if (var->value == NULL){
	std::cout << "type: " << var->vtype << "; " << var->name << "-> " << "none"; 
	}
	else{
		std::cout << "type: " << var->vtype << "; " << var->name << "-> " << var->value->asString(); 
	}
}

void codegen::visit(ExpressionStmt* expr){
	return;
}

void codegen::gen(){
	for (Statement* statement: statements){
		statement->accept(this);
	}
}