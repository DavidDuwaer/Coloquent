import {AxiosResponse} from "axios";

export abstract class Response
{
    private axiosResponse: AxiosResponse;

    constructor(axiosResponse: AxiosResponse)
    {
        this.axiosResponse = axiosResponse;
    }

    public getHttpClientResponse(): AxiosResponse
    {
        return this.axiosResponse;
    }
}