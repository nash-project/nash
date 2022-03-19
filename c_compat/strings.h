#include <string.h>

typedef char * CString;

typedef struct HybridString {
    CString str;
    unsigned int size;
} HybridString;

CString strings_hybrid_to_nash(HybridString s) {
    return s.str;
}

HybridString strings_c_to_hybrid(CString s) {
    return (HybridString) {s, strlen(s)};
}