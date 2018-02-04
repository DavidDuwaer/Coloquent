import {Builder} from "./Builder";
import {JsonApiDoc} from "./JsonApiDoc";
import {Map} from "./util/Map";
import {AxiosInstance, AxiosPromise, AxiosResponse, AxiosError} from "axios";
import axios from 'axios';
import {PluralResponse} from "./response/PluralResponse";
import {SingularResponse} from "./response/SingularResponse";
import {PaginationStrategy} from "./PaginationStrategy";
import {SaveResponse} from "./response/SaveResponse";
import {ToManyRelation} from "./relation/ToManyRelation";
import {ToOneRelation} from "./relation/ToOneRelation";
import {Reflection} from "./util/Reflection";

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

    protected dates: string[];

    constructor()
    {
        this.type = typeof this;
        this.relations = new Map();
        this.attributes = new Map();
        this.readOnlyAttributes = [];
        this.dates = [];
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
        return <Promise<PluralResponse>> new Builder(this)
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

    public save(): Promise<SaveResponse>
    {
        let thiss = this;
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
            payload['data']['id'] = this.id;
            return this.axiosInstance
                .patch(
                    this.getJsonApiType()+'/'+this.id,
                    payload
                )
                .then(
                    function (response: AxiosResponse) {
                        thiss.setApiId(response.data.data.id);
                        return new SaveResponse(response, thiss.constructor, response.data);
                    },
                    function (response: AxiosError) {
                        throw new Error(response.message);
                    }
                );
        } else {
            return this.axiosInstance
                .post(
                    this.getJsonApiType(),
                    payload
                )
                .then(
                    function (response: AxiosResponse) {
                        thiss.setApiId(response.data.data.id);
                        return new SaveResponse(response, thiss.constructor, response.data);
                    },
                    function (response: AxiosError) {
                        throw new Error(response.message);
                    }
                );
        }
    }

    public create(): Promise<SaveResponse>
    {
        let thiss = this;
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
            payload['data']['id'] = this.id;
        }
        return this.axiosInstance
            .post(
                this.getJsonApiType(),
                payload
            )
            .then(
                function (response: AxiosResponse) {
                    thiss.setApiId(response.data.data.id);
                    return new SaveResponse(response, thiss.constructor, response.data);
                },
                function (response: AxiosError) {
                    throw new Error(response.message);
                }
            );
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

    public getAttributes(): {[key: string]: any}
    {
        return this.attributes.toArray();
    }

    protected getAttribute(attributeName: string): any
    {
        return this.attributes.get(attributeName);
    }

    public asDateTime(value: string): any
    {
        if (!Date.parse(value)) {
            throw new Error(`${value} cannot be cast to type Date`);
        }

        return new Date(value);
    }

    private isDateAttribute(attributeName: string): boolean
    {
        return this.dates.indexOf(attributeName) != -1;
    }

    protected setAttribute(attributeName: string, value: any): void
    {
        if (this.isDateAttribute(attributeName)) {
            value = this.asDateTime(value);
        }

        this.attributes.set(attributeName, value);
    }

    public getApiId(): string
    {
        return this.id;
    }

    public setApiId(id: string): void
    {
        this.id = id;
    }

    protected hasMany(relatedType: typeof Model): ToManyRelation
    {
        let relationName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
        return new ToManyRelation(relatedType, this, relationName);
    }

    protected hasOne(relatedType: typeof Model): ToOneRelation
    {
        let relationName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
        return new ToOneRelation(relatedType, this, relationName);
    }
}