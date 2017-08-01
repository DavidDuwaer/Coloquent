import {Builder} from "./Builder";
import {JsonApiDoc} from "./JsonApiDoc";
import {Map} from "./util/Map";
import {AxiosInstance, AxiosPromise} from "axios";
import axios from 'axios';
import {PluralResponse} from "./PluralResponse";
import {SingularResponse} from "./SingularResponse";

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

    private id: string;

    private relations: Map<any>;

    private attributes: Map<any>;

    private axiosInstance: AxiosInstance;

    constructor()
    {
        this.type = typeof this;
        this.relations = new Map();
        this.attributes = new Map();
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
        return this.axiosInstance
            .patch(
                this.getJsonApiType(),
                {
                    data: {
                        id: this.id,
                        type: this.getJsonApiType(),
                        attributes: this.attributes.toArray()
                    }
                }
            )
            .then(function () {});
    }

    public delete(): Promise<void>
    {
        if (this.getId() === null) {
            throw new Error('Cannot delete a model with no ID.');
        }
        return this.axiosInstance
            .delete(this.getJsonApiType()+'/'+this.getId())
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

    protected getRelation(relationName: string): any
    {
        return this.relations[relationName];
    }

    public setRelation(relationName: string, value: any): void
    {
        this.relations[relationName] = value;
    }

    protected getAttribute(attributeName: string): any
    {
        return this.attributes[attributeName];
    }

    protected setAttribute(attributeName: string, value: any): void
    {
        this.attributes[attributeName] = value;
    }

    public getId(): number|null
    {
        return this.getAttribute('id');
    }

    public setId(id: number): void
    {
        this.setAttribute('id', id);
    }
}