#include <nash/lexer.h>
#include <stdio.h>
#include <iostream>
#include <map>

const static std::map<std::string, TokenType> keywords = {
	{"and", TokenType::AND},
	{"else", TokenType::CLASS},
	{"false", TokenType::FALSE},
	{"for", TokenType::FOR},
	{"function", TokenType::FUN},
	{"if", TokenType::IF},
	{"or", TokenType::OR},
	{"return", TokenType::RETURN},
	{"true", TokenType::TRUE},
	{"var", TokenType::VAR},
	{"while", TokenType::WHILE},
	{"int", TokenType::INT_TYPE},
};


void Lexer::error(int line, int at, std::string msg){
	printf("Lexer::error::%d::%d: %s\n",line,at,msg.c_str());
}

std::vector<Token*> Lexer::scan(){
	while(!isAtEnd()){
		start = current;
		scanToken();
	}

	tokens.push_back(new Token(TokenType::_EOF, ""));
	
	return tokens;
}

bool Lexer::isAtEnd(){
	return (current >= (int)src.length());
}

void Lexer::scanToken(){
	char c = advance();
	switch(c){
		case ':':
			addToken(TokenType::COLON);
			break;
		case '(':
			addToken(TokenType::LEFT_PAREN);
			break;
		case ')':
			addToken(TokenType::RIGHT_PAREN);
			break;
		case '{': 
			addToken(TokenType::LEFT_BRACE); 
			break;
      	case '}': 
      		addToken(TokenType::RIGHT_BRACE); 
      		break;
      	case ',': 
      		addToken(TokenType::COMMA); 
      		break;
      	case '.': 
      		addToken(TokenType::DOT); 
      		break;
      	case '-': 
      		addToken(TokenType::MINUS); 
      		break;
      	case '+': 
      		addToken(TokenType::PLUS); 
      		break;
      	case ';': 
      		addToken(TokenType::SEMICOLON); 
      		break;
      	case '*': 
      		addToken(TokenType::STAR); 
      		break;
      	case '!':
	    	addToken(match('=') ? TokenType::BANG_EQUAL : TokenType::BANG);
	    	break;
	    case '=':
	    	addToken(match('=') ? TokenType::EQUAL_EQUAL : TokenType::EQUAL);
	    	break;
	    case '<':
	    	addToken(match('=') ? TokenType::LESS_EQUAL : TokenType::LESS);
	    	break;
	    case '>':
	    	addToken(match('=') ? TokenType::GREATER_EQUAL : TokenType::GREATER);
	    	break;
	    case '/':
	    	if (match('/')){
	    		while (peek() != '\n' && !isAtEnd()) advance();
	    	}
	    	else{
	    		addToken(TokenType::SLASH);
	    	}
	    	break;
	    case ' ':
      	case '\r':
      	case '\t':
        	break;
      	case '\n':
        	line++;
        	break;
        case '"':
        	string();
        	break;
      	default: 
      		if (isDigit(c)){
      			number();
      		}
      		else if (isAlpha(c)){
      			identifier();
      		}
      		else{
      			std::string error_msg = "Unexpected Character '";
      			error_msg.push_back(c);
      			error_msg.push_back('\'');
      			error(line, current, error_msg);
      		}
      		break; 
	}
}

char Lexer::advance(){
	return src[current++];
}

void Lexer::addToken(TokenType tt){
	addToken(tt, "");
}
void Lexer::addToken(TokenType tt, std::string token){
	tokens.push_back(new Token(tt, token));
	std::cout << "Token(" << (int)tt << "," << token << ")\n";
}

bool Lexer::match(char expected){
	if (isAtEnd()) return false;
    if (src[current] != expected) return false;

    current++;
    return true;
}

char Lexer::peek(){
	if (isAtEnd()) return '\0';
	return src[current];
}

void Lexer::string(){
	while (peek() != '"' && !isAtEnd()){
		if (peek() == '\n') line++;
		advance();
	}

	if (isAtEnd()){
		error(line, current, "Unterminated string.");
		return;
	}

	advance();

	std::string value = src.substr(start + 1, ((current-1) - (start+1)));
	addToken(TokenType::STRING, value);
}

bool Lexer::isDigit(char c){
	return c >= '0' && c <= '9';
}

void Lexer::number(){
	while (isDigit(peek())) advance();
	addToken(TokenType::NUMBER, src.substr(start, current-start));
}

char Lexer::peekNext(){
	if (current + 1 >= (int)src.length()) return '\0';
    return src[current + 1];
}

void Lexer::identifier(){
	 while (isAlphaNumeric(peek())) advance();
	 std::string text = src.substr(start, current-start);
	 auto _type = keywords.find(text);

	 if (_type == keywords.end()){
	 	addToken(TokenType::IDENTIFIER, text);
	 }
	 else{
	 	addToken(_type->second);
	 }
}

bool Lexer::isAlpha(char c){
	return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
            c == '_';
}

bool Lexer::isAlphaNumeric(char c){
	return isAlpha(c) || isDigit(c);
}