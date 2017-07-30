import {Builder} from "./Builder";
import {JsonApiDoc} from "./JsonApiDoc";
import {Map} from "./util/Map";
import {AxiosInstance, AxiosPromise} from "axios";
import axios from 'axios';

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

    constructor()
    {
        this.type = typeof this;
        this.relations = new Map();
        this.attributes = new Map();
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

    public save(): Promise<void>
    {
        let thiss = this;
        let axiosInstance: AxiosInstance = axios.create({
            baseURL: this.getJsonApiBaseUrl(),
            withCredentials: true
        });
        return axiosInstance
            .patch(
                this.getJsonApiType(),
                {
                    data: {
                        id: thiss.id,
                        type: thiss.getJsonApiType(),
                        attributes: thiss.attributes.toArray()
                    }
                }
            )
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
}