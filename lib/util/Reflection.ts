export class Reflection
{
    public static getNameOfNthMethodOffStackTrace(error: Error, n: number): string
    {
        let re = /@|at [a-zA-Z0-9\._]+\.([a-zA-Z0-9_]+) \(/g;
        let stack = error.stack;
        for (let i: number = 0; i < n - 1; i++) {
            re.exec(stack);
        }
        return re.exec(stack)[1]; // exec second time and get submatch
    }
}