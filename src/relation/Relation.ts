import {Model} from "../Model";
import {Reflection} from "../util/Reflection";
export class Relation<R extends Model = Model>
{
    private relatedType;

    private referringObject: R | undefined;

    private name: string;

    constructor(relatedType, referringObject: R | undefined = undefined, name: string | undefined = undefined)
    {
        this.relatedType = relatedType;
        this.referringObject = referringObject;
        if (name !== undefined) {
            this.name = name;
        } else {
            const calculatedName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
            if (calculatedName === undefined) {
                throw new Error(
                    'Relationship name could not be automatically determined. '
                    + 'It is recommended to provide the relationship name explicitly in the relationship definition.'
                );
            }
            this.name = calculatedName;
        }
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

    public getName(): string
    {
        if (!this.name) {
            throw new Error(
                "Cannot deduce name of relation. You should define the relation on your model with e.g." +
                " 'this.hasMany(...)' instead of with 'new ToManyRelation(...)'"
            );
        }
        return this.name;
    }
}
