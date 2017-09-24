import {Model} from "../Model";
export class Relation
{
    private relatedType;

    private referringObject: Model;

    constructor(relatedType, referringObject: Model = null)
    {
        this.relatedType = relatedType;
        this.referringObject = referringObject;
    }

    public getType(): any
    {
        return this.relatedType;
    }

    public getReferringObject(): Model
    {
        if (!this.referringObject) {
            throw new Error(
                "Referring type not set on this relation. You should define the relation on your model with e.g." +
                " 'this.hasMany(...)' instead of with 'new ToManyRelation(...)'"
            )
        }
        return this.referringObject;
    }
}