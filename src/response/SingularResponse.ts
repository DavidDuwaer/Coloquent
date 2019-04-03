import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {Resource} from "../Resource";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export class SingularResponse extends RetrievalResponse
{
    protected data: Model;

    constructor(
        query: Query,
        httpClientResponse: HttpClientResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody
    ) {
        super(query, httpClientResponse, modelType, responseBody);
    }

    public getData(): Model
    {
        return this.data;
    }

    protected makeModelIndex(data: Resource|Resource[]): void
    {
        let doc: Resource = null;
        if (Array.isArray(data)) {
            doc = data[0];
        } else {
            doc = data;
        }
        if (doc) {
            this.indexAsModel(doc, this.modelType, this.includeTree);
        }
    }

    protected indexRequestedResources(data: Resource|Resource[])
    {
        let doc: Resource = null;
        if (Array.isArray(data)) {
            doc = data[0];
        } else {
            doc = data;
        }
        if (doc) {
            this.indexDoc(doc);
        }
    }

    protected makeDataArray(data: Resource|Resource[]): void
    {
        let doc: Resource = null;
        if (Array.isArray(data)) {
            doc = data[0];
        } else {
            doc = data;
        }
        if (doc) {
            this.data = this.modelIndex.get(doc.type).get(doc.id);
        }
    }
}
