function generate_makefile(func_name) {

return `DIR_INC = -I./
DIR_LIB = -L./
TARGET	= ../release/${func_name}
CFLAGS = -g -Wall $(DIR_INC) $(DIR_LIB)
LDFLAGS += -lstdc++
SRCDIR:=
SRCS := $(wildcard *.cpp) $(wildcard $(addsuffix /*.cpp, $(SRCDIR)))
OBJECTS := $(patsubst %.c,%.o,$(SRCS))
$(TARGET) : $(OBJECTS)
\tgcc $(CFLAGS) $^ -o $@ $(LDFLAGS)
\tcp ../js/${func_name}_proxy.js ../release/
%.o : %.c
\tgcc -c $(CFLAGS) $< -o $@
clean:
\t@rm -f *.o $(TARGET)
\trm -rf ../release/*
.PHONY:clean`

}

module.exports = generate_makefile;
