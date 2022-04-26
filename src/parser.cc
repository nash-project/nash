#include <nash/parser.h>
#include <iostream>

std::vector <Statement*> Parser::parse(){
	std::vector<Statement*> statements;
	while (!isAtEnd()){
		try{
			statements.push_back(declaration());
		}
		catch (ParserError&e){
			std::cout << "error: cannot continue\n";
			return statements;
		}
		
	}
	return statements;
}

Statement* Parser::declaration(){
	try{
		if(match(TokenType::VAR)) return varDeclaration();
		return statement();
	}
	catch (ParserError &e){
		synchronize();
		return NULL;
	}
}

Statement* Parser::varDeclaration(){
	Token* var_name = consume(TokenType::IDENTIFIER, "variable requires a name");
	Expression * value = NULL;
	std::string type;
	consume(TokenType::COLON, "expected ':'");
	if (match(TokenType::INT_TYPE)){
		type = "int";
	}
	else{
		error(peek(), "expected valid variable type");
	}
	if (match(TokenType::EQUAL)){
		value = expression();
	}

	consume(TokenType::SEMICOLON, "expected ';' after expression");
	
	return new VariableStmt(var_name->lexeme, type, value);
}

Statement * Parser::statement(){
	return expressionStatement();
}
Statement * Parser::expressionStatement(){
	Expression *expr = expression();
	consume(TokenType::SEMICOLON, "expected ';' after expression");
	return new ExpressionStmt(expr);
}

Expression* Parser::expression(){
	return equality();
}

Expression * Parser::equality(){
	Expression * expr = comparison();

	while (match(TokenType::BANG_EQUAL) || match(TokenType::EQUAL_EQUAL)){
		Token *_operator = previous();

		Expression *right = comparison();
		expr = new Binary(expr, _operator, right);
	}

	return expr;

}

Expression * Parser::comparison(){
	Expression * expr = term();

	while (match(TokenType::GREATER) || match(TokenType::GREATER_EQUAL) || match(TokenType::LESS) || match(TokenType::LESS_EQUAL)){
		Token * _operator = previous();
		Expression * right = term();
		expr = new Binary(expr, _operator, right);
	}

	return expr;
}

Expression *Parser::term(){
	Expression *expr = factor();
	while (match(TokenType::MINUS) || match(TokenType::PLUS)){
		Token * _operator = previous();
		Expression *right = factor();
		expr = new Binary(expr, _operator, right);
	}
	return expr;
}

Expression *Parser::factor(){
	Expression * expr = unary();

	while (match(TokenType::SLASH) || match(TokenType::STAR)){
		Token * _operator = previous();
		Expression *right = unary();
		expr = new Binary(expr, _operator, right);
	}

	return expr;
}

Expression *Parser::unary(){
	if (match(TokenType::BANG) || match(TokenType::MINUS)){
		Token * _operator = previous();
		Expression *right = unary();
		return new Unary(_operator, right);
	}
	return primary();
}

Expression *Parser::primary(){
	if (match(TokenType::FALSE)) return new BoolLiteral(false);
	if (match(TokenType::TRUE)) return new BoolLiteral(true);
	if (match(TokenType::STRING)) return new StringLiteral(previous()->lexeme);
	if (match(TokenType::NUMBER)) return new NumberLiteral(stoi(previous()->lexeme));
	if (match(TokenType::IDENTIFIER)) return new Variable(previous());
	if (match(TokenType::LEFT_PAREN)){
		Expression * expr = expression();
		consume(TokenType::RIGHT_PAREN, "Expect ')' after expression");
		return new Grouping(expr);
	}
	return NULL;
}

bool Parser::match(TokenType type){
	if (check(type)){
		advance();
		return true;
	}
	else{
		return false;
	}
}

bool Parser::check(TokenType type){
	if (isAtEnd()) return false;
	return peek()->type == type;
}

Token * Parser::advance(){
	if (!isAtEnd()) current++;
    return previous();
}

bool Parser::isAtEnd(){
	return peek()->type == TokenType::_EOF;
}

Token *Parser::peek(){
	return tokens.at(current);
}

Token* Parser::previous(){
	return tokens.at(current - 1);
}

Token * Parser::consume(TokenType type, std::string message){
	if (check(type)) return advance();
	error(peek(), message);
	return NULL;
}
void Parser::error(Token *tok, std::string message){
	std::cout << "parser::error: " << message << "\n";    
	throw ParserError();
}

void Parser::synchronize(){
	advance();

	while (!isAtEnd()){

		if (previous()->type == TokenType::SEMICOLON) return;

		switch (peek()->type){
			case TokenType::CLASS:
			case TokenType::FUN:
			case TokenType::VAR:
			case TokenType::FOR:
			case TokenType::IF:
			case TokenType::WHILE:
			case TokenType::RETURN:
				return;
		}

		advance();
	}

}