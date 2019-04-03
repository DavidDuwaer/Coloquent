import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export abstract class Response
{
    private _query: Query | undefined;

    private axiosResponse: HttpClientResponse;

    constructor(
        query: Query | undefined,
        axiosResponse: HttpClientResponse,
    )
    {
        this._query = query;
        this.axiosResponse = axiosResponse;
    }

    public getHttpClientResponse(): HttpClientResponse
    {
        return this.axiosResponse;
    }

    protected get query(): Query | undefined
    {
        return this._query;
    }

    protected get includeTree(): any
    {
        return this.query !== undefined
            ?
                this.query.includeTree
            :
                {};
    }
}
