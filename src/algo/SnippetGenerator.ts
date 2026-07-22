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

  private getHomeRowKey(char: string): string {
    const map: Record<string, string> = {
      '!': 'a', '@': 's', '#': 'd', '$': 'f', '%': 'f',
      '^': 'j', '&': 'j', '*': 'k', '(': 'l', ')': ';',
      '-': ';', '_': ';', '=': ';', '+': ';', '[': ';',
      '{': ';', ']': ';', '}': ';', ';': 'l', ':': ';',
      "'": ';', '"': ';', ',': 'k', '<': 'k', '.': 'l',
      '>': 'l', '/': ';', '?': ';', '\\': ';', '|': ';'
    };
    return map[char] || 'f';
  }

  private generateAdvancedDrill(focusedChar: string, activeChars: string[]): string {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const getRandomLetter = (uppercase: boolean = false) => {
      const l = letters[Math.floor(Math.random() * letters.length)];
      return uppercase ? l.toUpperCase() : l;
    };

    // Logical pairs to build complex muscle memory
    const pairs: Record<string, string[]> = {
      '[': [']'], ']': ['['],
      '{': ['}'], '}': ['{'],
      '(': [')'], ')': ['('],
      '<': ['>'], '>': ['<'],
      "'": ['"'], '"': ["'"],
      '-': ['='], '=': ['-'],
      '_': ['+'], '+': ['_'],
      '$': ['&'], '&': ['$'], // Opposite shift fingers
      '%': ['^'], '^': ['%'], // Index finger stretches
      '!': [';', ')'], ';': ['!', ')'] 
    };

    let relatedChar = focusedChar;
    if (pairs[focusedChar]) {
      const availablePairs = pairs[focusedChar].filter(c => activeChars.includes(c));
      if (availablePairs.length > 0) {
        relatedChar = availablePairs[Math.floor(Math.random() * availablePairs.length)];
      }
    }

    const home1 = this.getHomeRowKey(focusedChar);
    const home2 = this.getHomeRowKey(relatedChar);

    const type = Math.floor(Math.random() * 6);

    switch (type) {
      case 0:
        // Anchor phase (e.g. d#k* or f$f$)
        return `${home1}${focusedChar}${home2}${relatedChar}`;
      
      case 1:
        // Cross-keyboard sandwich (e.g. w[d] or c'x)
        return `${getRandomLetter()}${focusedChar}${getRandomLetter()}`;
        
      case 2:
        // Shift coordination with capitals (e.g. e-W= or S]Q[)
        return `${getRandomLetter(Math.random() > 0.5)}${focusedChar}${getRandomLetter(true)}${relatedChar}`;
        
      case 3:
        // Paired symbols wrapping (e.g. x<o> or }ww{)
        return `${focusedChar}${getRandomLetter()}${getRandomLetter()}${relatedChar}`;
        
      case 4:
        // Dense clusters / Repetition (e.g. $$&& or #dd*)
        if (Math.random() > 0.5) {
          return `${focusedChar}${focusedChar}${relatedChar}${relatedChar}`;
        } else {
          return `${focusedChar}${home1}${home1}${focusedChar}`;
        }
        
      case 5:
        // Spacing variations (e.g. !a a!a or a! ; ))
        return `${getRandomLetter()}${focusedChar} ${focusedChar}${getRandomLetter()}`;
    }
    
    return `${focusedChar}${home1}`;
  }

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
        // 25% chance to generate an advanced EdClub-style drill
        // (Ensures the majority are still valid C++ snippets)
        if (Math.random() < 0.25) {
          result.push(this.generateAdvancedDrill(focusedChar, activeChars));
        } else {
          const randomIdx = Math.floor(Math.random() * focusedSnippets.length);
          result.push(focusedSnippets[randomIdx]);
        }
      } else {
        const pool = normalSnippets.length > 0 ? normalSnippets : validSnippets;
        const randomIdx = Math.floor(Math.random() * pool.length);
        result.push(pool[randomIdx]);
      }
    }

    return result;
  }
}
