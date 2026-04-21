#ifndef TM_H
#define TM_H

#define MAX_STATES 100
#define MAX_TRANSITIONS 1000
#define MAX_TAPE_SIZE 10000

typedef struct {
    int state;
    char read_symbol;
    char write_symbol;
    int direction;  // -1 (left), 0 (stay), 1 (right)
    int next_state;
} Transition;

typedef struct {
    char tape[MAX_TAPE_SIZE];
    int head_position;
    int current_state;
    int max_steps;
    int step_count;
    Transition transitions[MAX_TRANSITIONS];
    int num_transitions;
    // Bounds for trimming output
    int min_used;
    int max_used;
} TuringMachine;

void tm_init(TuringMachine *tm, const char *initial_tape, int initial_state, int max_steps);
int tm_add_transition(TuringMachine *tm, int state, char read_symbol, char write_symbol, int direction, int next_state);
int tm_step(TuringMachine *tm);
void tm_print_trace(const TuringMachine *tm);

#endif
