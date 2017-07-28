import {Builder} from "./Builder";
import axios from 'axios';
import {AxiosStatic} from "axios";
import {AxiosInstance} from "axios";
import {JsonApiDoc} from "./JsonApiDoc";

export abstract class Model
{
    private type: string;

    private axiosInstance;

    /**
     * @type {string} The JSON-API type, choose plural, lowercase alphabetic only, e.g. 'artists'
     */
    protected abstract jsonApiType: string;

    /**
     * @type {number} the page size
     */
    protected pageSize: number = 50;

    private id: string;

    private relations: Map<string, any>;

    private attributes: Map<string, any>;

    constructor()
    {
        this.type = typeof this;
        this.axiosInstance = axios.create({
            baseURL: this.getJsonApiBaseUrl(),
            withCredentials: true
        });
        this.relations = new Map();
        this.attributes = new Map();
    }

    public with(attribute: any): Builder<this>
    {
        return new Builder<this>(this)
            .with(attribute);
    }

    public where(attribute: string, value: string): Builder<this>
    {
        return new Builder<this>(this)
            .where(attribute, value);
    }

    /**
     * @returns {string} e.g. 'http://www.foo.com/bar/'
     */
    protected abstract getJsonApiBaseUrl(): string;

    public getAxiosInstance(): AxiosInstance
    {
        return this.axiosInstance;
    }

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

    public getPageSize(): number
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
}