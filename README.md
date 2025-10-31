This is a _very_ rough utility web app which allows the user to paste in a js snippet and get back a sorted list of distinct names of functions that have been called.

Partly, it's a proof-of-concept experimental tool for teachers / tutorial-writers using p5.js so they can quickly get a summary of the p5.js functions their sketch(es) used. I imagine the teacher using the core of this as an automation immediately processing and indexing a couple of hundred p5.js sketches and, say, filtering for those which don't use any functions considered unsuitable for complete beginners (e.g. rotate(), or anything from the vector class).

It's also just an excuse for me to play with AST processing, briefly.

# how it works

It's a react app written in typescript

Uses a JS parser under the covers and looks through its AST to find suitable function calls.

Uses p5.js documentation in json form to try to match extracted function calls to p5.js functions, though this is done extremely loosely at the moment, with various false positives. It can be tightened up but won't ever be completely reliable with this approach.

(The data.json is exported by p5.js build into their data/reference/data.json or similar.)

### Why p5 docs matching will not be 100% accurate with this approach?

The AST code can't know if in the expression `foo.dist()` whether `foo` is a reference to a p5.Vector instance, a reference to `window` or an object created with `createGraphics`, a reference to p5 in instance mode, or even some other object or namespace which has a dist property. so which dist() function is really being called?
