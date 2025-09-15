import * as acorn from "acorn";
import * as walk from "acorn-walk";
import type { CallExpression, Identifier, MemberExpression } from "acorn";
export type ErrorDetail = { message: string; detail: unknown };
export type ExtractionAttemptResult =
    | { success: true; data: string[] }
    | { success: false; error: ErrorDetail };

/**
 * Extracts and sorts all function call names from a JavaScript snippet.
 * @param jsSnippet The JavaScript code to analyze.
 * @returns A sorted array of the names of the function calls encountered.
 */
export function getSortedFunctionCalls(
    jsSnippet: string
): ExtractionAttemptResult {
    const functionCalls = new Set<string>();

    try {
        const ast = acorn.parse(jsSnippet, {
            ecmaVersion: 2020,
        });

        walk.simple(ast, {
            CallExpression(node: CallExpression) {
                let name: string = "";

                if (node.callee.type === "Identifier") {
                    const idNode = node.callee as Identifier;
                    name = idNode.name;
                } else if (node.callee.type === "MemberExpression") {
                    const memberNode = node.callee as MemberExpression;

                    if (memberNode.property.type === "Identifier") {
                        const propertyId = memberNode.property as Identifier;
                        const objectId = memberNode.object as Identifier;
                        name = `${propertyId.name} IN ${objectId.name}.${propertyId.name}`;
                    }
                }

                if (name) {
                    functionCalls.add(name);
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

    return { success: true, data: Array.from(functionCalls).sort() };
}
