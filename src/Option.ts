export class Option
{
    protected parameter: string;

    protected value: string;

    constructor(parameter: string, value: string)
    {
        this.parameter = parameter;
        this.value = value;
    }

    public getParameter(): string
    {
        return this.parameter;
    }

    public getValue(): string
    {
        return this.value;
    }
}