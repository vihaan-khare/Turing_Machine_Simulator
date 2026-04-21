#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "tm.h"

int main() {
    TuringMachine tm;
    
    int init_state, max_steps;
    if (scanf("%d %d\n", &init_state, &max_steps) != 2) return 1;
    
    char tape_input[MAX_TAPE_SIZE / 2];
    if (fgets(tape_input, sizeof(tape_input), stdin) == NULL) return 1;
    tape_input[strcspn(tape_input, "\r\n")] = 0;
    if (strcmp(tape_input, "EMPTY") == 0) {
        tape_input[0] = '\0';
    }
    
    tm_init(&tm, tape_input, init_state, max_steps);
    
    int n;
    if (scanf("%d\n", &n) != 1) return 1;
    
    for (int i = 0; i < n; i++) {
        int state, next_state, direction;
        char read_sym, write_sym;
        if (scanf("%d %c %c %d %d\n", &state, &read_sym, &write_sym, &direction, &next_state) != 5) {
            return 1;
        }
        tm_add_transition(&tm, state, read_sym, write_sym, direction, next_state);
    }
    
    tm_print_trace(&tm);
    while (1) {
        int res = tm_step(&tm);
        if (res == 1) {
            tm_print_trace(&tm);
        } else if (res == 0) {
            printf("HALT|%d|%d\n", tm.step_count, tm.current_state);
            break;
        } else if (res == -1) {
            printf("LIMIT|%d\n", tm.step_count);
            break;
        }
    }
    
    return 0;
}
