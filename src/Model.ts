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

export interface Model {
    constructor: typeof Model;
}
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

    private id: string | undefined;

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
        this.dates = {};

        if (!Model.httpClient) {
            Model.httpClient = new AxiosHttpClient();
        }

        this.initHttpClient();
    }

    private initHttpClient(): void
    {
        Model.httpClient.setBaseUrl(this.getJsonApiBaseUrl());
    }

    /**
     * Get a {@link Builder} instance from a {@link Model} instance
     * so you can query without having a static reference to your specific {@link Model}
     * class.
     */
    public query(): Builder
    {
        return new Builder(this.constructor);
    }

    public static get(page?: number): Promise<PluralResponse>
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

    public static orderBy(attribute: string, direction?: string): Builder
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
            let relation = this.relations.get(key);
            if (relation instanceof Model) {
                relationships[key] = this.serializeToOneRelation(relation);
            } else if (relation instanceof Array && relation.length > 0) {
                relationships[key] = this.serializeToManyRelation(relation);
            }
        }

        let payload = {
            data: {
                type: this.getJsonApiType(),
                attributes,
                relationships
            }
        };
        if (this.hasId) {
            payload['data']['id'] = this.id;
        }
        return payload;
    }

    private serializeRelatedModel(model: Model): any {
        return {
            type: model.getJsonApiType(),
            id: model.id
        };
    }

    private serializeToOneRelation(model: Model): any {
        return {
            data: this.serializeRelatedModel(model),
        }
    }

    private serializeToManyRelation(models: Model[]) {
        return {
            data: models.map((model) => this.serializeRelatedModel(model))
        };
    }

    public save(): Promise<SaveResponse>
    {
        if (!this.hasId) {
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
                    const idFromJson: string | undefined = response.getData().data.id;
                    this.setApiId(idFromJson);
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
                    const idFromJson: string | undefined = response.getData().data.id;
                    this.setApiId(idFromJson);
                    return new SaveResponse(response, this.constructor, response.getData());
                },
                function (response: AxiosError) {
                    throw response;
                }
            );
    }

    public delete(): Promise<void>
    {
        if (!this.hasId) {
            throw new Error('Cannot delete a model with no ID.');
        }
        return Model.httpClient
            .delete(this.getJsonApiType()+'/'+this.id)
            .then(function () {});
    }

    public fresh(): Promise<this>
    {
        let model = <this> (new (<any> this.constructor));
        let builder = model.query();

        for (let key in this.relations.toArray()){
            builder = builder.with(key);
        }

        if (this.getApiId()) {
            return builder
                .find(<string>this.getApiId())
                .then(
                    (response: SingularResponse) => {
                        let model = <this> response.getData();
                        return model;
                    },
                    (response: AxiosError) => {
                        throw response;
                    }
                );
        } else {
            return Promise.resolve(model);
        }
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

    public getApiId(): string | undefined
    {
        return this.id;
    }

    public setApiId(id: string | undefined): void
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

    private get hasId(): boolean
    {
        return this.id !== undefined
            && this.id !== null
            && this.id !== '';
    }
}
