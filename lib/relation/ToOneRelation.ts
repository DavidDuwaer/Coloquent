import {Relation} from "./Relation";
import {PluralResponse} from "../response/PluralResponse";
import {Builder} from "../Builder";
import {SingularResponse} from "../response/SingularResponse";
import {QueryMethods} from "../QueryMethods";
import {SortDirection} from "../SortDirection";

export class ToOneRelation extends Relation implements QueryMethods
{
    get(page?: number): Promise<SingularResponse> {
        return <Promise<SingularResponse>> new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), true)
            .get(page);
    }

    first(): Promise<SingularResponse> {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), true)
            .first();
    }

    find(id: string | number): Promise<SingularResponse> {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), true)
            .find(id);
    }

    where(attribute: string, value: string): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), true)
            .where(attribute, value);
    }

    with(value: any): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), true)
            .with(value);
    }

    orderBy(attribute: string, direction?: SortDirection|string): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), true)
            .orderBy(attribute, direction);
    }

    option(queryParameter: string, value: string): Builder {
        return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), true)
            .option(queryParameter, value);
    }
}