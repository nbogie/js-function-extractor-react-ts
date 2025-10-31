import p5Reference from "../data/p5-reference-data.json" assert { type: "json" };
import { type FunctionCallInfo } from "./extractor.ts";

console.log(p5Reference.classitems.map((ci) => ci.name));
export interface FunctionCallInfoWithDocs extends FunctionCallInfo {
    p5Ref?: {
        description?: string;
        module?: string;
        submodule?: string;
        type?: string;
        file?: string;
        clazz?: string;
    };
}

export function matchFunctionCallsToP5Ref(
    functionCallInfoObjects: FunctionCallInfo[]
): FunctionCallInfoWithDocs[] {
    return functionCallInfoObjects.map((fc) => {
        //TODO: don't match array.push to p5's push(), console.log to p5's log(), Math.sin() with sin(), etc
        const lookup = p5Reference.classitems.find((ci) => ci.name === fc.name);
        if (lookup) {
            const { file, module, submodule, type } = lookup;

            return {
                ...fc,
                p5Ref: {
                    description: lookup?.description?.slice(0, 50),
                    file,
                    module,
                    submodule,
                    type,
                    clazz: lookup.class,
                },
            };
        }
        return fc;
    });
}
