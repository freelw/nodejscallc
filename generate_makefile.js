function generate_makefile(func_name) {

return `DIR_INC = -I./
DIR_LIB = -L./
TARGET	= ../releasejscallc/${func_name}
CFLAGS = -g -Wall $(DIR_INC) $(DIR_LIB)
LDFLAGS += -lstdc++
SRCDIR:=
SRCS := $(wildcard *.cpp) $(wildcard $(addsuffix /*.cpp, $(SRCDIR)))
OBJECTS := $(patsubst %.c,%.o,$(SRCS))
$(TARGET) : $(OBJECTS)
\tgcc $(CFLAGS) $^ -o $@ $(LDFLAGS)
\tcp ../jscallc/${func_name}_proxy.js ../releasejscallc/
\tcp ../jscallpython/${func_name}_proxy.js ../releasejscallpython/
\tcp ../python/${func_name}_imp.py ../releasejscallpython/
\tchmod +x ../releasejscallpython/${func_name}_imp.py
%.o : %.c
\tgcc -c $(CFLAGS) $< -o $@
clean:
\t@rm -f *.o $(TARGET)
\trm -rf ../releasejscallc/*
\trm -rf ../releasejscallpython/*
.PHONY:clean`

}

module.exports = generate_makefile;
