import {Model} from "./Model";
import {FilterSpec} from "./FilterSpec";
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
import {Query} from "./Query";

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

    private query: Query;

    constructor(modelType: typeof Model)
    {
        this.modelType = modelType;
        this.model = new this.modelType();
        this.filters = [];
        this.options = [];
        this.include = [];
        this.sort = [];
        this.query = new Query();
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

    private getParameterString(): string
    {
        this.query.setFilterParameters(this.filters);
        this.query.setIncludeParameters(this.include);
        this.query.setOptionsParameters(this.options);
        this.query.setPaginationParameters(this.paginationSpec);
        this.query.setSortParameters(this.sort);

        return this.query.toString();
    }
}