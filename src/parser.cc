#include <nash/parser.h>
#include <iostream>
#include <nash/debug.h>

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
		if (match(TokenType::FUN)) return functionDeclaration();
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
	default_types type;
	consume(TokenType::COLON, "expected ':'");
	if (match(TokenType::INT_TYPE)){
		type = default_types::INT;
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
	if (match(TokenType::IF)) return ifStatement();
	if (match(TokenType::RETURN)) return returnStatement();
	return expressionStatement();
}

Statement* Parser::returnStatement(){
	Expression * expr = expression();
	consume(TokenType::SEMICOLON, "expected ';' after expression");
	return new ReturnStmt(expr);
}

Statement * Parser::ifStatement(){
	Statement* ifBody = NULL;
	Statement* elseBody = NULL;
	consume(TokenType::LEFT_PAREN, "expected '(' after if.");
	Expression * condition = expression();
	consume(TokenType::RIGHT_PAREN, "expected ')' after condition");
	consume(TokenType::LEFT_BRACE, "expected '{' after if statement");
	ifBody = block();
	if (match(TokenType::ELSE)){
		consume(TokenType::LEFT_BRACE, "expected '{' after else statement");
		elseBody = block();
	}

	return new IfStmt(condition, ifBody, elseBody);

}

Statement* Parser::block(){
	std::vector<Statement*> statements;

	while (!check(TokenType::RIGHT_BRACE) && !isAtEnd()){
		statements.push_back(declaration());
	}
	consume(TokenType::RIGHT_BRACE, "expected '}' after block");

	return new BlockStmt(statements);
}

Statement * Parser::expressionStatement(){
	Expression *expr = expression();
	consume(TokenType::SEMICOLON, "expected ';' after expression");
	return new ExpressionStmt(expr);
}

Expression* Parser::expression(){
	return assignment();
}

Expression* Parser::_or(){
	Expression* expr = _and();

	while(match(TokenType::OR)){
		Token * _operator = previous();
		Expression* right = _and();
		expr = new LogicalExpr(expr, _operator, right);
	}
	return expr;
}

Expression* Parser::_and(){
	Expression* expr = equality();

	while (match(TokenType::AND)){
		Token* _operator = previous();
		Expression* right = equality();
		expr = new LogicalExpr(expr, _operator, right);
	}
	return expr;
}

Expression* Parser::assignment(){
	Expression * expr = _or();

	if (match(TokenType::EQUAL)){
		Token * equals = previous();
		Expression* value = assignment();
		if (expr->type() == ExpreType::VariableExpr){
			Token* name = ((VariableExpr*)expr)->name;
			return new AssignExpr(name, value);
		}
		error(equals, "invalid assignment target");
	}

	return expr;
}

Expression * Parser::equality(){
	Expression * expr = comparison();

	while (match(TokenType::BANG_EQUAL) || match(TokenType::EQUAL_EQUAL)){
		Token *_operator = previous();

		Expression *right = comparison();
		expr = new BinaryExpr(expr, _operator, right);
	}

	return expr;

}

Expression * Parser::comparison(){
	
	Expression * expr = term();

	while (match(TokenType::GREATER) || match(TokenType::GREATER_EQUAL) || match(TokenType::LESS) || match(TokenType::LESS_EQUAL)){
		Token * _operator = previous();
		Expression * right = term();
		expr = new BinaryExpr(expr, _operator, right);
	}

	return expr;
}

Expression *Parser::term(){
	
	Expression *expr = factor();
	while (match(TokenType::MINUS) || match(TokenType::PLUS)){
		Token * _operator = previous();
		Expression *right = factor();
		expr = new BinaryExpr(expr, _operator, right);
	}
	return expr;
}

Expression *Parser::factor(){
	
	Expression * expr = unary();

	while (match(TokenType::SLASH) || match(TokenType::STAR)){
		Token * _operator = previous();
		Expression *right = unary();
		expr = new BinaryExpr(expr, _operator, right);
	}

	return expr;
}

