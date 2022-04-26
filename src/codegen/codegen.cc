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


void codegen::visit(Binary *expr){
	return;
}
void codegen::visit(BoolLiteral*expr){
	return;
}
void codegen::visit(StringLiteral*expr){
	return;
}
void codegen::visit(NumberLiteral*expr){

}
void codegen::visit(Unary *expr){
	return;
}
void codegen::visit(Grouping*expr){
	return;
}
void codegen::visit(Variable*expr){
	return;
}

void codegen::visit(ExpressionStmt* expr){
	return;
}

void codegen::gen(){
	for (Statement* statement: statements){
		statement->accept(this);
	}
}