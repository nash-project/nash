#include <stdlib.h>

enum AppState {
    APP_STATE_OKAY = 0,
    APP_STATE_FAILURE = -1,
} typedef AppState;


/*
    Manages memory by grouping resources
*/
struct Scope {
    void **res;
    unsigned int size;
} typedef Scope;

Scope *start();

/*
    Cleans the scope
*/
void scope_end(Scope *scope);

void exit();