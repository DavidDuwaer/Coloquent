import ErrorStackParser from 'error-stack-parser'

export class Reflection
{
    public static getNameOfNthMethodOffStackTrace(error: Error, n: number): string | undefined
    {
        const parsed = ErrorStackParser.parse(error);
        const functionName = parsed.length >= n
            ? parsed[n-1].functionName
            : undefined
        return functionName !== undefined
            ? getMethodName(functionName)
            : undefined;
    }
}

function getMethodName(functionName: string)
{
    const matcher = functionName.match(/[^.]+$/);
    if (matcher !== null && matcher.length > 0)
        return matcher[0];
}