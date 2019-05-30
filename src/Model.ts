import {Builder} from "./Builder";
import {Resource} from "./Resource";
import {Map} from "./util/Map";
import {AxiosError} from "axios";
import {PluralResponse} from "./response/PluralResponse";
import {SingularResponse} from "./response/SingularResponse";
import {PaginationStrategy} from "./PaginationStrategy";
import DateFormatter from "php-date-formatter";
import {SaveResponse} from "./response/SaveResponse";
import {ToManyRelation} from "./relation/ToManyRelation";
import {ToOneRelation} from "./relation/ToOneRelation";
import {Reflection} from "./util/Reflection";
import {HttpClient} from "./httpclient/HttpClient";
import {AxiosHttpClient} from "./httpclient/axios/AxiosHttpClient";
import {HttpClientResponse} from "./httpclient/HttpClientResponse";

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
     * @type {string} The number query parameter name. By default: 'page[number]'
     */
    protected static paginationPageNumberParamName: string = 'page[number]';

    /**
     * @type {string} The size query parameter name. By default: 'page[size]'
     */
    protected static paginationPageSizeParamName: string = 'page[size]';

    /**
     * @type {string} The offset query parameter name. By default: 'page[offset]'
     */
    protected static paginationOffsetParamName: string = 'page[offset]';

    /**
     * @type {string} The limit query parameter name. By default: 'page[limit]'
     */
    protected static paginationLimitParName: string = 'page[limit]';

    private id: string;

    private relations: Map<any>;

    private attributes: Map<any>;

    private static httpClient: HttpClient;

    protected readOnlyAttributes: string[];

    protected dates: {[key: string]: string};

    private static dateFormatter;

    constructor()
    {
        this.type = typeof this;
        this.relations = new Map();
        this.attributes = new Map();
        this.readOnlyAttributes = [];
        Model.httpClient = new AxiosHttpClient();
        this.dates = {};
        this.initHttpClient();
    }

    private initHttpClient(): void
    {
        Model.httpClient.setBaseUrl(this.getJsonApiBaseUrl());
    }

    public static get(page: number = null): Promise<PluralResponse>
    {
        return <Promise<PluralResponse>> new Builder(this)
            .get(page);
    }

    public static first(): Promise<SingularResponse>
    {
        return new Builder(this)
            .first();
    }

    public static find(id: string | number): Promise<SingularResponse>
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

    public static orderBy(attribute: string, direction: string = null): Builder
    {
        return new Builder(this)
            .orderBy(attribute, direction);
    }

    public static option(queryParameter: string, value: string): Builder
    {
        return new Builder(this)
            .option(queryParameter, value);
    }

    private serialize()
    {
        let attributes = {};
        for (let key in this.attributes.toArray()) {
            if (this.readOnlyAttributes.indexOf(key) == -1) {
                attributes[key] = this.attributes.get(key);
            }
        }
        let relationships = {};
        for (let key in this.relations.toArray()) {
            let model = this.relations.get(key);
            if (model instanceof Model) {
                relationships[key] = {
                    data: {
                        type: model.getJsonApiType(),
                        id: model.id
                    }
                };
            }
        }

        let payload = {
            data: {
                type: this.getJsonApiType(),
                attributes,
                relationships
            }
        };
        if (this.id !== null) {
            payload['data']['id'] = this.id;
        }
        return payload;
    }

    public save(): Promise<SaveResponse>
    {
        if (this.id === undefined || this.id === '') {
            return this.create();
        }

        let payload = this.serialize();
        return Model.httpClient
            .patch(
                this.getJsonApiType()+'/'+this.id,
                payload
            )
            .then(
                (response: HttpClientResponse) => {
                    this.setApiId(response.getData().data.id);
                    return new SaveResponse(response, this.constructor, response.getData());
                },
                (response: AxiosError) => {
                    throw response;
                }
            );
    }

    public create(): Promise<SaveResponse>
    {
        let payload = this.serialize();
        return Model.httpClient
            .post(
                this.getJsonApiType(),
                payload
            )
            .then(
                (response: HttpClientResponse) => {
                    this.setApiId(response.getData().data.id);
                    return new SaveResponse(response, this.constructor, response.getData());
                },
                function (response: AxiosError) {
                    throw new Error((<Error> response).message);
                }
            );
    }

    public delete(): Promise<void>
    {
        if (this.id === null) {
            throw new Error('Cannot delete a model with no ID.');
        }
        return Model.httpClient
            .delete(this.getJsonApiType()+'/'+this.id)
            .then(function () {});
    }

    /**
     * @returns {string} e.g. 'http://www.foo.com/bar/'
     */
    public abstract getJsonApiBaseUrl(): string;

    /**
     * Allows you to get the current HTTP client (AxiosHttpClient by default), e.g. to alter its configuration.
     * @returns {HttpClient}
     */
    public static getHttpClient(): HttpClient
    {
        return this.httpClient;
    }

    /**
     * Allows you to use any HTTP client library, as long as you write a wrapper for it that implements the interfaces
     * HttpClient, HttpClientPromise and HttpClientResponse.
     * @param httpClient
     */
    public static setHttpClient(httpClient: HttpClient)
    {
        this.httpClient = httpClient;
    }

    public getJsonApiType(): string
    {
        return this.jsonApiType;
    }

    public populateFromResource(resource: Resource): void
    {
        this.id = resource.id;
        for (let key in resource.attributes) {
            this.setAttribute(key, resource.attributes[key]);
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

    public getAttributes(): {[key: string]: any}
    {
        return this.attributes.toArray();
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
            value = (<any> Model.getDateFormatter()).parseDate(value, this.dates[attributeName]);
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

    public getApiId(): string
    {
        return this.id;
    }

    public setApiId(id: string): void
    {
        this.id = id;
    }

    protected hasMany(relatedType: typeof Model): ToManyRelation;
    protected hasMany(relatedType: typeof Model, relationName: string): ToManyRelation;
    protected hasMany(relatedType: typeof Model, relationName?: string): ToManyRelation
    {
        if (typeof relationName === 'undefined') {
            relationName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
        }
        return new ToManyRelation(relatedType, this, relationName);
    }

    protected hasOne(relatedType: typeof Model): ToOneRelation;
    protected hasOne(relatedType: typeof Model, relationName: string): ToOneRelation;
    protected hasOne(relatedType: typeof Model, relationName?: string): ToOneRelation
    {
        if (typeof relationName === 'undefined') {
            relationName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
        }
        return new ToOneRelation(relatedType, this, relationName);
    }
}
