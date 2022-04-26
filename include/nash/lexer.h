#pragma once
#include <nash/token.h>
#include <vector>



class Lexer{
public:
	Lexer(const std::string _src): src(_src) {}
	std::vector<Token*> scan();

private:
	std::vector<Token*> tokens; 
	const std::string src;
	int line = 0;
	int current = 0;
	int start = 0;

	bool isAtEnd();
	void error(int, int, std::string);
	void scanToken();
	char advance();
	void addToken(TokenType);
	void addToken(TokenType, std::string);
	bool match(char);
	char peek();
	bool isDigit(char);
	bool isAlpha(char);
	bool isAlphaNumeric(char);
	char peekNext();
	void number();
	void string();
	void identifier();
};