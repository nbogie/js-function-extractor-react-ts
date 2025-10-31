import { useState } from "react";
import "./App.css";
import { getSortedFunctionCalls, type ErrorDetail } from "./extractor";
import { example } from "./exampleJSSnippets/example-snippet-p5-game.ts";
import {
    matchFunctionCallsToP5Ref,
    type FunctionCallInfoWithDocs,
} from "./docMatcher.ts";
import { partition } from "lodash";
function App() {
    /** The JS snippet (text) the user inputs for analysis.  might be bogus. */
    const [snippet, setSnippet] = useState(example);
    const [showExtra, setShowExtra] = useState(false);

    /**
     * the list of function names parsed out from the snippet, if any
     */
    const [functions, setFunctions] = useState(
        [] as FunctionCallInfoWithDocs[]
    );
    /**
     * details of the last error encountered by the analysis, if any.
     */
    const [lastError, setLastError] = useState(
        undefined as ErrorDetail | undefined
    );

    function handleClick() {
        const result = getSortedFunctionCalls(snippet);
        if (result.success) {
            const callsAndReferences = matchFunctionCallsToP5Ref(result.data);
            //really, sort-by would be enough here, but the sort has already been done
            const [p5Calls, otherCalls] = partition(
                callsAndReferences,
                (fci) => fci.p5Ref !== undefined
            );

            setFunctions(p5Calls.concat(otherCalls));
            setLastError(undefined);
        } else {
            setFunctions([]);
            setLastError(result.error);
        }
    }
    return (
        <>
            <h1>JS Function-call extractor</h1>
            <div className="card">
                <textarea
                    onChange={(e) => setSnippet(e.target.value)}
                    value={snippet}
                    rows={20}
                    cols={80}
                />
                <button onClick={() => setShowExtra((v) => !v)}>
                    {showExtra ? <>extra info is ON</> : <>extra info is OFF</>}
                </button>
                <button onClick={handleClick}>
                    extract functions from js snippet
                </button>
                <h2>Functions extracted</h2>
                <div style={{ textAlign: "left" }}>
                    Deduplicated, and sorted (p5 functions first,
                    alphabetically)
                </div>
                <div style={{ textAlign: "left" }}>
                    Note some functions are still overeagerly mismatched to p5
                    functions, e.g. array.push() to p5's push(), console.log()
                    to p5's log(), Math.sin() with p5's sin(), etc
                </div>

                <div className="function-names">
                    {functions.map((fcInfo) => (
                        // todo: ensure this key is unique.

                        <div key={fcInfo.name}>
                            <strong>
                                {fcInfo.name}

                                {fcInfo.objectName !== undefined && (
                                    <>
                                        {" "}
                                        in{" "}
                                        {fcInfo.objectName + "." + fcInfo.name}
                                    </>
                                )}
                            </strong>{" "}
                            {fcInfo.p5Ref && (
                                <>
                                    <P5DocsLink fcInfo={fcInfo} />
                                    <P5DocsLink fcInfo={fcInfo} isBeta={true} />
                                    {showExtra && (
                                        <>
                                            <span className="p5Ref">
                                                {fcInfo.p5Ref.module} -{" "}
                                                {fcInfo.p5Ref.file}{" "}
                                                {fcInfo.p5Ref.description}
                                            </span>
                                            <pre>
                                                {JSON.stringify(
                                                    fcInfo.p5Ref,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <hr></hr>
                {lastError && (
                    <textarea
                        readOnly
                        value={JSON.stringify(lastError, null, 2)}
                        rows={10}
                        cols={30}
                    />
                )}
            </div>
            <footer>
                <a href="https://github.com/nbogie/js-function-extractor-react-ts">
                    Source code (React + TS)
                </a>
            </footer>
        </>
    );
}

export default App;

interface P5DocsLinkProps {
    fcInfo: FunctionCallInfoWithDocs;
    isBeta?: boolean;
}
function P5DocsLink(props: P5DocsLinkProps) {
    const baseURL = props.isBeta ? "https://beta.p5js.org" : "https://p5js.org";
    return (
        //example
        // https://p5js.org/reference/p5/createCanvas/
        // https://p5js.org/reference/p5.Vector/fromAngle/
        <a
            href={`${baseURL}/reference/${props.fcInfo.p5Ref?.clazz}/${props.fcInfo.name}`}
        >
            {props.isBeta ? <>[p5.js beta docs]</> : <>[p5.js docs]</>}
        </a>
    );
}
