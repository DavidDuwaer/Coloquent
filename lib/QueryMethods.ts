import {Builder} from "./Builder";
import {PluralResponse} from "./response/PluralResponse";
import {SingularResponse} from "./response/SingularResponse";
import {Response} from "./response/Response";

export interface QueryMethods
{
    get(page: number): Promise<Response>;

    first(): Promise<SingularResponse>;

    find(id: string | number ): Promise<SingularResponse>;

    where(attribute: string, value: string): Builder;

    with(value: any): Builder;

    orderBy(attribute: string, direction: string): Builder;

    option(queryParameter: string, value: string): Builder;
}