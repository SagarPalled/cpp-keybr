export class SnippetGenerator {
  // A collection of common C++ snippets and tokens
  private readonly snippets = [
    "int main", "return", "auto", "const", "void", "bool", "char", "float", "double", 
    "for", "while", "if", "else", "switch", "case", "break", "continue",
    "std", "cout", "cin", "endl", "string", "vector", "map", "set",
    "class", "struct", "public", "private", "protected", "virtual", "override",
    
    // Level 1: ; . ,
    "int x;", "return 0;", "std.out", "a, b, c", "x, y;", "int a;", "break;",
    
    // Level 2: ( )
    "if (x)", "while (true)", "for (i)", "foo()", "bar(a, b)", "int main()",
    "(a, b);", "func();", "(x, y)", "std::min(a, b)",

    // Level 3: { }
    "if (x) {", "while (y) {", "class Foo {", "struct Bar {", "int main() {",
    "if (x) { }", "while (y) { }", "class Foo { };", "struct Bar { };",
    "int main() { return 0; }", "{ a, b, c }", "enum { A, B };", "for (;;) { }",

    // Level 4: = !
    "x = 0;", "bool ok = true;", "if (!ok)", "x = y;", "a != b", "if (a != b) { }",
    "x = !y;", "int i = 1;", "auto v = x;", "if (!x) return;",

    // Level 5: < >
    "cout << x;", "cin >>", "cin >> y;", "vector<int>", "map<int, int>", "if (x < y)", "if (a > b)",
    "for (int i = 0; i < n; i++)", "template <typename T>", "#include <iostream>",
    "vector<", "map<", "template <",

    // Level 6: & *
    "int* p;", "int& r;", "x = &y;", "p = *r;", "if (a && b)", "x * y", "foo(&x)",
    "void func(int* a, int& b)", "auto& ref = val;", "*p = 10;",

    // Level 7: + - /
    "x + y", "a - b", "m / n", "i++", "j--", "x += 1;", "y -= 2;", "count++;",
    "return a + b;", "total / 2", "x = y - z;", "for (int i = 0; i < n; i++) { }",

    // Level 8: [ ] #
    "int arr[", "arr[i", "v[0", "char buf[",
    "int arr[10];", "arr[i] = 0;", "v[0]", "matrix[i][j]", "char buf[256];",
    "#include", "#define", "#ifdef", "#pragma once", "#define MAX 100",

    // Level 9: " ' _
    "\"hello\"", "\"world\"", "'a'", "'\\n'", "char c = 'x';", "string s = \"test\";",
    "my_var", "MAX_SIZE", "int _id;", "std::string _name;", "cout << \"Error\\n\";",

    // Level 10: :
    "std::cout", "std::vector", "std::string", "public:", "private:", "case 1:",
    "Foo::Foo()", "class Foo : public Bar { };", "x ? a : b;", "return ok ? 1 : 0;"
  ];

  // Generates a sequence of words/snippets
  public generate(
    activeChars: string[], 
    focusedChar: string, 
    wordCount: number = 10
  ): string[] {
    const allowedSpecialChars = new Set(activeChars);
    
    // Filter snippets: must only contain letters, numbers, whitespace, or allowed special chars
    const validSnippets = this.snippets.filter(snippet => {
      for (let i = 0; i < snippet.length; i++) {
        const char = snippet[i];
        if (/[^a-zA-Z0-9\s]/.test(char)) {
          if (!allowedSpecialChars.has(char)) {
            return false;
          }
        }
      }
      return true;
    });

    if (validSnippets.length === 0) {
      return Array(wordCount).fill("int");
    }

    const focusedSnippets = validSnippets.filter(s => s.includes(focusedChar));
    const normalSnippets = validSnippets.filter(s => !s.includes(focusedChar));

    const result: string[] = [];

    for (let i = 0; i < wordCount; i++) {
      // 80% chance to focus on the weakest character if possible
      const useFocused = focusedSnippets.length > 0 && Math.random() < 0.8;
      
      if (useFocused) {
        const randomIdx = Math.floor(Math.random() * focusedSnippets.length);
        result.push(focusedSnippets[randomIdx]);
      } else {
        const pool = normalSnippets.length > 0 ? normalSnippets : validSnippets;
        const randomIdx = Math.floor(Math.random() * pool.length);
        result.push(pool[randomIdx]);
      }
    }

    return result;
  }
}
