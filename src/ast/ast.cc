#include <nash/ast/ast.h>
#include <iostream>


std::string BinaryExpr::asString(){
	return left->asString() + _operator->lexeme + right->asString();
}
std::string BoolLiteralExpr::asString(){
	if (value){
		return "true";
	}
	else{
		return "false";
	}
}
std::string StringLiteralExpr::asString(){
	return "\"" + value + "\"";
}
std::string NumberLiteralExpr::asString(){
	return std::to_string(value);
}

std::string UnaryExpr::asString(){
	return _operator->lexeme + right->asString();
}
std::string GroupingExpr::asString(){
	return expr->asString();
}

std::string VariableExpr::asString(){
	return name->lexeme;
}


std::string CallExpr::asString(){
	return "None";
}
std::string LogicalExpr::asString(){
	return "None";
}
std::string AssignExpr::asString(){
	return "None";
}