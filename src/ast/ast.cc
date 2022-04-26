#include <nash/ast/ast.h>
#include <iostream>


std::string Binary::asString(){
	return left->asString() + _operator->lexeme + right->asString();
}
std::string BoolLiteral::asString(){
	if (value){
		return "true";
	}
	else{
		return "false";
	}
}
std::string StringLiteral::asString(){
	return "\"" + value + "\"";
}
std::string NumberLiteral::asString(){
	return std::to_string(value);
}

std::string Unary::asString(){
	return _operator->lexeme + right->asString();
}
std::string Grouping::asString(){
	return expr->asString();
}

std::string Variable::asString(){
	return name->lexeme;
}
