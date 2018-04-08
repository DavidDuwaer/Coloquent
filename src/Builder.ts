import {Model} from "./Model";
import {FilterSpec} from "./FilterSpec";
import {SortSpec} from "./SortSpec";
import {AxiosError} from "axios";
import {PluralResponse} from "./response/PluralResponse";
import {SingularResponse} from "./response/SingularResponse";
import {Option} from "./Option";
import {PaginationStrategy} from "./PaginationStrategy";
import {OffsetBasedPaginationSpec} from "./paginationspec/OffsetBasedPaginationSpec";
import {PageBasedPaginationSpec} from "./paginationspec/PageBasedPaginationSpec";
import {Query} from "./Query";
import {QueryMethods} from "./QueryMethods";
import {Response} from "./response/Response";
import {HttpClientResponse} from "./httpclient/HttpClientResponse";
import {HttpClient} from "./httpclient/HttpClient";

export class Builder implements QueryMethods
{
    protected modelType: any;

    private httpClient: HttpClient;

    private query: Query;

    /**
     * If true, then this function will in all cases return a SingularResponse. This is used by ToOneRelations, which
     * when queried spawn a Builder with this property set to true.
     */
    private forceSingular: boolean;

    constructor(
        modelType: typeof Model,
        queriedRelationName: string = null,
        baseModelJsonApiType: string = null,
        forceSingular: boolean = false
    ) {
        this.modelType = modelType;
        let modelInstance: Model = (new (<any> modelType)());
        baseModelJsonApiType = baseModelJsonApiType
            ? baseModelJsonApiType
            : modelInstance.getJsonApiType();
        this.query = new Query(baseModelJsonApiType, queriedRelationName);
        this.initPaginationSpec();
        this.httpClient = modelInstance.getHttpClient();
        this.forceSingular = forceSingular;
    }

    public get(page: number = 0): Promise<Response>
    {
        this.query.getPaginationSpec().setPage(page);
        if (this.forceSingular) {
            return <Promise<SingularResponse>> this.getHttpClient()
                .get(this.query.toString())
                .then(
                    (response: HttpClientResponse) => {
                        return new SingularResponse(response, this.modelType, response.getData());
                    },
                    function (response: AxiosError) {
                        throw new Error((<Error> response).message);
                    }
                );
        } else {
            return <Promise<PluralResponse>> this.getHttpClient()
                .get(this.query.toString())
                .then(
                    (response: HttpClientResponse) => {
                        return new PluralResponse(response, this.modelType, response.getData(), page);
                    },
                    function (response: AxiosError) {
                        throw new Error((<Error> response).message);
                    }
                );
        }
    }

    public first(): Promise<SingularResponse>
    {
        this.query.getPaginationSpec().setPageLimit(1);
        return <Promise<SingularResponse>> this.getHttpClient()
            .get(this.query.toString())
            .then(
                (response: HttpClientResponse) => {
                    return new SingularResponse(response, this.modelType, response.getData());
                },
                function (response: AxiosError) {
                    throw new Error((<Error> response).message);
                }
            );
    }

    public find(id: string | number): Promise<SingularResponse>
    {
        this.query.setIdToFind(id);
        return <Promise<SingularResponse>> this.getHttpClient()
            .get(this.query.toString())
            .then(
                (response: HttpClientResponse) => {
                    return new SingularResponse(response, this.modelType, response.getData());
                },
                function (response: AxiosError) {
                    throw new Error((<Error> response).message);
                }
            );
    }

    public where(attribute: string, value: string): Builder
    {
        this.query.addFilter(new FilterSpec(attribute, value));
        return this;
    }

    public with(value: any): Builder
    {
        if (typeof value === 'string') {
            this.query.addInclude(value);
        } else if (Array.isArray(value)) {
            for (let v of value) {
                this.query.addInclude(v);
            }
        } else {
            throw new Error("The argument for 'with' must be a string or an array of strings.");
        }
        return this;
    }

    public orderBy(attribute: string, direction: string = 'asc'): Builder
    {
        if (direction && ['asc', 'desc'].indexOf(direction) === -1) {
            throw new Error("The 'direction' parameter must be string of value 'asc' or 'desc'.")
        }
        this.query.addSort(
            new SortSpec(
                attribute,
                !direction || direction === 'asc'
            )
        );
        return this;
    }

    public option(queryParameter: string, value: string): Builder
    {
        this.query.addOption(
            new Option(queryParameter, value)
        );
        return this;
    }

    private initPaginationSpec(): void
    {
        let paginationStrategy = this.modelType.getPaginationStrategy();
        if (paginationStrategy === PaginationStrategy.OffsetBased) {
            this.query.setPaginationSpec(
                new OffsetBasedPaginationSpec(
                    this.modelType.getPaginationOffsetParamName(),
                    this.modelType.getPaginationLimitParamName(),
                    this.modelType.getPageSize()
                )
            );
        } else if (paginationStrategy === PaginationStrategy.PageBased) {
            this.query.setPaginationSpec(
                new PageBasedPaginationSpec(
                    this.modelType.getPaginationPageNumberParamName(),
                    this.modelType.getPaginationPageSizeParamName(),
                    this.modelType.getPageSize()
                )
            );
        } else {
            throw new Error('Illegal state: Pagination strategy is not set.');
        }
    }

    private getHttpClient(): HttpClient
    {
        return this.httpClient;
    }
}