import {Model} from "./Model";
import {FilterSpec} from "./FilterSpec";
import {ClassFilterSpec} from "./ClassFilterSpec";
import {SortSpec} from "./SortSpec";
import {AxiosResponse, AxiosError} from "axios";
import {PluralWorpResponse} from "./PluralWorpResponse";
import {SingularWorpResponse} from "./SingularWorpResponse";

export class Builder<T extends Model>
{
    protected model: Model;

    protected T;

    protected filters: FilterSpec[];

    protected include: string[];

    protected sort: SortSpec[];

    protected pageOffset: number;

    protected pageLimit: number;

    constructor(model: Model)
    {
        this.model = model;
        this.T = typeof model;
        this.filters = [];
        this.include = [];
        this.sort = [];
        this.pageOffset = 0;
        this.pageLimit = model.getPageSize();
    }

    public get(page: number = 0): Promise<PluralWorpResponse<T>>
    {
        let thiss = this;
        this.setPage(page);
        return this.model.getAxiosInstance()
            .get(this.model.getJsonApiType()+this.getParameterString())
            .then(
                function (response: AxiosResponse) {
                    return new PluralWorpResponse(thiss.model, response.data);
                },
                function (response: AxiosError) {
                    throw new Error(response.message);
                }
            );
    }

    public find(id: number): Promise<SingularWorpResponse<T>>
    {
        let thiss = this;
        return this.model.getAxiosInstance()
            .get(this.model.getJsonApiType()+'/'+id+this.getParameterString())
            .then(
                function (response: AxiosResponse) {
                    return new SingularWorpResponse(thiss.model, response.data);
                },
                function (response: AxiosError) {
                    throw new Error(response.message);
                }
            );
    }

    public where(attribute: string, value: string): Builder<T>
    {
        this.filters.push(new FilterSpec(attribute, value));
        return this;
    }

    public with(value: any): Builder<T>
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

    public orderBy(attribute: string, direction: string): Builder<T>
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
                r.push('filter['+f.getClass()+']['+f.getAttribute()+']='+f.getValue());
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
        r.push('page[offset]='+this.pageOffset);
        r.push('page[limit]='+this.pageLimit);
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
}