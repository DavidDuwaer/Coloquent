import {Model} from "./Model";
import {FilterSpec} from "./FilterSpec";
import {ClassFilterSpec} from "./ClassFilterSpec";
import {SortSpec} from "./SortSpec";
import {AxiosResponse, AxiosError, AxiosInstance} from "axios";
import {PluralResponse} from "./PluralResponse";
import {SingularResponse} from "./SingularResponse";
import {Promise} from 'es6-promise';
import axios from 'axios';

export class Builder
{
    protected model: Model;

    protected modelType: any;

    protected filters: FilterSpec[];

    protected include: string[];

    protected sort: SortSpec[];

    protected pageOffset: number;

    protected pageLimit: number;

    private axiosInstance;

    constructor(modelType: typeof Model)
    {
        this.modelType = modelType;
        this.model = new this.modelType();
        this.filters = [];
        this.include = [];
        this.sort = [];
        this.pageOffset = null;
        this.pageLimit = modelType.getPageSize();
        this.axiosInstance = axios.create({
            baseURL: this.model.getJsonApiBaseUrl(),
            withCredentials: true
        });
    }

    public get(page: number = 0): Promise<PluralResponse>
    {
        let thiss = this;
        this.setPage(page);
        return <Promise<PluralResponse>> this.getAxiosInstance()
            .get(this.model.getJsonApiType()+this.getParameterString())
            .then(
                function (response: AxiosResponse) {
                    return new PluralResponse(thiss.modelType, response.data);
                },
                function (response: AxiosError) {
                    throw new Error(response.message);
                }
            );
    }

    public first(): Promise<SingularResponse>
    {
        let thiss = this;
        this.pageLimit = 1;
        return <Promise<SingularResponse>> this.getAxiosInstance()
            .get(this.model.getJsonApiType()+this.getParameterString())
            .then(
                function (response: AxiosResponse) {
                    return new SingularResponse(thiss.modelType, response.data, true);
                },
                function (response: AxiosError) {
                    throw new Error(response.message);
                }
            );
    }

    public find(id: number): Promise<SingularResponse>
    {
        let thiss = this;
        return <Promise<SingularResponse>> this.getAxiosInstance()
            .get(this.model.getJsonApiType()+'/'+id+this.getParameterString())
            .then(
                function (response: AxiosResponse) {
                    return new SingularResponse(thiss.modelType, response.data);
                },
                function (response: AxiosError) {
                    throw new Error(response.message);
                }
            );
    }

    public where(attribute: string, value: string): Builder
    {
        this.filters.push(new FilterSpec(attribute, value));
        return this;
    }

    public with(value: any): Builder
    {
        if (typeof value === 'string') {
            this.include.push(value);
        } else if (Array.isArray(value)) {
            for (let v of value) {
                this.include.push(v);
            }
        } else {
            throw new Error("The argument for 'with' must be a string or an array of strings.");
        }
        return this;
    }

    public orderBy(attribute: string, direction: string): Builder
    {
        if (direction && ['asc', 'desc'].indexOf(direction) > -1) {
            throw new Error("The 'direction' parameter must be string of value 'asc' or 'desc'.")
        }
        this.sort.push(
            new SortSpec(
                attribute,
                !direction || direction === 'asc'
            )
        );
        return this;
    }

    /**
     * @param page the page number, starting with 1 (0 and 1 both lead to the first page)
     */
    private setPage(page: number = 0)
    {
        page = Math.max(page, 1);
        this.pageOffset = (page - 1) * this.pageLimit;
    }

    private getQueryParameters(): string[]
    {
        let r: string[] = [];
        for (let f of this.filters) {
            if (f instanceof ClassFilterSpec) {
                let ff = <ClassFilterSpec> f;
                r.push('filter['+ff.getClass()+']['+ff.getAttribute()+']='+ff.getValue());
            } else {
                r.push('filter['+f.getAttribute()+']='+f.getValue());
            }
        }
        if (this.include.length > 0) {
            let p = '';
            for (let incl of this.include) {
                if (p !== '') {
                    p += ',';
                }
                p += incl;
            }
            r.push('include='+p);
        }
        if (this.sort.length > 0) {
            let p = '';
            for (let sortSpec of this.sort) {
                if (p !== '') {
                    p += ',';
                }
                if (!sortSpec.getPositiveDirection()) {
                    p += '-';
                }
                p += sortSpec.getAttribute();
            }
            r.push('sort='+p);
        }
        if (this.pageOffset !== null) {
            r.push('page[offset]='+this.pageOffset);
            r.push('page[limit]='+this.pageLimit);
        }
        return r;
    }

    private getParameterString(): string
    {
        let r = '';
        for (let queryParameter of this.getQueryParameters()) {
            if (r === '') {
                r += '?';
            } else {
                r += '&';
            }
            r += queryParameter;
        }
        return r;
    }

    public getAxiosInstance(): AxiosInstance
    {
        return this.axiosInstance;
    }
}