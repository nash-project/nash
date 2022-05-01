#pragma once
#include <vector>
#include <nash/token.h>
#include <nash/ast/ast.h>
#include <exception>

class Parser{
public:
	Parser(std::vector<Token*>& _tokens, std::string& _source): source(_source), tokens(_tokens) {}
	std::vector <Statement*> parse();
private:
	std::string &source;
	Expression * expression();
	Expression * equality();
	Expression * comparison();
	Expression * term();
	Expression * factor();
	Expression * unary();
	Expression * primary();
	Expression*  call();
	Expression * finishCallExpr(Expression*);
	Expression* assignment();
	Expression* _or();
	Expression* _and();
	Statement *  statement();
	Statement * declaration();
	Statement * varDeclaration();
	Statement * variableStatement();
	Statement * expressionStatement();
	Statement * functionDeclaration();
	Statement * ifStatement();
	Statement * returnStatement();
	Statement* block();
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