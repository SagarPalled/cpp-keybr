export class SnippetGenerator {
  // Competitive programming C++ snippets (Codeforces / LeetCode / ICPC style)
  // Organized by symbol level. The generator's filter ensures only snippets
  // whose special chars are all unlocked will appear.
  private readonly snippets = [
    // ── Plain keywords (no special chars) ─────────────────────────────────
    "int main", "return", "auto", "const", "void", "bool", "long long",
    "for", "while", "if", "else", "break", "continue",
    "cout", "cin", "endl", "string", "vector", "map", "set",
    "sort", "reverse", "swap", "push", "pop", "front", "back",
    "true", "false", "size", "empty", "begin", "end",

    // ── Level 1: ;  , ─────────────────────────────────────────────────────
    // Short drills
    "n;", "x;", "ok;", "ans;", "cnt;",
    "a, b", "x, y", "i, j", "n, m", "lo, hi",
    // Context snippets
    "int n, m;", "int ans;", "long long ans;", "int t;", "int x, y;",
    "return 0;", "break;", "continue;",
    "int l, r, mid;", "int lo, hi;", "bool found;",
    "int cnt;", "long long sum;", "int res;",
    "v.size()", "v.clear()", "q.empty()",
    "v.begin(), v.end()", "s.begin(), s.end()",

    // ── Level 2: ( ) ──────────────────────────────────────────────────────
    // Short drills — high density
    "(x)", "(n)", "(u)", "(i)", "(a, b)", "(lo, hi)", "(n, m)",
    "f(x)", "g(n)", "dfs(u)", "bfs(u)",
    // Context snippets
    "int main()", "max(a, b)", "min(a, b)", "abs(x)", "swap(a, b);",
    "v.push_back(x);", "q.push(x);", "q.pop();",
    "while (t--)", "while (!q.empty())", "if (!vis(u))",
    "dfs(u);", "bfs(src);", "solve();",
    "gcd(a, b)", "sqrt(n)",
    "upper_bound(v.begin(), v.end(), x)",
    "lower_bound(v.begin(), v.end(), x)",
    "sort(v.begin(), v.end());",
    "reverse(v.begin(), v.end());",

    // ── Level 3: { } ──────────────────────────────────────────────────────
    // Short drills
    "{ }", "{ n }", "{ x }",
    // Context snippets
    "int main() {", "while (t--) {", "if (x) {", "else {",
    "} else {", "for (;;) {",
    "int main() { return 0; }",
    "if (l == r) { return; }",
    "if (cnt == 0) { break; }",

    // ── Level 4: = ! ──────────────────────────────────────────────────────
    // Short drills
    "= 0", "= n", "= x", "!= 0", "!= n", "!ok", "!x", "!found",
    // Context snippets
    "int n = 0;", "int ans = 0;", "long long sum = 0;",
    "bool ok = true;", "bool found = false;",
    "int lo = 0, hi = n;",
    "ans = max(ans, cur);", "ans = min(ans, cur);",
    "if (!vis(u))", "if (a != b)", "if (!q.empty())",
    "vis(u) = true;", "dist(u) = 0;",

    // ── Level 5: < > ──────────────────────────────────────────────────────
    // Short drills — very high density
    "< n", "< m", "> 0", ">= 0", "<= n",
    "<< n", "<< ans", "<< x", ">> n", ">> x",
    "<int>", "<long long>", "<bool>", "<char>",
    // Context snippets
    "vector<int>", "vector<long long>",
    "vector<vector<int>>", "vector<pair<int, int>>",
    "map<int, int>", "set<int>", "multiset<int>",
    "priority_queue<int>", "queue<int>", "stack<int>",
    "pair<int, int>", "unordered_map<int, int>",
    "cin >> n;", "cin >> n >> m;", "cin >> x >> y;",
    "cout << ans;", "cout << ans << endl;",
    "cout << \"YES\" << endl;", "cout << \"NO\" << endl;",
    "for (int i = 0; i < n; i++)",
    "for (int j = 0; j < m; j++)",
    "for (int i = n; i >= 0; i--)",
    "if (a < b)", "if (x > 0)", "while (lo < hi)",
    "if (mid < target)", "if (mid >= target)",
    "sort(v.begin(), v.end(), greater<int>())",

    // ── Level 6: & * ──────────────────────────────────────────────────────
    // Short drills
    "&& b", "&& ok", "&& x", "* 2", "* n", "* m",
    "a &&", "!a &&", "n &&",
    // Context snippets
    "if (a && b)", "if (x && y)", "while (n && m)",
    "if (a && !b)", "if (!a && b)",
    "auto& ref = mp[key];", "for (auto& p : v)",
    "a * b", "n * m", "ans * 2",
    "(a * b) % MOD",
    "node* left;", "node* right;",
    "ListNode* head;", "TreeNode* root;",

    // ── Level 7: + - / ────────────────────────────────────────────────────
    // Short drills
    "+ 1", "- 1", "/ 2", "/ n", "+ n", "- n",
    "i++", "j++", "cnt++", "l++", "r--",
    "+= x", "-= 1", "+= cnt",
    // Context snippets
    "n - 1", "m - 1", "i + 1", "j + 1",
    "sum += x;", "ans += cnt;", "res += val;",
    "cnt--;", "total -= x;",
    "mid = (lo + hi) / 2;",
    "(a + b) % MOD", "(a - b + MOD) % MOD",
    "for (int i = 0; i < n; i++) {",
    "for (int j = 0; j < m; j++) {",
    "dp[i] = dp[i - 1] + dp[i - 2];",

    // ── Level 8: [ ] # ────────────────────────────────────────────────────
    // Short drills
    "[i]", "[j]", "[0]", "[n]", "[u]", "[v]",
    "a[i]", "dp[i]", "v[i]", "vis[u]",
    // Context snippets
    "dp[i][j]", "adj[u]", "dist[u]", "grid[i][j]",
    "dp[i] = max(dp[i], dp[j] + 1);",
    "adj[u].push_back(v);", "adj[v].push_back(u);",
    "vis[u] = true;", "dist[src] = 0;",
    "dp[0] = 1;", "dp[0][0] = 0;",
    "grid[i][j] = 0;",
    "#define ll long long", "#define pb push_back",
    "#define MOD 1000000007", "#define INF 1e18",
    "#include <bits>",

    // ── Level 9: \" ' _ ────────────────────────────────────────────────────
    // Short drills
    "\"YES\"", "\"NO\"", "\"-1\"", "\"\\n\"",
    "'\\n'", "'0'", "'a'", "'z'",
    "_id", "_val", "max_", "min_",
    // Context snippets
    "cout << \"YES\" << '\\n';", "cout << \"NO\" << '\\n';",
    "push_back", "pop_back", "emplace_back",
    "max_element", "min_element",
    "upper_bound", "lower_bound",
    "make_pair",
    "is_valid", "can_reach", "has_cycle",
    "num_nodes", "max_depth", "min_cost",
    "node_count", "edge_count",

    // ── Level 10: : ───────────────────────────────────────────────────────
    // Short drills
    "::", "0:", "1:", "n:",
    // Context snippets
    "std::cin", "std::cout", "std::vector", "std::string",
    "std::sort", "std::swap", "std::min", "std::max", "std::abs",
    "std::map", "std::set", "std::queue", "std::stack",
    "std::pair<int, int>", "std::vector<int>",
    "for (auto& [key, val] : mp)",
    "case 1:", "case 0:", "default:",
    "public:", "private:"
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

    // Helper to count occurrences of focusedChar in a string
    const countOccurrences = (str: string, char: string) => {
      return str.split(char).length - 1;
    };

    // Weight by DENSITY (count / length) rather than raw count.
    // This ensures short high-density drills (e.g. "(x)" at 33%) naturally
    // dominate over long low-density snippets (e.g. "sort(v.begin()...)" at 12%).
    // We scale by 100 and round to get integer weights, with a minimum of 1.
    const weightedFocusedPool: string[] = [];
    focusedSnippets.forEach(s => {
      const count = countOccurrences(s, focusedChar);
      const density = count / s.length;
      const weight = Math.max(1, Math.round(density * 100));
      for (let i = 0; i < weight; i++) {
        weightedFocusedPool.push(s);
      }
    });

    for (let i = 0; i < wordCount; i++) {
      // 90% chance to focus on the weakest character
      const useFocused = weightedFocusedPool.length > 0 && Math.random() < 0.9;
      
      if (useFocused) {
        const randomIdx = Math.floor(Math.random() * weightedFocusedPool.length);
        result.push(weightedFocusedPool[randomIdx]);
      } else {
        const pool = normalSnippets.length > 0 ? normalSnippets : validSnippets;
        const randomIdx = Math.floor(Math.random() * pool.length);
        result.push(pool[randomIdx]);
      }
    }

    return result;
  }
}
