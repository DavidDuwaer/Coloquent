export class Reflection
{
    public static getNameOfNthMethodOffStackTrace(error: Error, n: number): string | undefined
    {
        const re = /@|at [a-zA-Z0-9\.\/_]+\.([a-zA-Z0-9_]+) \(/g;
        const stack = error.stack !== undefined ? error.stack : '';
        for (let i: number = 0; i < n - 1; i++) {
            re.exec(stack);
        }
        const results = re.exec(stack); // exec second time and get submatch
        return (results !== null && results.length >= 2)
            ?
            results[1]
            :
            undefined;
    }
}
