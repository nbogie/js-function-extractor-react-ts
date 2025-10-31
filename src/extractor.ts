import * as acorn from "acorn";
import * as walk from "acorn-walk";
import type { CallExpression, Identifier, MemberExpression } from "acorn";
export type ErrorDetail = { message: string; detail: unknown };
export type ExtractionAttemptResult =
    | { success: true; data: FunctionCallInfo[] }
    | { success: false; error: ErrorDetail };

export type FunctionCallInfo = {
    name: string;
    objectName?: string;
};
/**
 * Extracts and sorts all function call names from a JavaScript snippet.
 * @param jsSnippet The JavaScript code to analyze.
 * @returns A sorted array of the names of the function calls encountered.
 */
export function getSortedFunctionCalls(
    jsSnippet: string
): ExtractionAttemptResult {
    //use a set not an array during collection, as it will ignore any duplicates we add

    const functionCallsAsStrings = new Set<string>();

    try {
        const ast = acorn.parse(jsSnippet, {
            ecmaVersion: 2020,
        });

        walk.simple(ast, {
            CallExpression(node: CallExpression) {
                let info: FunctionCallInfo | undefined = undefined;

                if (node.callee.type === "Identifier") {
                    const idNode = node.callee as Identifier;
                    info = { name: idNode.name };
                } else if (node.callee.type === "MemberExpression") {
                    const memberNode = node.callee as MemberExpression;

                    if (memberNode.property.type === "Identifier") {
                        const propertyId = memberNode.property as Identifier;
                        const objectId = memberNode.object as Identifier;

                        info = {
                            name: propertyId.name,
                            objectName: objectId.name,
                        };
                    }
                }

                if (info) {
                    //serialise to string for storage in set (and free deduplication).
                    // (This is premature optimisation, oops)
                    functionCallsAsStrings.add(
                        serialiseFunctionCallInfoToString(info)
                    );
                }
            },
        });
    } catch (error) {
        return {
            success: false,
            error: {
                message: "Failed to parse the JavaScript snippet:",
                detail: error,
            },
        };
    }
    //TODO: just use an array and de-duplicate later - we're not dealing with millions of calls

    const functionCallInfoObjects = Array.from(functionCallsAsStrings)
        .sort()
        .map(deserialiseFunctionCallStringToInfo);

    return { success: true, data: functionCallInfoObjects };
}

const SEPARATOR = "%%%";

function deserialiseFunctionCallStringToInfo(
    fcString: string
): FunctionCallInfo {
    const [name, objectName] = fcString.split(SEPARATOR);
    if (objectName) {
        return { name, objectName };
    }
    return { name };
}

function serialiseFunctionCallInfoToString(fcInfo: FunctionCallInfo): string {
    const parts = [fcInfo.name, fcInfo.objectName].filter(
        (p) => p !== undefined
    );
    return parts.join(SEPARATOR);
}
