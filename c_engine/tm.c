#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "tm.h"

void tm_init(TuringMachine *tm, const char *initial_tape, int initial_state, int max_steps) {
    memset(tm->tape, '_', MAX_TAPE_SIZE);
    tm->tape[MAX_TAPE_SIZE - 1] = '\0';
    
    int start_pos = MAX_TAPE_SIZE / 2;
    int len = strlen(initial_tape);
    if (len > 0) {
        memcpy(&tm->tape[start_pos], initial_tape, len);
        tm->max_used = start_pos + len - 1;
    } else {
        tm->max_used = start_pos;
    }
    
    tm->head_position = start_pos;
    tm->min_used = start_pos;
    tm->current_state = initial_state;
    tm->max_steps = max_steps;
    tm->step_count = 0;
    tm->num_transitions = 0;
}

int tm_add_transition(TuringMachine *tm, int state, char read_symbol, char write_symbol, int direction, int next_state) {
    if (tm->num_transitions >= MAX_TRANSITIONS) return 0;
    Transition *t = &tm->transitions[tm->num_transitions++];
    t->state = state;
    t->read_symbol = read_symbol;
    t->write_symbol = write_symbol;
    t->direction = direction;
    t->next_state = next_state;
    return 1;
}

int tm_step(TuringMachine *tm) {
    if (tm->step_count >= tm->max_steps) return -1; // limit reached
    
    char current_symbol = tm->tape[tm->head_position];
    
    // Find transition
    Transition *t = NULL;
    for (int i = 0; i < tm->num_transitions; i++) {
        if (tm->transitions[i].state == tm->current_state && 
            tm->transitions[i].read_symbol == current_symbol) {
            t = &tm->transitions[i];
            break;
        }
    }
    
    if (t == NULL) return 0; // Halted (no transition)
    
    // Apply transition
    tm->tape[tm->head_position] = t->write_symbol;
    tm->current_state = t->next_state;
    tm->head_position += t->direction;
    
    // Update bounds for printing
    if (tm->head_position < tm->min_used) tm->min_used = tm->head_position;
    if (tm->head_position > tm->max_used) tm->max_used = tm->head_position;
    
    tm->step_count++;
    return 1; // Step successful
}

void tm_print_trace(const TuringMachine *tm) {
    int pad = 5; // Extra padding
    int start = tm->min_used - pad;
    int end = tm->max_used + pad;
    
    if (start < 0) start = 0;
    if (end >= MAX_TAPE_SIZE - 1) end = MAX_TAPE_SIZE - 2;
    
    int rel_head = tm->head_position - start;
    
    printf("TRACE|%d|%d|%d|", tm->step_count, tm->current_state, rel_head);
    for (int i = start; i <= end; i++) {
        putchar(tm->tape[i]);
    }
    putchar('\n');
}
