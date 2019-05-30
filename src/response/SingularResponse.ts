import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {Resource} from "../Resource";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
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
        const doc: Resource = Array.isArray(data)
            ?
            data[0]
            :
            data;
        if (doc) {
            this.indexAsModel(doc, this.modelType, this.includeTree);
        }
    }

    protected indexRequestedResources(data: Resource|Resource[])
    {
        const doc: Resource = Array.isArray(data)
            ?
            data[0]
            :
            data;
        if (doc) {
            this.indexDoc(doc);
        }
    }

    protected makeDataArray(data: Resource|Resource[]): void
    {
        let doc: Resource = Array.isArray(data)
            ?
            data[0]
            :
            data;
        if (doc) {
            this.data = this.modelIndex.get(doc.type).get(doc.id);
        }
    }
}
