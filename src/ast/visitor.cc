#include <nash/ast/visitor.h>
#include <nash/ast/ast.h>

void Unary::accept(Visitor* visitor){ visitor->visit(this); }
void Grouping::accept(Visitor* visitor){ visitor->visit(this); }
void NumberLiteral::accept(Visitor *visitor){ visitor->visit(this); }
void StringLiteral::accept(Visitor *visitor){ visitor->visit(this); }
void BoolLiteral::accept(Visitor *visitor){ visitor->visit(this); }
void Binary::accept(Visitor*visitor){ visitor->visit(this); }
void Variable::accept(Visitor*visitor){ visitor->visit(this); }

void ExpressionStmt::accept(StmtVisitor * visitor) { visitor->visit(this); }
void VariableStmt::accept(StmtVisitor * visitor) { visitor->visit(this); }