Expression* Parser::call(){
	
	Expression * expr = primary();

	while (true){
		if (match(TokenType::LEFT_PAREN)){
			expr = finishCallExpr(expr);
		}
		else{
			break;
		}
	}

	return expr;
}

Expression* Parser::finishCallExpr(Expression* callee){
	
	std::vector<Expression*> args;
	if (!check(TokenType::RIGHT_BRACE)){
		while (match(TokenType::COMMA)){
			if (args.size() >= 127){
				error(peek(), "can't have more than 127 arguments");
			}
			args.push_back(expression());
		}
	}
	Token * paren = consume(TokenType::RIGHT_PAREN, "expected ')' after arguments");
	return new CallExpr(callee, paren, args);
}

Statement* Parser::functionDeclaration(){
	
	Token * name = consume(TokenType::IDENTIFIER, "expected function name");
	consume(TokenType::LEFT_PAREN, "expected '(' after function name");
	default_types type = default_types::INT;
	
	std::vector<struct param*> params;
	struct param *c_param = NULL;

	if (!check(TokenType::RIGHT_PAREN)){
		do {
			if (params.size() >= 127){
				error(peek(), "can't have more than 127 parameters");
			}
			c_param  = new param();
			c_param->name = consume(TokenType::IDENTIFIER, "expected parameter name")->lexeme;

			consume(TokenType::COLON ,"expected ':' after parameter name");
			if (match(TokenType::INT_TYPE)){
				c_param->type = default_types::INT;
			}
			else{
				error(peek(), "expected paramter type");
			}

			params.push_back(c_param);
		} while (match(TokenType::COMMA));
	}
	consume(TokenType::RIGHT_PAREN, "expected ')' after parameters");
	consume(TokenType::COLON, "expected ':' after parameters");
	if (match(TokenType::INT_TYPE)){
		type = default_types::INT;
	}

	consume(TokenType::LEFT_BRACE, "expect '{' before function body");

	Statement* body = block();
	return new FunctionStmt(name, params, body, type);
}

Expression *Parser::unary(){
	
	if (match(TokenType::BANG) || match(TokenType::MINUS)){
		Token * _operator = previous();
		Expression *right = unary();
		return new UnaryExpr(_operator, right);
	}
	return call();
}

Expression *Parser::primary(){
	
	if (match(TokenType::FALSE)) return new BoolLiteralExpr(false);
	if (match(TokenType::TRUE)) return new BoolLiteralExpr(true);
	if (match(TokenType::STRING)) return new StringLiteralExpr(previous()->lexeme);
	if (match(TokenType::NUMBER)){

		return new NumberLiteralExpr(stoi(previous()->lexeme));
	} 
	if (match(TokenType::IDENTIFIER)){

		return new VariableExpr(previous());
	} 
	if (match(TokenType::LEFT_PAREN)){
		Expression * expr = expression();
		consume(TokenType::RIGHT_PAREN, "Expect ')' after expression");
		return new GroupingExpr(expr);
	}
	
	return NULL;
}

bool Parser::match(TokenType type){
	//
	if (check(type)){
		advance();
		return true;
	}
	else{
		return false;
	}
}

bool Parser::check(TokenType type){
	//
	if (isAtEnd()) return false;
	return peek()->type == type;
}

Token * Parser::advance(){
	//
	if (!isAtEnd()) current++;
    return previous();
}

bool Parser::isAtEnd(){
	//
	return peek()->type == TokenType::_EOF;
}

Token *Parser::peek(){
	//
	return tokens.at(current);
}

Token* Parser::previous(){
	//
	return tokens.at(current - 1);
}

Token * Parser::consume(TokenType type, std::string message){
	//
	if (check(type)) return advance();
	error(peek(), message);
	return NULL;
}
void Parser::error(Token *tok, std::string message){
	//
	std::cout << "parser::error: " << message << "\n";
	std::cout << "line: "<< tok->line << "; ";
	std::cout << "broken code:\n";
	std::string res;
	std::string error = source.substr(tok->s_col);
	auto index = error.find('\n');
	if (index != std::string::npos)
  		res = error.substr(0, index);
	std::cout << res << "\n";

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