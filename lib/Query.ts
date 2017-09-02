import * as URLSearchParams from 'url-search-params';
import {FilterSpec} from "./FilterSpec";
import {ClassFilterSpec} from "./ClassFilterSpec";
import {SortSpec} from "./SortSpec";
import {Option} from "./Option";
import {PaginationSpec} from "./paginationspec/PaginationSpec";

export class Query
{
    private searchParams: URLSearchParams;

    constructor()
    {
        this.searchParams = new URLSearchParams();
    }

    public setFilterParameters(filters: FilterSpec[]): void
    {
        for (let f of filters) {
            if (f instanceof ClassFilterSpec) {
                let ff = <ClassFilterSpec> f;
                this.searchParams.set(`filter[${ff.getClass()}][${ff.getAttribute()}]`, ff.getValue());
            } else {
                this.searchParams.set(`filter[${f.getAttribute()}]`, f.getValue());
            }
        }
    }

    public setIncludeParameters(include: string[]): void
    {
        if (include.length > 0) {
            let p = '';
            for (let incl of include) {
                if (p !== '') {
                    p += ',';
                }
                p += incl;
            }
            this.searchParams.set('include', p);
        }
    }

    public setOptionsParameters(options: Option[]): void
    {
        for (let option of options) {
            this.searchParams.set(option.getParameter(), option.getValue());
        }
    }

    public setPaginationParameters(paginationSpec: PaginationSpec): void
    {
        for (let param of paginationSpec.getPaginationParameters()) {
            this.searchParams.set(param.name, param.value);
        }
    }

    public setSortParameters(sort: SortSpec[]): void
    {
        if (sort.length > 0) {
            let p = '';
            for (let sortSpec of sort) {
                if (p !== '') {
                    p += ',';
                }
                if (!sortSpec.getPositiveDirection()) {
                    p += '-';
                }
                p += sortSpec.getAttribute();
            }
            this.searchParams.set('sort', p);
        }
    }

    public toString(): string
    {
        return (this.searchParams.toString()) ? '?' + this.searchParams.toString() : '';
    }
}