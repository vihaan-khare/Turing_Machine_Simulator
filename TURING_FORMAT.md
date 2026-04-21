# TM Format Specification

The C Core binary `tm_sim.exe` accepts configurations via `stdin`. The Node.js wrapper abstracts this, but if interacting with the C binary manually, the format is:

```text
[INITIAL_STATE] [MAX_STEPS]
[INITIAL_TAPE_STRING | "EMPTY"]
[NUMBER_OF_TRANSITIONS]
[STATE_A] [READ_A] [WRITE_A] [DIR_A_INT] [NEXT_STATE_A]
[STATE_B] [READ_B] ...
```

### Definitions:
- `DIR_A_INT`: `-1` moves Left, `1` moves Right, `0` Stays in place.
- Blank characters denote `_` on the tape.
- `HALT` occurs natively whenever the engine hits a state tracking combination (`[curr_state], [read_char]`) that does not map to any item in the transition array mapping.

### Example Pipe:
```bash
> echo -e "0 500\n1111\n2\n0 1 1 1 0\n0 _ _ 0 99" | ./tm_sim.exe 
```
Output:
```
TRACE|0|0|0|1111
TRACE|1|0|1|1111
TRACE|2|0|2|1111
TRACE|3|0|3|1111
TRACE|4|0|4|1111
TRACE|5|99|4|1111_
HALT|5|99
```
