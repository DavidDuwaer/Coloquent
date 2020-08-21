import {Builder} from "./Builder";
import {SingularResponse} from "./response/SingularResponse";
import {PluralResponse} from "./response/PluralResponse";
import {SortDirection} from "./SortDirection";

export interface QueryMethods
{
    /**
     * Fetches a single page
     * @param page
     */
    get(page: number): Promise<SingularResponse | PluralResponse>;

    /**
     * Fetches the first result available in the backend
     */
    first(): Promise<SingularResponse>;

    /**
     * Fetches the result with the specified ID
     * @param id
     */
    find(id: string | number): Promise<SingularResponse>;

    /**
     * Adds a "where equals" clause to the query
     * @param {string} attribute - The attribute being tested
     * @param {string} value - The value the attribute should equal
     */
    where(attribute: string, value: string): Builder;

    /**
     * Specify a relation that should be joined and included in the returned object graph
     * @param {any} value
     */
    with(value: any): Builder;

    /**
     * Specify an attribute to sort by and the direction to sort in
     * @param {string} attribute - The attribute to sort by
     * @param {string direction - The direction to sort in
     */
    orderBy(attribute: string, direction?: SortDirection|string): Builder;

    /**
     * Specify a custom query parameter to add to the resulting HTTP request URL
     * @param {string} queryParameter - The name of the parameter, e.g. 'a' in "http://foo.com?a=v"
     * @param {string} value - The value of the parameter, e.g. 'v' in "http://foo.com?a=v"
     */
    option(queryParameter: string, value: string): Builder;
}