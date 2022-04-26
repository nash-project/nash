#include "app.h"
#include <stdlib.h>
#include <stdarg.h>

AppState state;
Scope global; //All global objects

/*
Returns pointer to the global scope. Then initialize it owwith scope_start()
*/
Scope *start() {
    state = APP_STATE_OKAY;

    return &global;
}

/*
Don't use if really needed
*/
void scope_start(Scope *scope, size_t *sizes, unsigned int n) {
    scope->res = malloc(n);
    scope->size = n;
    for (unsigned int i = 0; i < scope->size; i++) {
        scope->res[i] = malloc(sizes[i]);
    }
}

void scope_end(Scope *scope) {
    for (unsigned int i = 0; i < scope->size; i++) {
        free(scope->res[i]);
    }
}

AppState get_state() {
    return state;
}

void declare_error() {
    state = APP_STATE_FAILURE;
}

void exit() {
    scope_end(&global);
    exit(state);
}