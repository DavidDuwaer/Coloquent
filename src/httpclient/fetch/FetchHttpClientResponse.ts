import {HttpClientResponse} from "../HttpClientResponse";

export class FetchHttpClientResponse implements HttpClientResponse
{
    private data: any;
    private fetchResponse: Response;

    constructor(data: any, fetchResponse: Response) {
        this.data = data;
        this.fetchResponse = fetchResponse;
    }

    getData(): any {
        return this.data;
    }

    getUnderlying(): any {
        return this.fetchResponse;
    }
}
