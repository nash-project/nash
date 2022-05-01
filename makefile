CPP=clang++
SRC=./src

INCLUDES=-I./include/

CPPFLAGS=-Wall -Wextra $(INCLUDES) -g3 -std=c++17
LDFLAGS=-g3 `llvm-config --cxxflags --ldflags --system-libs --libs core`

TARGET=nash
BUILDDIR=bin

CPPSOURCES=$(shell find $(SRC) -name '*.cc')
OBJECTS = $(patsubst $(SRC)/%.cc, $(BUILDDIR)/%.o, $(CPPSOURCES))

.PHONY: all build clean run dirs

all: build

build: dirs $(OBJECTS) $(TARGET)

$(BUILDDIR)/%.o: $(SRC)/%.cc
	@echo "[$(CPP)]===>[$<]->[$@]"
	@$(CPP) $(CPPFLAGS) -c -o $@ $<

clean:
	-@rm -rf $(TARGET) $(BUILDDIR)

dirs:
	@mkdir -p $(BUILDDIR)
	@cd $(SRC) \
	&& dirs=$$(find -type d) \
	&& cd ../$(BUILDDIR) \
	&& mkdir -p $$dirs

$(TARGET):
	@$(CPP) $(OBJECTS) $(LDFLAGS) -o $(TARGET)

run: build
	./$(TARGET)