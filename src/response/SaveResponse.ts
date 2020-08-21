import {Model} from "../Model";
import {Response} from "./Response";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";

export class SaveResponse<M extends Model = Model> extends Response
{
    protected readonly model: M | null;

    constructor(
        httpClientResponse: HttpClientResponse,
        modelType: Function,
        responseBody: JsonApiResponseBody
    ) {
        super(undefined, httpClientResponse);
        const data = responseBody.data;
        if (data !== undefined && data !== null)
        {
            const model = new (<any> modelType)();
            model.populateFromResource(responseBody.data);
            this.model = model;
        }
        else
        {
            this.model = null;
        }
    }

    public getModel(): Model | null
    {
        return this.model;
    }

    public getModelId(): string | undefined
    {
        return this.model !== null
            ?
            this.model.getApiId()
            :
            undefined;
    }
}
