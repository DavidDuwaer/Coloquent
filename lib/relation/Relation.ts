export class Relation
{
    private type;

    constructor(type)
    {
        this.type = type;
    }

    public getType(): any
    {
        return this.type;
    }
}