import {Relation} from "./Relation";
import {Builder} from "../Builder";
import {SingularResponse} from "../response/SingularResponse";
import {QueryMethods} from "../QueryMethods";
import {SortDirection} from "../SortDirection";
import {Model} from "../Model";

export class ToOneRelation<M extends Model = Model, R extends Model = Model> extends Relation<R> implements QueryMethods<M, SingularResponse<M>>
{
    get(page?: number): Promise<SingularResponse<M>> {
        return new Builder<M, SingularResponse<M>>(this.getType(), this.getName(), this.getReferringType().effectiveJsonApiType, this.getReferringObject().getApiId(), true)
            .get(page);
    }

    first(): Promise<SingularResponse<M>> {
        return new Builder<M, SingularResponse<M>>(this.getType(), this.getName(), this.getReferringType().effectiveJsonApiType, this.getReferringObject().getApiId(), true)
            .first();
    }

    find(id: string | number): Promise<SingularResponse<M>> {
        return new Builder<M, SingularResponse<M>>(this.getType(), this.getName(), this.getReferringType().effectiveJsonApiType, this.getReferringObject().getApiId(), true)
            .find(id);
    }

    where(attribute: string, value: string): Builder<M, SingularResponse<M>> {
        return new Builder<M, SingularResponse<M>>(this.getType(), this.getName(), this.getReferringType().effectiveJsonApiType, this.getReferringObject().getApiId(), true)
            .where(attribute, value);
    }

    with(value: any): Builder<M, SingularResponse<M>> {
        return new Builder<M, SingularResponse<M>>(this.getType(), this.getName(), this.getReferringType().effectiveJsonApiType, this.getReferringObject().getApiId(), true)
            .with(value);
    }

    orderBy(attribute: string, direction?: SortDirection|string): Builder<M, SingularResponse<M>> {
        return new Builder<M, SingularResponse<M>>(this.getType(), this.getName(), this.getReferringType().effectiveJsonApiType, this.getReferringObject().getApiId(), true)
            .orderBy(attribute, direction);
    }

    option(queryParameter: string, value: string): Builder<M, SingularResponse<M>> {
        return new Builder<M, SingularResponse<M>>(this.getType(), this.getName(), this.getReferringType().effectiveJsonApiType, this.getReferringObject().getApiId(), true)
            .option(queryParameter, value);
    }
}
