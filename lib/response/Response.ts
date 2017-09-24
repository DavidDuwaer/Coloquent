
export abstract class Response
{
    private axiosResponse: AxiosResponse;


    public getHttpClientResponse(): AxiosResponse
    {
        return this.axiosResponse;
    }
}