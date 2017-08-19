import {Builder} from "./Builder";
import {JsonApiDoc} from "./JsonApiDoc";
import {Map} from "./util/Map";
import {AxiosInstance, AxiosPromise} from "axios";
import axios from 'axios';
import {PluralResponse} from "./PluralResponse";
import {SingularResponse} from "./SingularResponse";
import {PaginationStrategy} from "./PaginationStrategy";
import DateFormatter from "php-date-formatter";

export abstract class Model
{
    private type: string;

    /**
     * @type {string} The JSON-API type, choose plural, lowercase alphabetic only, e.g. 'artists'
     */
    protected abstract jsonApiType: string;

    /**
     * @type {number} the page size
     */
    protected static pageSize: number = 50;

    /**
     * @type {PaginationStrategy} the pagination strategy
     */
    protected static paginationStrategy: PaginationStrategy = PaginationStrategy.OffsetBased;

    /**
     * @type {string} the number query parameter name
     */
    protected static paginationPageNumberParamName: string = 'number';

    /**
     * @type {string} the size query parameter name
     */
    protected static paginationPageSizeParamName: string = 'size';

    /**
     * @type {string} the offset query parameter name
     */
    protected static paginationOffsetParamName: string = 'offset';

    /**
     * @type {string} the limit query parameter name
     */
    protected static paginationLimitParName: string = 'limit';

    private id: string;

    private relations: Map<any>;

    private attributes: Map<any>;

    private axiosInstance: AxiosInstance;

    protected readOnlyAttributes: string[];

    protected dates: {[key: string]: string};

    private static dateFormatter;

    constructor()
    {
        this.type = typeof this;
        this.relations = new Map();
        this.attributes = new Map();
        this.readOnlyAttributes = [];
        this.initAxiosInstance();
    }

    private initAxiosInstance(): void
    {
        this.axiosInstance = axios.create({
            baseURL: this.getJsonApiBaseUrl(),
            withCredentials: true
        });
    }

    public static get(page: number = null): Promise<PluralResponse>
    {
        return new Builder(this)
            .get(page);
    }

    public static first(): Promise<SingularResponse>
    {
        return new Builder(this)
            .first();
    }

    public static find(id: number): Promise<SingularResponse>
    {
        return new Builder(this)
            .find(id);
    }

    public static with(attribute: any): Builder
    {
        return new Builder(this)
            .with(attribute);
    }

    public static where(attribute: string, value: string): Builder
    {
        return new Builder(this)
            .where(attribute, value);
    }

    public static option(queryParameter: string, value: string): Builder
    {
        return new Builder(this)
            .option(queryParameter, value);
    }

    public save(): Promise<void>
    {
        let attributes = {};
        for (let key in this.attributes.toArray()) {
            if (this.readOnlyAttributes.indexOf(key) == -1) {
                attributes[key] = this.attributes.get(key);
            }
        }
        let payload = {
            data: {
                type: this.getJsonApiType(),
                attributes: attributes
            }
        };
        if (this.id !== null) {
            return this.axiosInstance
                .patch(
                    this.getJsonApiType()+'/'+this.id,
                    payload
                )
                .then(function () {});
        } else {
            payload['data']['id'] = this.id;
            return this.axiosInstance
                .post(
                    this.getJsonApiType(),
                    payload
                )
                .then(function () {});
        }
    }

    public delete(): Promise<void>
    {
        if (this.id === null) {
            throw new Error('Cannot delete a model with no ID.');
        }
        return this.axiosInstance
            .delete(this.getJsonApiType()+'/'+this.id)
            .then(function () {});
    }

    /**
     * @returns {string} e.g. 'http://www.foo.com/bar/'
     */
    public abstract getJsonApiBaseUrl(): string;

    public getJsonApiType(): string
    {
        return this.jsonApiType;
    }

    public populateFromJsonApiDoc(jsonApiDoc: JsonApiDoc): void
    {
        this.id = jsonApiDoc.id;
        for (let key in jsonApiDoc.attributes) {
            this.setAttribute(key, jsonApiDoc.attributes[key]);
        }
    }

    public static getPageSize(): number
    {
        return this.pageSize;
    }

    public static getPaginationStrategy(): PaginationStrategy
    {
        return this.paginationStrategy;
    }

    public static getPaginationPageNumberParamName(): string
    {
        return this.paginationPageNumberParamName;
    }

    public static getPaginationPageSizeParamName(): string
    {
        return this.paginationPageSizeParamName;
    }

    public static getPaginationOffsetParamName(): string
    {
        return this.paginationOffsetParamName;
    }

    public static getPaginationLimitParamName(): string
    {
        return this.paginationLimitParName;
    }

    protected getRelation(relationName: string): any
    {
        return this.relations.get(relationName);
    }

    public setRelation(relationName: string, value: any): void
    {
        this.relations.set(relationName, value);
    }

    protected getAttribute(attributeName: string): any
    {
        if (this.isDateAttribute(attributeName)) {
            return this.getAttributeAsDate(attributeName);
        }

        return this.attributes.get(attributeName);
    }

    protected getAttributeAsDate(attributeName: string): any
    {
        if (!Date.parse(this.attributes.get(attributeName))) {
            throw new Error(`Attribute ${attributeName} cannot be cast to type Date`);
        }

        return new Date(this.attributes.get(attributeName));
    }

    private isDateAttribute(attributeName: string): boolean
    {
        return this.dates.hasOwnProperty(attributeName);
    }

    protected setAttribute(attributeName: string, value: any): void
    {
        if (this.isDateAttribute(attributeName)) {
            if (!Date.parse(value)) {
                throw new Error(`${value} cannot be cast to type Date`);
            }
            value = Model.getDateFormatter().parseDate(value, this.dates[attributeName]);
        }

        this.attributes.set(attributeName, value);
    }

    /**
     * We use a single instance of DateFormatter, which is stored as a static property on Model, to minimize the number
     * of times we need to instantiate the DateFormatter class. By using this getter a DateFormatter is instantiated
     * only when it is used at least once.
     *
     * @returns DateFormatter
     */
    private static getDateFormatter(): DateFormatter
    {
        if (!Model.dateFormatter) {
            Model.dateFormatter = new DateFormatter();
        }
        return Model.dateFormatter;
    }
}