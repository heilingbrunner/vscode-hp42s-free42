/** Shape of the extra fields a Peggy syntax error carries. */
interface PeggySyntaxError extends Error {
    location: { start: { line: number; column: number } };
    found: unknown;
}

function isPeggySyntaxError(e: unknown): e is PeggySyntaxError {
    return e instanceof Error && 'location' in e && !!(e as PeggySyntaxError).location;
}

/** Log a parser error; Peggy syntax errors get position details. */
export function logParseError(e: unknown): void {
    if (isPeggySyntaxError(e)) {
        console.error("Parse-Error:");
        console.error(`  → Position: line ${e.location.start.line}, column ${e.location.start.column}`);
        console.error(`  → Found   : ${e.found !== null ? JSON.stringify(e.found) : "nothing"}`);
        console.error(`  → Message : ${e.message}`);
    } else {
        console.error("Error:", e);
    }
}
