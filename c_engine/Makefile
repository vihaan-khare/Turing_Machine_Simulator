TARGET = tm_sim
CC = gcc
CFLAGS = -Wall -O2

all: $(TARGET)

$(TARGET): main.c tm.c
	$(CC) $(CFLAGS) -o $(TARGET) main.c tm.c

clean:
	rm -f $(TARGET) $(TARGET).exe
