export class FilterSpec
{
    private attribute: string;

    private value: string;

    constructor(attribute: string, value: string)
    {
        this.attribute = attribute;
        this.value = value;
    }

    getAttribute(): string
    {
        return this.attribute;
    }

    getValue(): string
    {
        return this.value;
    }
}