import {Model} from "../Model";
import {Reflection} from "../util/Reflection";
export class Relation<R extends Model = Model>
{
    protected readonly relatedType;
    protected readonly referringObject: R;
    protected readonly name: string;

    constructor(
        relatedType,
        referringObject?: R,
        name?: string
    )
    {
        this.relatedType = relatedType;
        this.referringObject = (() => {
            if (referringObject === undefined) {
                throw new Error(
                    "Referring type not set on this relation. You should define the relation on your model with e.g." +
                    " 'this.hasMany(...)' instead of with 'new ToManyRelation(...)'"
                )
            }
            return referringObject;
        })();
        this.name = (() => {
            if (name !== undefined) {
                return name;
            } else {
                const calculatedName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
                if (calculatedName === undefined) {
                    throw new Error(
                        'Relationship name could not be automatically determined. '
                        + 'It is recommended to provide the relationship name explicitly in the relationship definition.'
                    );
                }
                return calculatedName;
            }
        })();
    }

    public getType(): any
    {
        return this.relatedType;
    }

    public getReferringType(): typeof Model
    {
        return this.getReferringObject().constructor;
    }

    public getReferringObject(): Model
    {
        return this.referringObject;
    }

    public getName(): string
    {
        return this.name;
    }
}
