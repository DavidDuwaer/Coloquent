export class SortSpec
{
    private attribute: string;

    private positiveDirection: boolean;

    constructor(attribute: string, positiveDirection: boolean = true)
    {
        this.attribute = attribute;
        this.positiveDirection = positiveDirection;
    }

    getAttribute(): string
    {
        return this.attribute;
    }

    getPositiveDirection(): boolean
    {
        return this.positiveDirection;
    }
}