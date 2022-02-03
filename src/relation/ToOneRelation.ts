import {Relation} from "./Relation";
import {Builder} from "../Builder";
import {SingularResponse} from "../response/SingularResponse";
import {QueryMethods} from "../QueryMethods";
import {SortDirection} from "../SortDirection";
import {Model} from "../Model";

export class ToOneRelation<M extends Model = Model, R extends Model = Model> extends Relation<R> implements QueryMethods<M, SingularResponse<M>>
{
    get(page?: number): Promise<SingularResponse<M>> {
        return this.builder.get(page);
    }

    first(): Promise<SingularResponse<M>> {
        return this.builder.first();
    }

    find(id: string | number): Promise<SingularResponse<M>> {
        return this.builder.find(id);
    }

    where(attribute: string, value: string): Builder<M, SingularResponse<M>> {
        return this.builder.where(attribute, value);
    }

    with(value: any): Builder<M, SingularResponse<M>> {
        return this.builder.with(value);
    }

    orderBy(attribute: string, direction?: SortDirection|string): Builder<M, SingularResponse<M>> {
        return this.builder.orderBy(attribute, direction);
    }

    option(queryParameter: string, value: string): Builder<M, SingularResponse<M>> {
        return this.builder.option(queryParameter, value);
    }

    private get builder()
    {
        return new Builder<M, SingularResponse<M>>(
            this.relatedType,
            this.name,
            this.getReferringType().effectiveEndpoint,
            this.referringObject.getApiId(),
            true
        );
    }
}
