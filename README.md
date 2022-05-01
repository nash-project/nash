# nash
Nash Language Compiler

### Required Tools and Packages
 - clang++
 - gnu make
 - llvm

### Compiling The Nash Compiler

Once you have all needed tools and packages, you must run
```
make
```
Now you must check if the compiler is working by running
```
./nash main.nash
```
if it completes then it works and you should have a file called output.bc now.
That is the outputed llvm ir bitcode.

### Example Syntax
For an example checkout the main.nash file

### Compiling the output
In the future nash will do all this automatically, but for now you must do it manually.
To generate an relocatable object file run
```
llc -filetype=obj output.bc
```
then you must link the file. In this example i will use gcc as a linker. Run this to link
```
gcc output.o -o output
```
Then it should be fully linked and working. You can now run it.