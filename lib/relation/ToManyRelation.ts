import {Relation} from "./Relation";
import {QueryMethods} from "../QueryMethods";
import {Builder} from "../Builder";
import {PluralResponse} from "../response/PluralResponse";
import {SingularResponse} from "../response/SingularResponse";

export class ToManyRelation extends Relation implements QueryMethods
{
    get(page?: number): Promise<PluralResponse> {
        return <Promise<PluralResponse>> new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType())
            .get(page);
    }

    first(): Promise<SingularResponse> {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType())
            .first();
    }

    find(id: number): Promise<SingularResponse> {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType())
            .find(id);
    }

    where(attribute: string, value: string): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType())
            .where(attribute, value);
    }

    with(value: any): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType())
            .with(value);
    }

    orderBy(attribute: string, direction?: string): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType())
            .orderBy(attribute, direction);
    }

    option(queryParameter: string, value: string): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType())
            .option(queryParameter, value);
    }
}