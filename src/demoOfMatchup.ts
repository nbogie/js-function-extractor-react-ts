import { example } from "./exampleJSSnippets/example-snippet-p5-game.ts";
import p5Reference from "../data/p5-reference-data.json" assert { type: "json" };
import { getSortedFunctionCalls } from "./extractor.ts";

console.log(p5Reference.classitems.map((ci) => ci.name));

const result = getSortedFunctionCalls(example);
if (result.success) {
    console.log(
        result.data.map((fc) => {
            //TODO: don't match array.push to p5's push(), etc
            const lookup = p5Reference.classitems.find(
                (ci) => ci.name === fc.name
            );
            return {
                ...fc,
                inP5Ref: lookup !== undefined,
                description: lookup?.description?.slice(0, 50),
            };
        })
    );

    console.log("SUCCESS", result.data);
} else {
    console.log("ERROR", result.error);
}
