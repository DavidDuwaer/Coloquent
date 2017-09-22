import * as URLSearchParams from 'url-search-params';
import {FilterSpec} from "./FilterSpec";
import {ClassFilterSpec} from "./ClassFilterSpec";
import {SortSpec} from "./SortSpec";
import {Option} from "./Option";
import {PaginationSpec} from "./paginationspec/PaginationSpec";

export class Query
{
    protected jsonApiType: string;

    protected idToFind: number;

    protected paginationSpec: PaginationSpec;

    protected include: string[];

    protected filters: FilterSpec[];

    protected options: Option[];

    protected sort: SortSpec[];

    constructor(jsonApiType: string)
    {
        this.jsonApiType = jsonApiType;
        this.include = [];
        this.filters = [];
        this.options = [];
        this.sort = [];
    }

    protected addFilterParameters(searchParams: URLSearchParams): void
    {
        for (let f of this.filters) {
            if (f instanceof ClassFilterSpec) {
                let ff = <ClassFilterSpec> f;
                searchParams.set(`filter[${ff.getClass()}][${ff.getAttribute()}]`, ff.getValue());
            } else {
                searchParams.set(`filter[${f.getAttribute()}]`, f.getValue());
            }
        }
    }

    protected addIncludeParameters(searchParams: URLSearchParams): void
    {
        if (this.include.length > 0) {
            let p = '';
            for (let incl of this.include) {
                if (p !== '') {
                    p += ',';
                }
                p += incl;
            }
            searchParams.set('include', p);
        }
    }

    protected addOptionsParameters(searchParams: URLSearchParams): void
    {
        for (let option of this.options) {
            searchParams.set(option.getParameter(), option.getValue());
        }
    }

    protected addPaginationParameters(searchParams: URLSearchParams): void
    {
        for (let param of this.paginationSpec.getPaginationParameters()) {
            searchParams.set(param.name, param.value);
        }
    }

    protected addSortParameters(searchParams: URLSearchParams): void
    {
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
            searchParams.set('sort', p);
        }
    }

    public toString(): string
    {
        let idToFind: string = this.idToFind
            ? '/' + this.idToFind
            : '';

        let searchParams: URLSearchParams = new URLSearchParams();
        this.addFilterParameters(searchParams);
        this.addIncludeParameters(searchParams);
        this.addOptionsParameters(searchParams);
        this.addPaginationParameters(searchParams);
        this.addSortParameters(searchParams);

        let params: string = searchParams.toString()
            ? '?' + searchParams.toString()
            : '';
        return this.jsonApiType + idToFind + params;
    }

    public setIdToFind(idToFind: number): void
    {
        this.idToFind = idToFind;
    }

    public getPaginationSpec(): PaginationSpec
    {
        return this.paginationSpec;
    }

    public setPaginationSpec(paginationSpec: PaginationSpec): void
    {
        this.paginationSpec = paginationSpec;
    }

    public addInclude(includeSpec: string): void
    {
        this.include.push(includeSpec);
    }

    public addFilter(filter: FilterSpec): void
    {
        this.filters.push(filter);
    }

    public addSort(sort: SortSpec): void
    {
        this.sort.push(sort);
    }

    public addOption(option: Option): void
    {
        this.options.push(option);
    }
}