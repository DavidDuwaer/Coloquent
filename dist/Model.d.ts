import { Builder } from "./Builder";
import { AxiosInstance } from "axios";
import { JsonApiDoc } from "./JsonApiDoc";
export declare abstract class Model {
    private type;
    private axiosInstance;
    /**
     * @type {string} The JSON-API type, choose plural, lowercase alphabetic only, e.g. 'artists'
     */
    protected abstract jsonApiType: string;
    /**
     * @type {number} the page size
     */
    protected pageSize: number;
    private id;
    private relations;
    private attributes;
    constructor();
    with(attribute: any): Builder<this>;
    where(attribute: string, value: string): Builder<this>;
    /**
     * @returns {string} e.g. 'http://www.foo.com/bar/'
     */
    protected abstract getJsonApiBaseUrl(): string;
    getAxiosInstance(): AxiosInstance;
    getJsonApiType(): string;
    populateFromJsonApiDoc(jsonApiDoc: JsonApiDoc): void;
    getPageSize(): number;
    protected getRelation(relationName: string): any;
    setRelation(relationName: string, value: any): void;
    protected getAttribute(attributeName: string): any;
    protected setAttribute(attributeName: string, value: any): void;
}
