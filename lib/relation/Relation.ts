export class Relation
{
    private relatedType;

    private referringType;

    constructor(relatedType, referringType = null)
    {
        this.relatedType = relatedType;
        this.referringType = referringType;
    }

    public getType(): any
    {
        return this.relatedType;
    }

    public getReferringType(): any
    {
        if (!this.referringType) {
            throw new Error(
                "Referring type not set on this relation. You should define the relation on your model with e.g." +
                " 'this.hasMany(...)' instead of with 'new ToManyRelation(...)'"
            )
        }
        return this.referringType;
    }
}