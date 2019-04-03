import {Model} from "../Model";
import {Resource} from "../Resource";
import {Response} from "./Response";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export class SaveResponse extends Response
{
    protected model: Model;

    constructor(
        httpClientResponse: HttpClientResponse,
        modelType: Function,
        responseBody: JsonApiResponseBody
    ) {
        super(undefined, httpClientResponse);
        let modelTypeUntyped: any = modelType; // Do this to shut IDE up about not being able to instantiate
                                               // abstract classes
        this.model = new (<any> modelType)();
        this.model.populateFromResource(responseBody.data);
    }

    public getModel(): Model
    {
        return this.model;
    }

    public getModelId(): string
    {
        return this.model.getApiId();
    }
}
