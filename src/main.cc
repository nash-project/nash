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
		printf("name: %s\n", argv[1]);
		std::ifstream file(argv[1]);
		if(file){
			input << file.rdbuf();
			std::cout << input.str() << std::endl;
			Lexer * lexer = new Lexer(input.str());
			

			std::vector<Token*> tokens = lexer->scan();
			Parser * parser = new Parser(tokens);
			std::vector<Statement*> ast = parser->parse();
			codegen *c = new codegen(ast);
			c->gen();
		}
	}

}