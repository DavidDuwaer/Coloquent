import ErrorStackParser from 'error-stack-parser'

export class Reflection
{
    public static getNameOfNthMethodOffStackTrace(error: Error, n: number): string | undefined
    {
        const parsed = ErrorStackParser.parse(error)
        return (parsed.length >= n) ? parsed[n-1].functionName : undefined;
    }
}
