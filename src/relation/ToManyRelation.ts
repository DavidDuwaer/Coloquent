import {Relation} from "./Relation";
import {QueryMethods} from "../QueryMethods";
import {Builder} from "../Builder";
import {PluralResponse} from "../response/PluralResponse";
import {SingularResponse} from "../response/SingularResponse";
import {SortDirection} from "../SortDirection";
import {Model} from "../Model";

export class ToManyRelation<M extends Model = Model, R extends Model = Model> extends Relation<R> implements QueryMethods<M, PluralResponse<M>>
{
    get(page?: number): Promise<PluralResponse<M>> {
        return this.builder.get(page);
    }

    first(): Promise<SingularResponse<M>> {
        return this.builder.first();
    }

    find(id: string | number): Promise<SingularResponse<M>> {
        return this.builder.find(id);
    }

    where(attribute: string, value: string): Builder<M> {
        return this.builder.where(attribute, value);
    }

    with(value: any): Builder<M> {
        return this.builder.with(value);
    }

    public orderBy(attribute: string, direction?: SortDirection|string): Builder<M> {
        return this.builder.orderBy(attribute, direction);
    }

    option(queryParameter: string, value: string): Builder<M> {
        return this.builder.option(queryParameter, value);
    }

    private get builder()
    {
        return new Builder<M>(
            this.relatedType,
            this.name,
            this.getReferringType().effectiveEndpoint,
            this.referringObject.getApiId()
        );
    }
}
