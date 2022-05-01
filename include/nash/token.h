#pragma once
#include <string>

enum class TokenType {
	// Single-character tokens.
	LEFT_PAREN = 1, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
	COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR, COLON,

	// One or two character tokens.
	BANG, BANG_EQUAL,
	EQUAL, EQUAL_EQUAL,
	GREATER, GREATER_EQUAL,
	LESS, LESS_EQUAL,

	// Literals.
	IDENTIFIER, STRING, NUMBER,

	// Keywords.
	AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
	PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE, PROTO ,_EOF,

	INT_TYPE,
};

class Token{
public:
	Token(TokenType t, std::string l, int _line, int _s): type(t), lexeme(l), line(_line), s_col(_s) {}
	TokenType type;
	std::string lexeme;
	int line;
	int s_col;
};