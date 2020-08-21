import {Relation} from "./Relation";
import {QueryMethods} from "../QueryMethods";
import {Builder} from "../Builder";
import {PluralResponse} from "../response/PluralResponse";
import {SingularResponse} from "../response/SingularResponse";
import {SortDirection} from "../SortDirection";
import {Model} from "../Model";

export class ToManyRelation<M extends Model = Model, R extends Model = Model> extends Relation<R> implements QueryMethods<M>
{
    get(page?: number): Promise<PluralResponse<M>> {
        return <Promise<PluralResponse<M>>> new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getApiId())
            .get(page);
    }

    first(): Promise<SingularResponse<M>> {
        return new Builder<M>(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getApiId())
            .first();
    }

    find(id: string | number): Promise<SingularResponse<M>> {
        return new Builder<M>(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getApiId())
            .find(id);
    }

    where(attribute: string, value: string): Builder<M> {
        return new Builder<M>(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getApiId())
            .where(attribute, value);
    }

    with(value: any): Builder<M> {
        return new Builder<M>(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getApiId())
            .with(value);
    }

    public orderBy(attribute: string, direction?: SortDirection|string): Builder<M> {
        return new Builder<M>(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getApiId())
            .orderBy(attribute, direction);
    }

    option(queryParameter: string, value: string): Builder<M> {
        return new Builder<M>(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getApiId())
            .option(queryParameter, value);
    }
}
