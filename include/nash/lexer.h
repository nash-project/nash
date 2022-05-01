#pragma once
#include <nash/token.h>
#include <vector>



class Lexer{
public:
	Lexer(std::string& _src): src(_src) {}
	std::vector<Token*> scan();

private:
	std::vector<Token*> tokens; 
	std::string& src;
	int line = 1;
	int pos_c_line = 0;
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
	void newline();

};