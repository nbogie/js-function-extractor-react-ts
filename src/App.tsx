import { useState } from "react";
import "./App.css";
import { getSortedFunctionCalls, type ErrorDetail } from "./extractor";
import { example } from "./exampleJSSnippets/example-snippet-p5-game.ts";

function App() {
    /** The JS snippet (text) the user inputs for analysis.  might be bogus. */
    const [snippet, setSnippet] = useState(example);
    /**
     * the list of function names parsed out from the snippet, if any
     */
    const [functions, setFunctions] = useState([] as string[]);
    /**
     * details of the last error encountered by the analysis, if any.
     */
    const [lastError, setLastError] = useState(
        undefined as ErrorDetail | undefined
    );

    function handleClick() {
        const result = getSortedFunctionCalls(snippet);
        if (result.success) {
            setFunctions(result.data);
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
                    rows={10}
                    cols={30}
                />

                <button onClick={handleClick}>extract functions</button>
                <h2>Functions extracted</h2>
                <div className="function-names">
                    {functions.map((name) => (
                        <div key={name}>{name}</div>
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
        </>
    );
}

export default App;
