#pragma once
#include <vector>
#include <nash/token.h>
#include <nash/ast/ast.h>
#include <exception>

class Parser{
public:
	Parser(std::vector<Token*>& _tokens): tokens(_tokens) {}
	std::vector <Statement*> parse();
private:
	Expression * expression();
	Expression * equality();
	Expression * comparison();
	Expression * term();
	Expression * factor();
	Expression * unary();
	Expression * primary();
	Statement *  statement();
	Statement * declaration();
	Statement * varDeclaration();
	Statement * variableStatement();
	Statement * expressionStatement();
	bool match(TokenType);
	Token * advance();
	bool check(TokenType);
	bool isAtEnd();
	Token * peek();
	Token * previous();
	Token * consume(TokenType, std::string);
	void synchronize();
	void error(Token *, std::string);
	std::vector<Token*>& tokens;

	int current = 0;
};

struct ParserError : public std::exception
{
	const char * what () const throw ()
    {
    	return "Parser Error";
    }
};