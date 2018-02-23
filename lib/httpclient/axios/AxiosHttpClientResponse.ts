import {HttpClientResponse} from "../HttpClientResponse";
import {AxiosResponse} from "axios";

export class AxiosHttpClientResponse implements HttpClientResponse
{
    private axiosResponse: AxiosResponse;

    constructor(axiosResponse: AxiosResponse) {
        this.axiosResponse = axiosResponse;
    }

    getData(): any {
        return this.axiosResponse.data;
    }

    getUnderlying(): any {
        return this.axiosResponse;
    }
}