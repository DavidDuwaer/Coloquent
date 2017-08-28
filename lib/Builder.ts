import {Model} from "./Model";
import {FilterSpec} from "./FilterSpec";
import {ClassFilterSpec} from "./ClassFilterSpec";
import {SortSpec} from "./SortSpec";
import {AxiosResponse, AxiosError, AxiosInstance} from "axios";
import {PluralResponse} from "./PluralResponse";
import {SingularResponse} from "./SingularResponse";
import {Promise} from 'es6-promise';
import axios from 'axios';
import {Option} from "./Option";
import {PaginationStrategy} from "./PaginationStrategy";
import {PaginationSpec} from "./paginationspec/PaginationSpec";
import {OffsetBasedPaginationSpec} from "./paginationspec/OffsetBasedPaginationSpec";
import {PageBasedPaginationSpec} from "./paginationspec/PageBasedPaginationSpec";

export class Builder
{
    protected model: Model;

    protected modelType: any;

    protected filters: FilterSpec[];

    protected options: Option[];

    protected include: string[];

    protected sort: SortSpec[];

    protected paginationSpec: PaginationSpec;

    private axiosInstance;

    constructor(modelType: typeof Model)
    {
        this.modelType = modelType;
        this.model = new this.modelType();
        this.filters = [];
        this.options = [];
        this.include = [];
        this.sort = [];
        this.initPaginationSpec();
        this.axiosInstance = axios.create({
            baseURL: this.model.getJsonApiBaseUrl(),
            withCredentials: true
        });
    }

    public get(page: number = 0): Promise<PluralResponse>
    {
        let thiss = this;
        this.paginationSpec.setPage(page);
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
        this.paginationSpec.setPageLimit(1);
        return <Promise<SingularResponse>> this.getAxiosInstance()
            .get(this.model.getJsonApiType()+this.getParameterString())
            .then(
                function (response: AxiosResponse) {
                    return new SingularResponse(thiss.modelType, response.data);
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

    public getAxiosInstance(): AxiosInstance
    {
        return this.axiosInstance;
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
        if (direction && ['asc', 'desc'].indexOf(direction) === -1) {
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

    public option(queryParameter: string, value: string): Builder
    {
        this.options.push(
            new Option(queryParameter, value)
        );
        return this;
    }

    private initPaginationSpec(): void
    {
        switch (this.modelType.getPaginationStrategy()) {
            case PaginationStrategy.OffsetBased:
                this.paginationSpec = new OffsetBasedPaginationSpec(
                    this.modelType.getPaginationOffsetParamName(),
                    this.modelType.getPaginationLimitParamName(),
                    this.modelType.getPageSize()
                );
                break;

            case PaginationStrategy.PageBased:
                this.paginationSpec = new PageBasedPaginationSpec(
                    this.modelType.getPaginationPageNumberParamName(),
                    this.modelType.getPaginationPageSizeParamName(),
                    this.modelType.getPageSize()
                );
                break;
        }
    }

    private getQueryParameters(): string[]
    {
        let parameters: string[] = [];

        parameters = parameters.concat(this.getFilterParameters());
        parameters = parameters.concat(this.getIncludeParameters());
        parameters = parameters.concat(this.getSortParameters());
        parameters = parameters.concat(this.getOptionsParameters());
        parameters = parameters.concat(this.paginationSpec.getPaginationParameters());

        return parameters;
    }

    private getOptionsParameters(): string[]
    {
        let parameters: string[] = [];

        for (let option of this.options) {
            parameters.push(option.getParameter() + '=' + option.getValue());
        }

        return parameters;
    }

    private getSortParameters(): string[]
    {
        let parameters: string[] = [];

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
            parameters.push('sort=' + p);
        }

        return parameters;
    }

    private getIncludeParameters(): string[]
    {
        let parameters: string[] = [];

        if (this.include.length > 0) {
            let p = '';
            for (let incl of this.include) {
                if (p !== '') {
                    p += ',';
                }
                p += incl;
            }
            parameters.push('include=' + p);
        }

        return parameters;
    }

    private getFilterParameters(): string[]
    {
        let parameters: string[] = [];

        for (let f of this.filters) {
            if (f instanceof ClassFilterSpec) {
                let ff = <ClassFilterSpec> f;
                parameters.push('filter[' + ff.getClass() + '][' + ff.getAttribute() + ']=' + ff.getValue());
            } else {
                parameters.push('filter[' + f.getAttribute() + ']=' + f.getValue());
            }
        }

        return parameters;
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