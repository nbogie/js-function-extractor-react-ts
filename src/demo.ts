import { example } from "./exampleJSSnippets/example-snippet-p5-game.ts";
import { getSortedFunctionCalls } from "./extractor.ts";
const result = getSortedFunctionCalls(example);
if (result.success) {
    console.log("SUCCESS", result.data);
} else {
    console.log("ERROR", result.error);
}
