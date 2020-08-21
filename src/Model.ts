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
    public query(): Builder<this>
    {
        return this.constructor.query();
    }

    /**
     * Get a {@link Builder} instance from a static {@link Model}
     * so you can start querying
     */
    public static query<M extends Model>(): Builder<M>
    {
        return new Builder(this);
    }

    public static get<M extends Model>(page?: number): Promise<PluralResponse<M>>
    {
        return <Promise<PluralResponse<M>>> new Builder(this)
            .get(page);
    }

    public static first<M extends Model>(): Promise<SingularResponse<M>>
    {
        return new Builder<M>(this)
            .first();
    }

    public static find<M extends Model>(id: string | number): Promise<SingularResponse<M>>
    {
        return new Builder<M>(this)
            .find(id);
    }

    public static with<M extends Model>(attribute: any): Builder<M>
    {
        return new Builder<M>(this)
            .with(attribute);
    }

    public static limit<M extends Model>(limit: number): Builder<M>
    {
        return new Builder<M>(this)
            .limit(limit);
    }

    public static where<M extends Model>(attribute: string, value: string): Builder<M>
    {
        return new Builder<M>(this)
            .where(attribute, value);
    }

    public static orderBy<M extends Model>(attribute: string, direction?: string): Builder<M>
    {
        return new Builder<M>(this)
            .orderBy(attribute, direction);
    }

    public static option<M extends Model>(queryParameter: string, value: string): Builder<M>
    {
        return new Builder<M>(this)
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

    public save(): Promise<SaveResponse<this>>
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

    public create(): Promise<SaveResponse<this>>
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

    /**
     * @return A {@link Promise} resolving to:
     *
     * * the representation of this {@link Model} instance in the API if this {@link Model} has an ID and this ID can
     * be found in the API too
     * * `undefined` if this {@link Model} instance has no ID
     * * `null` if there _is_ an ID, but a {@link Model} with this ID cannot be found in the backend
     */
    public fresh(): Promise<this | null | undefined>
    {
        let model = <this> (new (<any> this.constructor));
        let builder = model
                        .query()
                        .with(this.getRelationsKeys());

        if (this.getApiId()) {
            return builder
                .find(<string>this.getApiId())
                .then(
                    (response: SingularResponse<this>) => {
                        let model = response.getData();
                        return model;
                    },
                    (response: AxiosError) => {
                        throw response;
                    }
                );
        } else {
            return Promise.resolve(undefined);
        }
    }

    public getRelations()
    {
        return this.relations.toArray();
    }

    public getRelationsKeys(parentRelationName?: string): Array<string> 
    {
        let relationNames: Array<string> = [];

        for (let key in this.relations.toArray()){
            let relation = this.getRelation(key);

            if (parentRelationName) {
                relationNames.push(parentRelationName + '.' +key);
            } else {
                relationNames.push(key);
            }

            if (Array.isArray(relation)) {
                relation.forEach((model: Model) => {
                    relationNames = [...relationNames, ...model.getRelationsKeys(key)]
                });
            } else if (relation) {
                relationNames = [...relationNames, ...relation.getRelationsKeys(key)]
            }
        }

        return relationNames;
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

    protected hasMany<R extends Model>(relatedType: typeof Model): ToManyRelation<R, this>;
    protected hasMany<R extends Model>(relatedType: typeof Model, relationName: string): ToManyRelation<R, this>;
    protected hasMany<R extends Model>(relatedType: typeof Model, relationName?: string): ToManyRelation<R, this>
    {
        if (typeof relationName === 'undefined') {
            relationName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
        }
        return new ToManyRelation(relatedType, this, relationName);
    }

    protected hasOne<R extends Model>(relatedType: typeof Model): ToOneRelation<R, this>;
    protected hasOne<R extends Model>(relatedType: typeof Model, relationName: string): ToOneRelation<R, this>;
    protected hasOne<R extends Model>(relatedType: typeof Model, relationName?: string): ToOneRelation<R, this>
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
