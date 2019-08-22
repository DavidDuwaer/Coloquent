import {FilterSpec} from "./FilterSpec";
import {ClassFilterSpec} from "./ClassFilterSpec";
import {SortSpec} from "./SortSpec";
import {Option} from "./Option";
import {PaginationSpec} from "./paginationspec/PaginationSpec";
import {QueryParam} from "./QueryParam";

export class Query
{
    protected jsonApiType: string;

    protected jsonApiId: string | undefined;

    protected queriedRelationName: string | undefined;

    protected idToFind: string | number;

    protected paginationSpec: PaginationSpec;

    protected include: string[];

    protected filters: FilterSpec[];

    protected options: Option[];

    protected sort: SortSpec[];

    constructor(jsonApiType: string, queriedRelationName: string | undefined = undefined, jsonApiId: string | undefined = undefined)
    {
        this.jsonApiType = jsonApiType;
        this.jsonApiId = jsonApiId;
        this.queriedRelationName = queriedRelationName;
        this.include = [];
        this.filters = [];
        this.options = [];
        this.sort = [];
    }

    protected addFilterParameters(searchParams: QueryParam[]): void
    {
        for (let f of this.filters) {
            if (f instanceof ClassFilterSpec) {
                let ff = <ClassFilterSpec> f;
                searchParams.push(new QueryParam(`filter[${ff.getClass()}][${ff.getAttribute()}]`, ff.getValue()));
            } else {
                searchParams.push(new QueryParam(`filter[${f.getAttribute()}]`, f.getValue()));
            }
        }
    }

    protected addIncludeParameters(searchParams: QueryParam[]): void
    {
        if (this.include.length > 0) {
            let p = '';
            for (let incl of this.include) {
                if (p !== '') {
                    p += ',';
                }
                p += incl;
            }
            searchParams.push(new QueryParam('include', p));
        }
    }

    protected addOptionsParameters(searchParams: QueryParam[]): void
    {
        for (let option of this.options) {
            searchParams.push(new QueryParam(option.getParameter(), option.getValue()));
        }
    }

    protected addPaginationParameters(searchParams: QueryParam[]): void
    {
        for (let param of this.paginationSpec.getPaginationParameters()) {
            searchParams.push(new QueryParam(param.name, param.value));
        }
    }

    protected addSortParameters(searchParams: QueryParam[]): void
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
            searchParams.push(new QueryParam('sort', p));
        }
    }

    public toString(): string
    {
        let relationToFind = '';

        if (!this.jsonApiId) {
            relationToFind = this.queriedRelationName
                ? '/' + this.queriedRelationName
                : '';
        } else {
            relationToFind = this.queriedRelationName
                ? '/' + this.jsonApiId + '/' + this.queriedRelationName
                : '';
        }

        let idToFind: string = this.idToFind
            ? '/' + this.idToFind
            : '';

        let searchParams: QueryParam[] = [];
        this.addFilterParameters(searchParams);
        this.addIncludeParameters(searchParams);
        this.addOptionsParameters(searchParams);
        this.addPaginationParameters(searchParams);
        this.addSortParameters(searchParams);
        let paramString = '';
        for (let searchParam of searchParams) {
            if (paramString === '') {
                paramString += '?';
            } else {
                paramString += '&';
            }
            paramString += encodeURIComponent(searchParam.name) + '=' + encodeURIComponent(searchParam.value);
        }

        return this.jsonApiType + relationToFind + idToFind + paramString;
    }

    public setIdToFind(idToFind: string | number): void
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

    /**
     * Example: When including 'foo.bar, goo', then the include paths are [[foo, bar], [goo]].
     */
    private get includePaths(): string[][]
    {
        return this
            .include
            .map(includePath => includePath.split('.'));
    }

    /**
     * Example: When including 'foo.bar, goo', then the include tree is {foo: {bar: true}, goo: true}.
     */
    public get includeTree(): any
    {
        const tree = {};
        for (let path of this.includePaths) {
            this.includeTreeRecurse(tree, path);
        }
        return tree;
    }

    private includeTreeRecurse(tree: any, path: string[])
    {
        if (path.length === 1) {
            tree[path[0]] = {};
        } else if (path.length > 1) {
            const subtree = {};
            tree[path[0]] = subtree;
            this.includeTreeRecurse(subtree, path.slice(1));
        }
    }
}
