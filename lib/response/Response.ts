import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";

export abstract class Response
{
    private axiosResponse: HttpClientResponse;

    constructor(axiosResponse: HttpClientResponse)
    {
        this.axiosResponse = axiosResponse;
    }

    public getHttpClientResponse(): HttpClientResponse
    {
        return this.axiosResponse;
    }
}