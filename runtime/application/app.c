#include "app.h"
#include <stdlib.h>
#include <stdarg.h>

AppState state;
Scope global; //All global objects

void start() {
    state = APP_STATE_OKAY;

    global = (Scope){0}; //Contains nothing for now
}

void scope_end(Scope *scope) {
    for (unsigned int i = 0; i < scope->size; i++) {
        free(scope->res[i]);
    }
}

void exit() {
    scope_end(&global);
    exit(state);
}