#include <iostream>
#include <fstream>
#include <sstream>
#include <nash/lexer.h>
#include <nash/ast/ast.h>
#include <nash/token.h>
#include <nash/parser.h>
#include <nash/codegen/codegen.h>

int main(int argc, char** argv){
	if (argc > 1){
		std::stringstream input;
		std::string source;
		std::ifstream file(argv[1]);
		if(file){
			input << file.rdbuf();
			source = input.str();
			Lexer * lexer = new Lexer(source);
			

			std::vector<Token*> tokens = lexer->scan();
			Parser * parser = new Parser(tokens, source);
			std::vector<Statement*> ast = parser->parse();
			codegen * c = new codegen(ast);
			c->gen();
		}
		else{
			std::cout << "Error: file doesn't exist\n";
		}
	}
}