export interface Lesson {
  id: number;
  title: string;
  text: string;
}

export const LESSONS: Lesson[] = [
  { id: 0, title: "$ &", text: "f$f$ j&j& f$j& jj& $ffj &$jf $&fj jf&$ $$&& $f&j &j$f j$&f $$&j &$jf j&j$&$" },
  { id: 1, title: "# *", text: "d#k* d#k* d#k* kk* #dd* k#*dk *#kd* kk#*dk k*#k #*dk# k*#d d#* k#d* k # * d" },
  { id: 2, title: "@ (", text: "s@ l( s@l( @(@s (l@s (ll@s @ls( (s@l l(s@ ll@s (@(s @(sl ls(@ (@ll @s(( @ls" },
  { id: 3, title: "! )", text: "a! ;) a!); )!;a !)!) a;!) )!!);a ;a))!; !)a;!)a; )!!;a !;a) )a;! a!;) ;!a);" },
  { id: 4, title: "% ^", text: "f% j^ g% h^ %^gj %% ^^ %^%^ j^%f f%^j jf%^ j%f^ ^f%j %j^f j%%^f f^^j% f%j^f" },
  { id: 5, title: "~ `", text: "a~a` j~k` u~i` e~w` P~n` c`x~" },
  { id: 6, title: "' \"", text: "e'c\" y'i\" n'c\" w\"q' i'p\" q'W\"" },
  { id: 7, title: "- =", text: "e-w= c-v= n-i= q-e= i=x- s-a=" },
  { id: 8, title: "_ +", text: "d_w+ w_q+ j+l_ n_i+ q_o+ c+x_" },
  { id: 9, title: "[ ]", text: "w[d] c]z[ i[p] l[s] S]Q[ K[p] ]s[" },
  { id: 10, title: "{ }", text: "w{q} c}d} k{s} }ww{ s{W} o{a}" },
  { id: 11, title: "| \\", text: "w|s\\ x\\q| o\\p| k\\z\\ o|i| p\\u\\" },
  { id: 12, title: "< >", text: "x<o> p>d< t>w< u>i< s>a> p> w<" },
];

export function generateLessonSnippet(lessonId: number, numWords: number = 8): string[] {
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return [];
  
  // Split the text into individual words
  const words = lesson.text.trim().split(/\s+/);
  
  // Randomly select numWords from the available words
  const snippet: string[] = [];
  for (let i = 0; i < numWords; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    snippet.push(words[randomIndex]);
  }
  
  return snippet;
}
